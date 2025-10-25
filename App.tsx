import React, { useState, useRef, useCallback } from 'react';
import InputPanel from './components/InputPanel';
import VisualizationPanel from './components/VisualizationPanel';
import ResponsePanel from './components/ResponsePanel';
import { getAiResponseStream } from './services/geminiService';
import { NETWORK_LAYERS } from './constants';
import type { Stats, VisualizationHandle } from './types';

const App: React.FC = () => {
  const [userInput, setUserInput] = useState<string>('');
  const [aiResponse, setAiResponse] = useState<string>('Waiting for input... Ask me anything to see the neural network in action!');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [stats, setStats] = useState<Stats>({
    neuronCount: NETWORK_LAYERS.reduce((a, b) => a + b, 0),
    layerCount: NETWORK_LAYERS.length,
    activations: 0,
    processTime: 0,
  });

  const visualizationRef = useRef<VisualizationHandle>(null);

  const handleStatsUpdate = useCallback((newStats: Partial<Stats>) => {
    setStats(prev => ({ ...prev, ...newStats }));
  }, []);

  const handleProcess = useCallback(async (prompt: string) => {
    if (!prompt || isLoading) return;

    setIsLoading(true);
    setUserInput(prompt);
    setAiResponse(''); // Clear previous response for streaming
    handleStatsUpdate({ activations: 0, processTime: 0 });
    
    visualizationRef.current?.simulateThinking(prompt);

    try {
      const stream = getAiResponseStream(prompt);
      for await (const chunk of stream) {
        setAiResponse(prev => prev + chunk);
        visualizationRef.current?.processStreamChunk(chunk);
      }
    } catch (error) {
      console.error(error);
      setAiResponse('An error occurred. Please check the console for details.');
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, handleStatsUpdate]);

  return (
    <div className="min-h-screen text-white font-sans p-5">
      <div className="container max-w-7xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-[#00d4ff] to-[#7b2ff7] bg-clip-text text-transparent mb-3">
            🧠 Neural Network Visualizer
          </h1>
          <p className="text-xl text-gray-300">Watch AI think in real-time as neurons fire</p>
        </header>

        <main className="space-y-8">
          <InputPanel
            userInput={userInput}
            setUserInput={setUserInput}
            onProcess={handleProcess}
            isLoading={isLoading}
            stats={stats}
          />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <VisualizationPanel ref={visualizationRef} onStatsUpdate={handleStatsUpdate} />
            <ResponsePanel response={aiResponse} isLoading={isLoading} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;