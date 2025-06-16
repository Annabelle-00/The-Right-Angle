
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Settings, TrendingUp, RotateCcw } from 'lucide-react';

const ControlsPanel = ({ minValue, maxValue, onMinValueChange, onMaxValueChange, onCalibrate, onReset }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20"
    >
      <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
        <Settings className="w-5 h-5 mr-2" />
        Calibration & Controls
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-black/20 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">Min Value</div>
          <input
            type="number"
            value={minValue}
            onChange={(e) => onMinValueChange(parseInt(e.target.value) || 0)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
          />
        </div>

        <div className="bg-black/20 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-2">Max Value</div>
          <input
            type="number"
            value={maxValue}
            onChange={(e) => onMaxValueChange(parseInt(e.target.value) || 1023)}
            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white"
          />
        </div>

        <div className="flex flex-col space-y-2">
          <Button onClick={onCalibrate} className="bg-green-600 hover:bg-green-700">
            <TrendingUp className="w-4 h-4 mr-2" />
            Auto Calibrate
          </Button>
          <Button onClick={onReset} variant="outline" className="border-gray-500 text-gray-300 hover:bg-gray-500/20 hover:text-gray-200">
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </motion.div>
  );
};

export default ControlsPanel;
