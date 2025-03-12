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

interface HomePageProps {
  onSelectModel: (model: ChatModel) => void;
  availableModels: ChatModel[];
}

const HomePage: React.FC<HomePageProps> = ({ onSelectModel, availableModels }) => {
  return (
    <div className="min-h-screen flex flex-col select-none bg-gray-800">
      {/* Header */}
      <header className="p-4 bg-gray-900 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-center select-none text-blue-400">ChatCompare</h1>
      </header>
      
      {/* Main page content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Information */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-200">Compare AI Chatbots Side by Side</h2>
          <p className="text-gray-400 max-w-md mx-auto">Select your first AI model to get started with your comparison</p>
        </div>
        
        {/* Buttons List */}
        <div className="list space-y-4 max-w-4xl w-full">
          {availableModels.map(model => (
              <div 
              key={model.id} 
              className={`rounded-lg p-6 cursor-pointer flex items-center gap-4 bg-gray-700 border border-gray-600 hover:border-blue-500 ${
                model.tokens.available === 0 ? 'opacity-50' : ''
              }`}
              onClick={() => model.tokens.available > 0 && onSelectModel(model)}
            >
              <img src={model.icon} className="w-10 h-10 rounded-full" alt={model.name} />
              <div>
                <h3 className="!text-lg text-gray-200 font-bold">{model.name}</h3>
                <div className="text-sm flex gap-2">
                  <p className="text-gray-400">{model.tokens.available.toLocaleString()} / {model.tokens.total.toLocaleString()} tokens</p>
                  <p className="text-gray-400">{model.tokens.refreshTime ? `Refreshes in ${model.tokens.refreshTime}` : ''}</p>
                </div>
              </div>
              {model.tokens.available === 0 && (
                <span className="ml-auto text-yellow-500 text-sm">No available tokens</span>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;