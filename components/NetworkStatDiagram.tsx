import React from 'react';

interface NetworkStatDiagramProps {
  neuronCount: number;
  layerCount: number;
}

const NetworkStatDiagram: React.FC<NetworkStatDiagramProps> = ({ neuronCount, layerCount }) => {
  return (
    <div className="flex flex-col items-center justify-center text-white p-2 space-y-2">
      <svg width="100" height="60" viewBox="0 0 100 60">
        {Array.from({ length: 3 }).map((_, layerIdx) => (
          Array.from({ length: 4 }).map((_, neuronIdx) => (
            <React.Fragment key={`${layerIdx}-${neuronIdx}`}>
              <circle
                cx={20 + layerIdx * 30}
                cy={10 + neuronIdx * 10}
                r="2.5"
                fill="rgba(0, 212, 255, 0.7)"
              />
              {layerIdx < 2 && (
                <line
                  x1={20 + layerIdx * 30}
                  y1={10 + neuronIdx * 10}
                  x2={20 + (layerIdx + 1) * 30}
                  y2={10 + ((neuronIdx + layerIdx*2) % 4) * 10}
                  stroke="rgba(123, 47, 247, 0.4)"
                  strokeWidth="1"
                />
              )}
            </React.Fragment>
          ))
        ))}
      </svg>
      <div className="flex space-x-6 text-center">
          <div>
              <div className="text-2xl font-bold text-white">{neuronCount}</div>
              <div className="text-md text-gray-300">Neurons</div>
          </div>
          <div>
              <div className="text-2xl font-bold text-white">{layerCount}</div>
              <div className="text-md text-gray-300">Layers</div>
          </div>
      </div>
    </div>
  );
};

export default NetworkStatDiagram;