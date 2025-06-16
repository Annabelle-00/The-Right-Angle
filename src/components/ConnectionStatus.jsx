
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Wifi, WifiOff, Zap, ZapOff, Activity, Bluetooth, BluetoothConnected, BluetoothOff as BluetoothDisconnectedIcon } from 'lucide-react';

const ConnectionStatus = ({ 
  isConnected, 
  connectionMethod,
  onConnectSerial, 
  onConnectBle,
  onStartDemo, 
  onDisconnect 
}) => {
  const getIcon = () => {
    if (!isConnected) return <BluetoothDisconnectedIcon className="w-6 h-6 text-red-400" />;
    if (connectionMethod === 'serial') return <Wifi className="w-6 h-6 text-green-400 connection-pulse" />;
    if (connectionMethod === 'ble') return <BluetoothConnected className="w-6 h-6 text-green-400 connection-pulse" />;
    if (connectionMethod === 'demo') return <Activity className="w-6 h-6 text-green-400 connection-pulse" />;
    return <WifiOff className="w-6 h-6 text-red-400" />;
  };

  const getStatusText = () => {
    if (!isConnected) return 'Disconnected';
    if (connectionMethod === 'serial') return 'Connected (Serial)';
    if (connectionMethod === 'ble') return 'Connected (Bluetooth)';
    if (connectionMethod === 'demo') return 'Demo Mode Active';
    return 'Connected';
  };

  const getStatusDescription = () => {
    if (!isConnected) return 'No active connection';
    if (connectionMethod === 'serial') return 'Receiving data via Web Serial';
    if (connectionMethod === 'ble') return 'Receiving data via Bluetooth LE';
    if (connectionMethod === 'demo') return 'Simulating Arduino data';
    return 'Receiving data';
  };


  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 mb-8 border border-white/20"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className={`p-3 rounded-full ${isConnected ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {getStatusText()}
            </h3>
            <p className="text-gray-400 text-sm">
              {getStatusDescription()}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          {!isConnected ? (
            <>
              <Button onClick={onConnectSerial} className="bg-blue-600 hover:bg-blue-700">
                <Zap className="w-4 h-4 mr-2" />
                Connect Serial
              </Button>
              <Button onClick={onConnectBle} className="bg-sky-600 hover:bg-sky-700">
                <Bluetooth className="w-4 h-4 mr-2" />
                Connect Bluetooth
              </Button>
              <Button onClick={onStartDemo} variant="outline" className="border-purple-500 text-purple-400 hover:bg-purple-500/20 hover:text-purple-300">
                <Activity className="w-4 h-4 mr-2" />
                Start Demo
              </Button>
            </>
          ) : (
            <Button onClick={onDisconnect} variant="destructive">
              <ZapOff className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ConnectionStatus;
