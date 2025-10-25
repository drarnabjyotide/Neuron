import React, { useRef, useEffect, useImperativeHandle, forwardRef, useCallback } from 'react';
import type { Neuron, Connection, VisualizationHandle, Stats } from '../types';
import { NETWORK_LAYERS } from '../constants';

interface VisualizationPanelProps {
  onStatsUpdate: (newStats: Partial<Stats>) => void;
}

const VisualizationPanel = forwardRef<VisualizationHandle, VisualizationPanelProps>(({ onStatsUpdate }, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const neurons = useRef<Neuron[][]>([]);
  const connections = useRef<Connection[]>([]);
  const animationFrameId = useRef<number | null>(null);
  const bursts = useRef<{x: number; y: number; radius: number; opacity: number}[]>([]);

  const initNetwork = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    neurons.current = [];
    connections.current = [];

    const layerSpacing = canvas.width / (NETWORK_LAYERS.length + 1);

    NETWORK_LAYERS.forEach((neuronCount, layerIndex) => {
      const layerNeurons: Neuron[] = [];
      const neuronSpacing = canvas.height / (neuronCount + 1);
      for (let i = 0; i < neuronCount; i++) {
        layerNeurons.push({
          x: layerSpacing * (layerIndex + 1),
          y: neuronSpacing * (i + 1),
          activation: 0,
          targetActivation: 0,
          layer: layerIndex,
        });
      }
      neurons.current.push(layerNeurons);
    });

    for (let l = 0; l < neurons.current.length - 1; l++) {
      for (let i = 0; i < neurons.current[l].length; i++) {
        const connectionsPerNeuron = Math.min(5, neurons.current[l + 1].length);
        for (let j = 0; j < connectionsPerNeuron; j++) {
          const targetIndex = Math.floor(Math.random() * neurons.current[l + 1].length);
          connections.current.push({
            from: neurons.current[l][i],
            to: neurons.current[l + 1][targetIndex],
            weight: Math.random() * 2 - 1,
            signal: 0,
          });
        }
      }
    }
  }, []);

  const drawNetwork = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background grid
    const gridSize = 40;
    ctx.strokeStyle = 'rgba(123, 47, 247, 0.07)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }

    // Draw and update bursts
    bursts.current = bursts.current.filter(burst => {
        burst.radius += 1.5;
        burst.opacity -= 0.04;
        if (burst.opacity <= 0) return false;
        
        ctx.beginPath();
        ctx.arc(burst.x, burst.y, burst.radius, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(123, 47, 247, ${burst.opacity})`;
        ctx.lineWidth = 2.5;
        ctx.stroke();
        return true;
    });

    connections.current.forEach(conn => {
      if (conn.signal > 0.05) {
        ctx.beginPath();
        ctx.moveTo(conn.from.x, conn.from.y);
        ctx.lineTo(conn.to.x, conn.to.y);
        const opacity = conn.signal;
        const hue = conn.weight > 0 ? 240 : 280; // Blue and Purple, a "darker" palette
        ctx.strokeStyle = `hsla(${hue}, 100%, 60%, ${opacity * 0.5})`;
        ctx.lineWidth = 1.5 * conn.signal;
        ctx.stroke();
      }
      conn.signal *= 0.94;
    });

    neurons.current.forEach(layer => {
      layer.forEach(neuron => {
        neuron.activation += (neuron.targetActivation - neuron.activation) * 0.1;
        if (neuron.activation > 0.05) {
          const glow = neuron.activation * 20;
          const gradient = ctx.createRadialGradient(neuron.x, neuron.y, 0, neuron.x, neuron.y, glow);
          gradient.addColorStop(0, `rgba(123, 47, 247, ${neuron.activation})`);
          gradient.addColorStop(1, 'rgba(123, 47, 247, 0)');
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(neuron.x, neuron.y, 6, 0, Math.PI * 2);
          ctx.fill();
        }
        neuron.targetActivation *= 0.96;
      });
    });

    animationFrameId.current = requestAnimationFrame(drawNetwork);
  }, []);

  useImperativeHandle(ref, () => ({
    simulateThinking: (input: string) => {
      let activationCount = 0;
      const startTime = Date.now();

      neurons.current.forEach(layer => layer.forEach(n => {
        n.activation = 0;
        n.targetActivation = 0;
      }));
      connections.current.forEach(c => c.signal = 0);
      
      const inputHash = input.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      neurons.current[0].forEach((neuron, i) => {
        const activation = Math.sin(inputHash * (i + 1) * 0.01) * 0.5 + 0.5;
        neuron.targetActivation = activation;
        if (activation > 0.3) {
            activationCount++;
            bursts.current.push({ x: neuron.x, y: neuron.y, radius: 5, opacity: 1 });
        }
      });
      onStatsUpdate({ activations: activationCount });

      let delay = 0;
      for (let l = 0; l < neurons.current.length - 1; l++) {
        setTimeout(() => {
          neurons.current[l].forEach(neuron => {
            if (neuron.targetActivation > 0.3) {
              connections.current.forEach(conn => {
                if (conn.from === neuron) {
                  conn.signal = neuron.targetActivation;
                  const newActivation = neuron.targetActivation * Math.abs(conn.weight) * (Math.random() * 0.5 + 0.5);
                  conn.to.targetActivation = Math.max(conn.to.targetActivation, newActivation);
                  if (newActivation > 0.3) {
                    activationCount++;
                    bursts.current.push({ x: conn.to.x, y: conn.to.y, radius: 5, opacity: 1 });
                  }
                }
              });
            }
          });
          onStatsUpdate({ activations: activationCount });
        }, delay);
        delay += 150;
      }
      
      setTimeout(() => {
        const totalTime = Date.now() - startTime;
        onStatsUpdate({ processTime: totalTime });
      }, delay);
    },
    processStreamChunk: (chunk: string) => {
      if (!neurons.current.length) return;
      const chunkHash = chunk.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      
      const layerIndex = Math.floor(Math.random() * (neurons.current.length - 2)) + 1;
      const layer = neurons.current[layerIndex];
      if (!layer) return;

      const neuronIndex = chunkHash % layer.length;
      const neuron = layer[neuronIndex];

      if (neuron) {
        neuron.targetActivation = Math.min(1, neuron.targetActivation + 0.5);
        bursts.current.push({ x: neuron.x, y: neuron.y, radius: 5, opacity: 1 });

        connections.current.forEach(conn => {
          if (conn.from === neuron) {
            conn.signal = neuron.targetActivation;
            const newActivation = neuron.targetActivation * Math.abs(conn.weight) * 0.5;
            conn.to.targetActivation = Math.min(1, conn.to.targetActivation + newActivation);
            if (newActivation > 0.3) {
                bursts.current.push({ x: conn.to.x, y: conn.to.y, radius: 5, opacity: 1 });
            }
          }
        });
      }
    },
  }));

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const resizeCanvas = () => {
        if (canvas.parentElement) {
            canvas.width = canvas.parentElement.offsetWidth;
            canvas.height = canvas.parentElement.offsetHeight;
            initNetwork();
        }
    };
    
    resizeCanvas();
    
    const resizeObserver = new ResizeObserver(resizeCanvas);
    if(canvas.parentElement) {
        resizeObserver.observe(canvas.parentElement);
    }
    
    drawNetwork();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      resizeObserver.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initNetwork, drawNetwork]);

  return <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl h-full min-h-[600px]"><canvas ref={canvasRef} className="w-full h-full" /></div>;
});

export default VisualizationPanel;