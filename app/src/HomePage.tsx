import React from 'react';

// Define interfaces for models
interface TokenInfo {
  available: number;
  total: number;
  refreshTime: string;
  lastRefresh?: string;
}

export interface ChatModel {
  id: string;
  name: string;
  icon: string;
  tokens: TokenInfo;
  description: string;
  getResponse: (request: string) => Promise<string>;
}

interface HomePageProps {
  onSelectModel: (model: ChatModel) => void;
  availableModels: ChatModel[];
}

const HomePage: React.FC<HomePageProps> = ({ onSelectModel, availableModels }) => {
  return (
    <div className="min-h-screen flex flex-col select-none bg-gray-800">
      {/* Header */}
      <header className="p-4 bg-gray-900 border-b border-gray-700 select-none transition-all duration-500 ease-in-out">
        <h1 className="text-2xl font-bold text-center text-blue-400 select-none">ChatCompare</h1>
      </header>
      
      {/* Main page content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8 select-none transition-all duration-500 ease-in-out">
        {/* Information */}
        <div className="text-center select-none">
          <h2 className="text-3xl font-bold text-gray-200 select-none">Compare AI Chatbots Side by Side</h2>
          <p className="text-gray-400 max-w-md mx-auto select-none">Select your first AI model to get started with your comparison</p>
        </div>
        
        {/* Buttons List */}
        <div className="list space-y-4 max-w-4xl w-full">
          {availableModels.map(model => (
              <div 
                key={model.id} 
                className={`rounded-lg p-6 cursor-pointer flex items-center gap-4 bg-gray-700 border border-gray-600 hover:border-blue-500 transition-all duration-300 ease-in-out ${model.tokens.available === 0 ? 'opacity-50' : 'hover:scale-105'}`}
                onClick={() => model.tokens.available > 0 && onSelectModel(model)}
              >
                <img src={model.icon} className="w-10 h-10 rounded-full select-none" alt={model.name} />
                <div className="flex flex-col select-none">
                  <div className="flex items-center gap-2 select-none">
                  <h3 className="!text-lg text-gray-200 font-bold select-none whitespace-nowrap">
                    {model.name}
                  </h3>
                    <p className="text-white text-sm select-none">{model.description || 'Description placeholder'}</p>
                  </div>
                  <div className="text-sm flex gap-2 select-none">
                    <p className="text-gray-400 select-none">
                      {model.tokens.total === Infinity 
                        ? "Unlimited" 
                        : `${model.tokens.available.toLocaleString()} / ${model.tokens.total.toLocaleString()} tokens`}
                    </p>
                    <p className="text-gray-400 select-none">
                      {model.tokens.refreshTime ? `Refreshes in ${model.tokens.refreshTime}` : ''}
                    </p>
                  </div>
                </div>
                {model.tokens.available === 0 && (
                  <span className="ml-auto text-yellow-500 text-sm select-none">No available tokens</span>
                )}
              </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;
