
import React from 'react';
import { motion } from 'framer-motion';
import { Target } from 'lucide-react';

const DataDisplay = ({ potValue, angle, minValue, maxValue, historyLength }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20"
    >
      <h3 className="text-xl font-semibold text-white mb-6 flex items-center">
        <Target className="w-5 h-5 mr-2" />
        Live Data
      </h3>

      <div className="space-y-6">
        <div className="bg-black/20 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Potentiometer Value</div>
          <div className="text-3xl font-bold text-blue-400">{potValue}</div>
          <div className="text-xs text-gray-500">Range: {minValue} - {maxValue}</div>
        </div>

        <div className="bg-black/20 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Converted Angle</div>
          <div className="text-3xl font-bold text-purple-400">{angle}°</div>
          <div className="text-xs text-gray-500">0° - 360°</div>
        </div>

        <div className="bg-black/20 rounded-lg p-4">
          <div className="text-sm text-gray-400 mb-1">Data Points</div>
          <div className="text-2xl font-bold text-green-400">{historyLength}</div>
          <div className="text-xs text-gray-500">Recent readings</div>
        </div>
      </div>
    </motion.div>
  );
};

export default DataDisplay;
