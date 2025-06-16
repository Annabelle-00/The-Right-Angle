import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import { Gauge } from 'lucide-react';

import GaugeDisplay from '@/components/GaugeDisplay';
import ConnectionStatus from '@/components/ConnectionStatus';
import DataDisplay from '@/components/DataDisplay';
import ControlsPanel from '@/components/ControlsPanel';

import { BLE_UART_SERVICE_UUID, BLE_UART_TX_CHARACTERISTIC_UUID } from '@/lib/constants';

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 2000;

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState(null);
  const [potValue, setPotValue] = useState(0);
  const [angle, setAngle] = useState(0);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(1023);
  
  const [serialPort, setSerialPort] = useState(null);
  const [serialReader, setSerialReader] = useState(null);
  
  const [bleDevice, setBleDevice] = useState(null);
  const bleServerRef = useRef(null); 
  const bleTxCharacteristicRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);

  const [isReading, setIsReading] = useState(false);
  const [history, setHistory] = useState([]);
  const demoIntervalRef = useRef(null);
  const textDecoderRef = useRef(new TextDecoder('utf-8'));

  const processIncomingData = useCallback((rawValue) => {
    const trimmed = String(rawValue).trim();
    if (trimmed && !isNaN(trimmed)) {
      const newValue = parseInt(trimmed, 10);
      if (newValue >= minValue && newValue <= maxValue) {
         setPotValue(newValue);
         const currentAngle = convertToAngle(newValue, minValue, maxValue);
         setAngle(currentAngle);
         setHistory(prev => {
           const newHistory = [...prev, { value: newValue, angle: currentAngle, timestamp: Date.now() }];
           return newHistory.slice(-50);
         });
      } else if (newValue >= 0 && newValue <= 1023) {
        setPotValue(newValue);
        const currentAngle = convertToAngle(newValue, 0, 1023);
        setAngle(currentAngle);
         setHistory(prev => {
           const newHistory = [...prev, { value: newValue, angle: currentAngle, timestamp: Date.now() }];
           return newHistory.slice(-50);
         });
      }
    }
  }, [minValue, maxValue]);

  const convertToAngle = (value, currentMin, currentMax) => {
    if (currentMax === currentMin) return 0; 
    const normalizedValue = Math.max(0, Math.min(1, (value - currentMin) / (currentMax - currentMin)));
    return Math.round(normalizedValue * 360);
  };
  
  useEffect(() => {
    setAngle(convertToAngle(potValue, minValue, maxValue));
  }, [potValue, minValue, maxValue]);

  const simulateArduinoData = () => {
    const baseValue = 512 + Math.sin(Date.now() / 1000) * 400;
    const noise = (Math.random() - 0.5) * 50;
    const newValue = Math.max(0, Math.min(1023, Math.round(baseValue + noise)));
    processIncomingData(newValue);
  };

  const connectToSerial = async () => {
    if (!navigator.serial) {
      toast({ title: "Web Serial Not Supported", description: "Try Chrome or Edge.", variant: "destructive" });
      return;
    }
    try {
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      setSerialPort(port);
      
      const textDecoderStream = new TextDecoderStream();
      port.readable.pipeTo(textDecoderStream.writable);
      const readerInstance = textDecoderStream.readable.getReader();
      setSerialReader(readerInstance);
      
      setIsConnected(true);
      setConnectionMethod('serial');
      setIsReading(true);
      toast({ title: "Serial Connected! 🎉", description: "Receiving data from Arduino." });
      readSerialData(readerInstance);
    } catch (error) {
      console.error('Serial connection failed:', error);
      toast({ title: "Serial Connection Failed", description: error.message, variant: "destructive" });
      await handleSerialDisconnectCleanup();
    }
  };

  const readSerialData = async (reader) => {
    try {
      while (true) {
        if (!isReading || !serialPort) break; // Guard against reading after disconnect
        const { value, done } = await reader.read();
        if (done) break;
        const lines = value.split('\n');
        lines.forEach(line => processIncomingData(line));
      }
    } catch (error) {
       if (isReading && serialPort) { // Only error if we are supposed to be connected
        console.error('Serial reading error:', error);
        toast({ title: "Serial Reading Error", description: "Lost connection or data error.", variant: "destructive" });
        await handleSerialDisconnectCleanup();
       }
    } finally {
      // If loop exits and we were meant to be reading, it implies a disconnect
      if (isReading && serialPort) {
        await handleSerialDisconnectCleanup();
      }
    }
  };
  
  const handleCharacteristicValueChanged = (event) => {
    const value = textDecoderRef.current.decode(event.target.value);
    const lines = value.split(/[\r\n]+/);
    lines.forEach(line => {
      if (line.trim() !== "") {
        processIncomingData(line.trim());
      }
    });
  };

  const attemptBleReconnect = async () => {
    if (!bleDevice || reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      toast({ title: "BLE Reconnect Failed", description: "Max attempts reached. Please reconnect manually.", variant: "destructive"});
      await handleBleDisconnectCleanup(); // Full cleanup if reconnect fails permanently
      return;
    }

    reconnectAttemptsRef.current += 1;
    toast({ title: "BLE Reconnecting...", description: `Attempt ${reconnectAttemptsRef.current} of ${MAX_RECONNECT_ATTEMPTS}.`});

    try {
      const server = await bleDevice.gatt.connect();
      bleServerRef.current = server;
      const service = await server.getPrimaryService(BLE_UART_SERVICE_UUID);
      const characteristic = await service.getCharacteristic(BLE_UART_TX_CHARACTERISTIC_UUID);
      bleTxCharacteristicRef.current = characteristic;
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      
      setIsConnected(true);
      setConnectionMethod('ble');
      setIsReading(true);
      reconnectAttemptsRef.current = 0; // Reset on success
      toast({ title: "Bluetooth Reconnected! 📡", description: "Receiving data from Arduino." });
    } catch (error) {
      console.error(`BLE Reconnect attempt ${reconnectAttemptsRef.current} failed:`, error);
      setTimeout(attemptBleReconnect, RECONNECT_DELAY_MS);
    }
  };

  const onBleDisconnected = async (event) => {
    toast({ title: "Bluetooth Disconnected", description: `Device ${event.target.name || 'Unknown'} connection lost. Attempting to reconnect...`, variant: "destructive" });
    
    // Preliminary cleanup, keep device object for reconnect attempt
    if (bleTxCharacteristicRef.current) {
      bleTxCharacteristicRef.current.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      try {
        if (bleTxCharacteristicRef.current.stopNotifications && bleTxCharacteristicRef.current.service.device.gatt.connected) {
          await bleTxCharacteristicRef.current.stopNotifications();
        }
      } catch (e) {
        console.warn("Error stopping notifications during disconnect: ", e.message);
      }
      bleTxCharacteristicRef.current = null;
    }
    bleServerRef.current = null; // GATT server is no longer valid

    setIsConnected(false);
    setConnectionMethod(null); 
    setIsReading(false);

    if (bleDevice) { // Only attempt reconnect if we still have a device object
        reconnectAttemptsRef.current = 0; // Reset attempts for a new disconnect event
        setTimeout(attemptBleReconnect, RECONNECT_DELAY_MS);
    } else {
        await handleBleDisconnectCleanup(); // Full cleanup if no device to reconnect to
    }
  };
  
  const connectToBle = async () => {
    if (!navigator.bluetooth) {
      toast({ title: "Web Bluetooth Not Supported", description: "Try Chrome or Edge on a compatible OS.", variant: "destructive" });
      return;
    }
    try {
      toast({ title: "Requesting Bluetooth Device...", description: "Please select 'PotUART' or your UART device." });
      const device = await navigator.bluetooth.requestDevice({
        filters: [
          { services: [BLE_UART_SERVICE_UUID] },
          { name: 'PotUART' },
          { namePrefix: 'UART' }
        ],
        optionalServices: [BLE_UART_SERVICE_UUID] 
      });
      
      setBleDevice(device);
      device.removeEventListener('gattserverdisconnected', onBleDisconnected); // Remove old listener if any
      device.addEventListener('gattserverdisconnected', onBleDisconnected);

      toast({ title: "Connecting to GATT Server...", description: `Device: ${device.name || device.id}` });
      if (!device.gatt) {
        toast({ title: "GATT Server Not Found", description: "The selected device does not have a GATT server.", variant: "destructive" });
        await handleBleDisconnectCleanup();
        return;
      }
      
      const server = await device.gatt.connect();
      bleServerRef.current = server;

      toast({ title: "Fetching UART Service...", description: "Almost there!" });
      const service = await server.getPrimaryService(BLE_UART_SERVICE_UUID);
      
      toast({ title: "Fetching TX Characteristic...", description: "Finalizing connection..." });
      const characteristic = await service.getCharacteristic(BLE_UART_TX_CHARACTERISTIC_UUID);
      bleTxCharacteristicRef.current = characteristic;
      
      await characteristic.startNotifications();
      characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      
      setIsConnected(true);
      setConnectionMethod('ble');
      setIsReading(true);
      reconnectAttemptsRef.current = 0; // Reset reconnect attempts on successful new connection
      toast({ title: "Bluetooth Connected! 📡", description: `Successfully connected to ${device.name || device.id}.` });

    } catch (error) {
      console.error('BLE connection failed:', error);
      toast({ title: "Bluetooth Connection Failed", description: error.message || "Unknown error occurred.", variant: "destructive" });
      await handleBleDisconnectCleanup();
    }
  };

  const handleBleDisconnectCleanup = async () => {
    const localBleTxChar = bleTxCharacteristicRef.current;
    const localBleServer = bleServerRef.current;
    const localBleDevice = bleDevice;

    bleTxCharacteristicRef.current = null;
    bleServerRef.current = null;
    setBleDevice(null);

    if (localBleTxChar) {
      localBleTxChar.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      if (localBleTxChar.stopNotifications && localBleDevice?.gatt?.connected) {
         try {
            await localBleTxChar.stopNotifications();
         } catch (e) {
            console.warn("Error stopping notifications on cleanup: ", e.message);
         }
      }
    }
    
    if (localBleDevice) {
        localBleDevice.removeEventListener('gattserverdisconnected', onBleDisconnected);
        if (localBleDevice.gatt && localBleDevice.gatt.connected) {
            localBleDevice.gatt.disconnect();
        }
    }

    setIsConnected(false);
    setConnectionMethod(null);
    setIsReading(false);
    reconnectAttemptsRef.current = 0;
  };

  const handleSerialDisconnectCleanup = async () => {
    if (serialReader) {
      try {
        await serialReader.cancel();
      } catch(e) { console.warn("Error cancelling serial reader:", e); }
      setSerialReader(null);
    }
    if (serialPort) {
      try {
        await serialPort.close();
      } catch(e) { console.warn("Error closing serial port:", e); }
      setSerialPort(null);
    }
    setIsConnected(false);
    setConnectionMethod(null);
    setIsReading(false);
  };

  const disconnect = async () => {
    setIsReading(false); 

    if (connectionMethod === 'serial' && serialPort) {
      await handleSerialDisconnectCleanup();
    } else if (connectionMethod === 'ble') {
      await handleBleDisconnectCleanup();
    } else if (connectionMethod === 'demo' && demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
      setIsConnected(false);
      setConnectionMethod(null);
    }
    
    if (isConnected || connectionMethod) { // Only toast if there was an active connection
      toast({ title: "Disconnected", description: "Connection closed." });
    }
  };

  const startDemo = () => {
    disconnect(); // Ensure any existing connection is closed
    setIsConnected(true);
    setConnectionMethod('demo');
    setIsReading(true);
    demoIntervalRef.current = setInterval(simulateArduinoData, 100);
    toast({ title: "Demo Mode Started! 🚀", description: "Simulating Arduino data." });
  };

  const resetCalibration = () => {
    setMinValue(0);
    setMaxValue(1023);
    setHistory([]);
    toast({ title: "Calibration Reset", description: "Min/Max values reset to default (0-1023)." });
  };

  const calibrateRange = () => {
    if (history.length < 10) {
      toast({ title: "Insufficient Data", description: "Need at least 10 readings for calibration.", variant: "destructive" });
      return;
    }
    const values = history.map(h => h.value);
    const newMin = Math.min(...values);
    const newMax = Math.max(...values);
    if (newMin === newMax) {
      toast({ title: "Calibration Error", description: "Min and Max values are the same. Please provide varying data.", variant: "destructive" });
      return;
    }
    setMinValue(newMin);
    setMaxValue(newMax);
    toast({ title: "Calibration Complete! ✨", description: `Range set to ${newMin} - ${newMax}.` });
  };

  useEffect(() => {
    return () => { // Cleanup on component unmount
      disconnect(); // Universal disconnect
    };
  }, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 text-white">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Arduino Potentiometer Angle Converter
          </h1>
          <p className="text-gray-400">Real-time potentiometer value to angle conversion</p>
        </motion.div>

        <ConnectionStatus
          isConnected={isConnected}
          connectionMethod={connectionMethod}
          onConnectSerial={connectToSerial}
          onConnectBle={connectToBle}
          onStartDemo={startDemo}
          onDisconnect={disconnect}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
          >
            <div className="text-center">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center justify-center">
                <Gauge className="w-5 h-5 mr-2" />
                Angle Gauge
              </h3>
              <div className="flex justify-center">
                <GaugeDisplay value={angle} max={360} size={200} />
              </div>
            </div>
          </motion.div>

          <DataDisplay
            potValue={potValue}
            angle={angle}
            minValue={minValue}
            maxValue={maxValue}
            historyLength={history.length}
          />
        </div>

        <ControlsPanel
          minValue={minValue}
          maxValue={maxValue}
          onMinValueChange={(val) => setMinValue(isNaN(parseInt(val)) ? 0 : parseInt(val))}
          onMaxValueChange={(val) => setMaxValue(isNaN(parseInt(val)) ? 1023 : parseInt(val))}
          onCalibrate={calibrateRange}
          onReset={resetCalibration}
        />

        <AnimatePresence>
          {isConnected && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed bottom-4 right-4 bg-blue-600/20 backdrop-blur-lg rounded-lg p-3 border border-blue-500/30"
            >
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full connection-pulse"></div>
                <span className="text-blue-400 text-sm">Live Data Stream Active ({connectionMethod})</span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <Toaster />
    </div>
  );
}

export default App;