import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';
import { Gauge } from 'lucide-react';

import GaugeDisplay from '@/components/GaugeDisplay';
import ConnectionStatus from '@/components/ConnectionStatus';
import DataDisplay from '@/components/DataDisplay';
import ControlsPanel from '@/components/ControlsPanel';
import { useBluetooth } from '@/hooks/useBluetooth';

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionMethod, setConnectionMethod] = useState(null);
  const [potValue, setPotValue] = useState(0);
  const [angle, setAngle] = useState(0);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(1023);
  
  const [serialPort, setSerialPort] = useState(null);
  const [serialReader, setSerialReader] = useState(null);
  
  const [isReading, setIsReading] = useState(false);
  const [history, setHistory] = useState([]);
  const demoIntervalRef = useRef(null);

  const processIncomingData = useCallback((rawValue) => {
    const trimmed = String(rawValue).trim();
    if (trimmed && !isNaN(trimmed)) {
      const newValue = parseInt(trimmed, 10);
      let currentMin = minValue;
      let currentMax = maxValue;

      if (!(newValue >= minValue && newValue <= maxValue) && (newValue >= 0 && newValue <= 1023)) {
        currentMin = 0;
        currentMax = 1023;
      }
      
      setPotValue(newValue);
      const newAngle = convertToAngle(newValue, currentMin, currentMax);
      setAngle(newAngle);
      setHistory(prev => {
        const newHistory = [...prev, { value: newValue, angle: newAngle, timestamp: Date.now() }];
        return newHistory.slice(-50);
      });
    }
  }, [minValue, maxValue]);

  const handleConnectionChange = useCallback((connected, method, reading) => {
    setIsConnected(connected);
    setConnectionMethod(method);
    setIsReading(reading);
  }, []);

  const { 
    connectToBle: initiateBleConnection, 
    disconnectBle 
  } = useBluetooth({ processIncomingData, onConnectionChange: handleConnectionChange });


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

  const handleSerialDisconnectCleanup = useCallback(async (informUser = true) => {
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
    if (informUser) {
     toast({ title: "Serial Disconnected", description: "Connection closed." });
    }
  }, [serialPort, serialReader]);

  const readSerialData = useCallback(async (reader) => {
    try {
      while (true) {
        if (!isReading || !serialPort || !reader) break;
        const { value, done } = await reader.read();
        if (done) break;
        const lines = value.split('\n');
        lines.forEach(line => processIncomingData(line));
      }
    } catch (error) {
       if (isReading && serialPort) {
        console.error('Serial reading error:', error);
        toast({ title: "Serial Reading Error", description: "Lost connection or data error.", variant: "destructive" });
        await handleSerialDisconnectCleanup(false); 
       }
    } finally {
      if (isReading && serialPort && reader) { 
        await handleSerialDisconnectCleanup(false);
      }
    }
  }, [isReading, serialPort, processIncomingData, handleSerialDisconnectCleanup]);
  
  const connectToSerial = async () => {
    if (!navigator.serial) {
      toast({ title: "Web Serial Not Supported", description: "Try Chrome or Edge.", variant: "destructive" });
      return;
    }
    try {
      await disconnect(); 
      const port = await navigator.serial.requestPort();
      await port.open({ baudRate: 9600 });
      setSerialPort(port);
      
      const textDecoderStream = new TextDecoderStream();
      port.readable.pipeTo(textDecoderStream.writable);
      const readerInstance = textDecoderStream.readable.getReader();
      setSerialReader(readerInstance);
      
      handleConnectionChange(true, 'serial', true);
      toast({ title: "Serial Connected! 🎉", description: "Receiving data from Arduino." });
      readSerialData(readerInstance);
    } catch (error) {
      console.error('Serial connection failed:', error);
      toast({ title: "Serial Connection Failed", description: error.message, variant: "destructive" });
      await handleSerialDisconnectCleanup(false);
    }
  };
  
  const disconnect = useCallback(async () => {
    setIsReading(false); 

    if (connectionMethod === 'serial' && serialPort) {
      await handleSerialDisconnectCleanup(true);
    } else if (connectionMethod === 'ble') {
      await disconnectBle(); 
    } else if (connectionMethod === 'demo' && demoIntervalRef.current) {
      clearInterval(demoIntervalRef.current);
      demoIntervalRef.current = null;
      setIsConnected(false);
      setConnectionMethod(null);
      toast({ title: "Demo Disconnected", description: "Demo mode stopped." });
    }
  }, [connectionMethod, serialPort, handleSerialDisconnectCleanup, disconnectBle]);

  const startDemo = async () => {
    await disconnect(); 
    handleConnectionChange(true, 'demo', true);
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
    return () => { 
      disconnect();
    };
  }, [disconnect]);


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
          onConnectBle={initiateBleConnection}
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