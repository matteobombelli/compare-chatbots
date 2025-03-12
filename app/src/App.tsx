import React, { useState } from 'react';
import HomePage from './HomePage';
import ChatInterface from './ChatInterface';

// Define interfaces for data models
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

// Placeholder models and data
const availableModels: ChatModel[] = [
  { id: 'model1', name: 'GPT-4o', icon: 'icon_gpt.jpg', tokens: { available: 1000, total: 1000, refreshTime: '' } },
  { id: 'model2', name: 'Claude 3.7 Sonnet',icon: 'icon_claude.png', tokens: { available: 850, total: 1000, refreshTime: '4h 52m' } },
  { id: 'model3', name: 'Gemini 2.0 Flash', icon: 'icon_gemini.png', tokens: { available: 0, total: 300, refreshTime: '1h 17m' } },
  { id: 'model4', name: 'Deepseek R-1', icon: 'icon_deepseek.jpeg', tokens: { available: 500, total: 500, refreshTime: '' } },
  { id: 'model5', name: 'Grok 3', icon: 'icon_grok.png', tokens: { available: 750, total: 750, refreshTime: '' } },
  { id: 'model6', name: 'Llama 3.2', icon: 'icon_llama.png', tokens: { available: 0, total: 500, refreshTime: '21m' } },
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'chat'>('home');
  const [selectedModel, setSelectedModel] = useState<ChatModel | null>(null);

  // Handle model selection
  const handleSelectModel = (model: ChatModel) => {
    setSelectedModel(model);
    setCurrentPage('chat');
  };

  // Handle going back to home page
  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-gray-800">
      {currentPage === 'home' ? (
        <HomePage onSelectModel={handleSelectModel} availableModels={availableModels} />
      ) : (
        selectedModel && (
          <ChatInterface 
            onBackToHome={handleBackToHome}
          />
        )
      )}
    </div>
  );
};

export default App;