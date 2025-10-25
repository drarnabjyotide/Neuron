import React from 'react';
import type { Stats } from '../types';
import { PRESET_QUESTIONS } from '../constants';
import Gauge from './Gauge';
import NetworkStatDiagram from './NetworkStatDiagram';

interface InputPanelProps {
  userInput: string;
  setUserInput: (value: string) => void;
  onProcess: (prompt: string) => void;
  isLoading: boolean;
  stats: Stats;
}

const InputPanel: React.FC<InputPanelProps> = ({ userInput, setUserInput, onProcess, isLoading, stats }) => {

  const handlePresetClick = (text: string) => {
    setUserInput(text);
    onProcess(text);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onProcess(userInput);
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-xl">
      {/* Main Centered Section */}
      <div className="flex flex-col items-center justify-center space-y-6 w-full max-w-4xl mx-auto text-center">
        <label className="block font-semibold text-[#00d4ff] text-3xl">Ask the AI Anything:</label>
        <input
          type="text"
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="e.g., What is machine learning?"
          className="w-full p-8 bg-white/10 border-2 border-cyan-500/30 rounded-xl text-white text-3xl transition-all focus:outline-none focus:border-cyan-500 focus:shadow-[0_0_20px_rgba(0,212,255,0.3)]"
          disabled={isLoading}
        />
        <button
          onClick={() => onProcess(userInput)}
          disabled={isLoading || !userInput}
          className="w-full p-8 bg-gradient-to-r from-[#00d4ff] to-[#7b2ff7] border-none rounded-xl text-white text-3xl font-bold cursor-pointer transition-transform transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Processing...' : 'Process & Visualize'}
        </button>
      </div>
      
      {/* Secondary Info Section */}
      <div className="flex flex-col lg:flex-row justify-between items-center mt-12 gap-8">
        <div className="stats grid grid-cols-3 gap-2 items-center justify-items-center">
          <NetworkStatDiagram neuronCount={stats.neuronCount} layerCount={stats.layerCount} />
          <Gauge label="Activations" value={stats.activations} max={stats.neuronCount} />
          <Gauge label="Process Time" value={stats.processTime} max={1000} unit="ms" />
        </div>
        <div className="presets grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(PRESET_QUESTIONS).map(([label, prompt]) => (
            <button
              key={label}
              onClick={() => handlePresetClick(prompt)}
              disabled={isLoading}
              className="p-3 bg-purple-900/30 border border-[#7b2ff7] rounded-lg text-white cursor-pointer text-base transition-all duration-200 hover:bg-purple-900/50 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default InputPanel;