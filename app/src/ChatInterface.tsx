import React from 'react';

// Define interfaces for models
interface TokenInfo {
  available: number;
  total: number;
  refreshTime: string;
}

interface ChatModel {
  id: string;
  name: string;
  icon: string;
  tokens: TokenInfo;
}

interface ChatInterfaceProps {
  onBackToHome: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ onBackToHome }) => {
  
  
  return (
    <div className="min-h-screen bg-gray-800 flex flex-col select-none">
      {/* Header */}
      <header className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center">
        <button 
          onClick={onBackToHome}
          className="!text-xl text-blue-400 hover:text-blue-300"
        >
          <span>&#8249; Back</span> {/* &#8249; is a left Chevron */}
        </button>
        <h1 className="text-2xl font-bold text-blue-400">ChatCompare</h1>
        <div className="w-10"></div> {/* Spacer to center the title */}
      </header>
    </div>
  );
};

export default ChatInterface;