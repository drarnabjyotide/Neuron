export interface Neuron {
  x: number;
  y: number;
  activation: number;
  targetActivation: number;
  layer: number;
}

export interface Connection {
  from: Neuron;
  to: Neuron;
  weight: number;
  signal: number;
}

export interface Stats {
  neuronCount: number;
  layerCount: number;
  activations: number;
  processTime: number;
}

export interface VisualizationHandle {
  simulateThinking: (input: string) => void;
  processStreamChunk: (chunk: string) => void;
}