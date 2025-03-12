import React from 'react';

// Define interfaces for our data models
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

interface HomePageProps {
  onSelectModel: (model: ChatModel) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSelectModel }) => {
  return (
    <div className="min-h-screen bg-gray-800 flex flex-col">
      {/* Header */}
      <header className="bg-gray-900 p-4 border-b border-gray-700">
        <h1 className="text-2xl font-bold text-center text-blue-400">ChatCompare</h1>
      </header>
      
      {/* Main page content */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 gap-8">
        {/* Information */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-200 mb-2">Compare AI Chatbots Side by Side</h2>
          <p className="text-gray-400 max-w-md mx-auto">Select your first AI model to get started with your comparison.</p>
        </div>
        
        {/* Buttons List */}
        <div className="list space-y-4 max-w-4xl w-full">
          {availableModels.map(model => (
              <div 
              key={model.id} 
              className="bg-gray-700 rounded-lg p-6 cursor-pointer flex items-center gap-4 border border-gray-600 hover:border-blue-500"
              onClick={() => onSelectModel(model)}
            >
              <img src={model.icon} className="relative w-10 h-10 rounded-full" />
              <div>
                <h3 className="!text-lg text-gray-200 font-bold">{model.name}</h3>
                <div className="text-sm flex gap-2">
                  <p className="text-gray-400">{model.tokens.available.toLocaleString()} / {model.tokens.total.toLocaleString()} tokens</p>
                  <p className="text-gray-400">{model.tokens.refreshTime ? `Refreshes in ${model.tokens.refreshTime}` : ''}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default HomePage;