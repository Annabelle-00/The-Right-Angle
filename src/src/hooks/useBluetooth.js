import { useState, useRef, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { BLE_UART_SERVICE_UUID, BLE_UART_TX_CHARACTERISTIC_UUID } from '@/lib/constants';

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAY_MS = 2000;

export const useBluetooth = ({ 
  processIncomingData, 
  onConnectionChange 
}) => {
  const [bleDevice, setBleDevice] = useState(null);
  const bleServerRef = useRef(null);
  const bleTxCharacteristicRef = useRef(null);
  const reconnectAttemptsRef = useRef(0);
  const textDecoderRef = useRef(new TextDecoder('utf-8'));

  const handleCharacteristicValueChanged = useCallback((event) => {
    const value = textDecoderRef.current.decode(event.target.value);
    const lines = value.split(/[\r\n]+/);
    lines.forEach(line => {
      if (line.trim() !== "") {
        processIncomingData(line.trim());
      }
    });
  }, [processIncomingData]);

  const handleBleDisconnectCleanup = useCallback(async (informUser = true) => {
    const localBleTxChar = bleTxCharacteristicRef.current;
    const localBleDevice = bleDevice;

    bleTxCharacteristicRef.current = null;
    bleServerRef.current = null;
    
    if (localBleTxChar && localBleDevice?.gatt?.connected) {
      localBleTxChar.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      try {
        if (localBleTxChar.stopNotifications) {
          await localBleTxChar.stopNotifications();
        }
      } catch (e) {
        console.warn("Error stopping notifications on cleanup: ", e.message);
      }
    }
    
    if (localBleDevice) {
      localBleDevice.removeEventListener('gattserverdisconnected', onBleDisconnected);
      if (localBleDevice.gatt && localBleDevice.gatt.connected) {
        localBleDevice.gatt.disconnect();
      }
    }
    
    setBleDevice(null);
    onConnectionChange(false, null, false);
    reconnectAttemptsRef.current = 0;
    if (informUser) {
      toast({ title: "Bluetooth Disconnected", description: "Connection closed." });
    }
  }, [bleDevice, onConnectionChange, handleCharacteristicValueChanged]);


  const attemptBleReconnect = useCallback(async () => {
    if (!bleDevice || reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      toast({ title: "BLE Reconnect Failed", description: "Max attempts reached. Please reconnect manually.", variant: "destructive"});
      await handleBleDisconnectCleanup(false);
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
      
      onConnectionChange(true, 'ble', true);
      reconnectAttemptsRef.current = 0; 
      toast({ title: "Bluetooth Reconnected! 📡", description: "Receiving data from Arduino." });
    } catch (error) {
      console.error(`BLE Reconnect attempt ${reconnectAttemptsRef.current} failed:`, error);
      setTimeout(attemptBleReconnect, RECONNECT_DELAY_MS);
    }
  }, [bleDevice, handleBleDisconnectCleanup, onConnectionChange, handleCharacteristicValueChanged]);

  const onBleDisconnected = useCallback(async (event) => {
    toast({ title: "Bluetooth Disconnected", description: `Device ${event.target.name || 'Unknown'} connection lost. Attempting to reconnect...`, variant: "destructive" });
    
    if (bleTxCharacteristicRef.current) {
      bleTxCharacteristicRef.current.removeEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
      try {
         if (bleTxCharacteristicRef.current.stopNotifications && bleTxCharacteristicRef.current.service?.device?.gatt?.connected) {
            await bleTxCharacteristicRef.current.stopNotifications();
         }
      } catch (e) {
        console.warn("Error stopping notifications during disconnect: ", e.message);
      }
      bleTxCharacteristicRef.current = null;
    }
    bleServerRef.current = null;

    onConnectionChange(false, null, false);

    if (bleDevice) { 
        reconnectAttemptsRef.current = 0;
        setTimeout(attemptBleReconnect, RECONNECT_DELAY_MS);
    } else {
        await handleBleDisconnectCleanup(false);
    }
  }, [bleDevice, attemptBleReconnect, handleBleDisconnectCleanup, onConnectionChange, handleCharacteristicValueChanged]);

  const connectToBle = async () => {
    if (!navigator.bluetooth) {
      toast({ title: "Web Bluetooth Not Supported", description: "Try Chrome or Edge on a compatible OS.", variant: "destructive" });
      return;
    }
    try {
      toast({ title: "Requesting Bluetooth Device...", description: "Please select 'PotUART' or your UART device." });
      const deviceOptions = {
        filters: [
          { services: [BLE_UART_SERVICE_UUID] },
          { name: 'PotUART' },
          { namePrefix: 'UART' }
        ],
        optionalServices: [BLE_UART_SERVICE_UUID]
      };
      const device = await navigator.bluetooth.requestDevice(deviceOptions);
      
      setBleDevice(device);
      device.removeEventListener('gattserverdisconnected', onBleDisconnected);
      device.addEventListener('gattserverdisconnected', onBleDisconnected);

      toast({ title: "Connecting to GATT Server...", description: `Device: ${device.name || device.id}` });
      if (!device.gatt) {
        toast({ title: "GATT Server Not Found", description: "Selected device lacks GATT server.", variant: "destructive" });
        await handleBleDisconnectCleanup(false);
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
      
      onConnectionChange(true, 'ble', true);
      reconnectAttemptsRef.current = 0;
      toast({ title: "Bluetooth Connected! 📡", description: `Successfully connected to ${device.name || device.id}.` });

    } catch (error) {
      console.error('BLE connection failed:', error);
      toast({ title: "Bluetooth Connection Failed", description: error.message || "Unknown error.", variant: "destructive" });
      await handleBleDisconnectCleanup(false);
    }
  };

  const disconnectBle = useCallback(async () => {
    await handleBleDisconnectCleanup(true);
  }, [handleBleDisconnectCleanup]);


  return {
    connectToBle,
    disconnectBle,
    bleDevice,
  };
};
