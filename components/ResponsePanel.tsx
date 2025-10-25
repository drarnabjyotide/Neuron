import React from 'react';

interface ResponsePanelProps {
  response: string;
  isLoading: boolean;
}

const ResponsePanel: React.FC<ResponsePanelProps> = ({ response, isLoading }) => {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-xl">
      <label className="block mb-3 font-semibold text-[#00d4ff] text-xl">AI Response:</label>
      <div className={`response-text bg-black/30 p-5 rounded-lg border-l-4 border-[#00d4ff] min-h-[60px] text-lg leading-relaxed whitespace-pre-wrap text-white ${isLoading ? 'blinking-cursor' : ''}`}>
        {response}
      </div>
    </div>
  );
};

export default ResponsePanel;