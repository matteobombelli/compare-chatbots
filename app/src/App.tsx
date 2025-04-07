import React, { useState, useEffect, useCallback } from 'react';
import HomePage from './HomePage';
import ChatInterface from './ChatInterface';

// Define interfaces for data models
interface TokenInfo {
  available: number;
  total: number;
  refreshTime: string;
  lastRefresh?: string; // stored as ISO string for localStorage
}

export interface ChatModel {
  id: string;
  name: string;
  icon: string;
  tokens: TokenInfo;
  description: string;
  getResponse: (request: string) => Promise<string>;
}

async function getModelResponse(request: string, model: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: 'Bearer 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',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: model,
      max_tokens: 250,
      messages: [
        {
          role: 'user',
          content: request
        },
      ],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  if (!data.choices || data.choices.length === 0) {
    console.log(response);
    throw new Error("No response");
  }
  return data.choices[0].message.content;
}

const defaultModels: ChatModel[] = [
  { 
    id: 'model1', 
    name: 'GPT-4o', 
    icon: 'icon_gpt.jpg', 
    tokens: { available: 800, total: 800, refreshTime: '6h', lastRefresh: new Date().toISOString() },
    description: 'A powerful language model with cutting-edge reasoning and creativity.',
    getResponse: (request: string) => getModelResponse(request, "openai/gpt-4o")
  },
  { 
    id: 'model2', 
    name: 'Claude 3.7 Sonnet', 
    icon: 'icon_claude.png', 
    tokens: { available: 800, total: 800, refreshTime: '6h', lastRefresh: new Date().toISOString() },
    description: 'A conversational AI with a poetic touch and robust performance.',
    getResponse: (request: string) => getModelResponse(request, "anthropic/claude-3.7-sonnet")
  },
  { 
    id: 'model3', 
    name: 'Gemini 2.0 Flash', 
    icon: 'icon_gemini.png', 
    tokens: { available: 1600, total: 1600, refreshTime: '6h', lastRefresh: new Date().toISOString() },
    description: 'A fast and agile model optimized for real-time responses.',
    getResponse: (request: string) => getModelResponse(request, "google/gemini-2.0-flash-001")
  },
  { 
    id: 'model4', 
    name: 'Deepseek R-1', 
    icon: 'icon_deepseek.jpeg', 
    tokens: { available: Infinity, total: Infinity, refreshTime: '' },
    description: 'A free model designed for deep search and information retrieval.',
    getResponse: (request: string) => getModelResponse(request, "deepseek/deepseek-v3-base:free") 
  },
  { 
    id: 'model5', 
    name: 'Grok 2', 
    icon: 'icon_grok.png', 
    tokens: { available: 5, total: 5, refreshTime: '6h', lastRefresh: new Date().toISOString() },
    description: 'A budget-friendly AI with competitive performance in chat.',
    getResponse: (request: string) => getModelResponse(request, "x-ai/grok-2-1212") 
  },
  { 
    id: 'model6', 
    name: 'Llama 3.2', 
    icon: 'icon_llama.png', 
    tokens: { available: Infinity, total: Infinity, refreshTime: '' },
    description: 'A freely available model with strong general-purpose capabilities.',
    getResponse: (request: string) => getModelResponse(request, "meta-llama/llama-3.2-1b-instruct:free")
  },
];

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<'home' | 'chat'>('home');
  const [selectedModel, setSelectedModel] = useState<ChatModel | null>(null);
  const [models, setModels] = useState<ChatModel[]>([]);

  // Load token info from localStorage on mount and merge with default models
  useEffect(() => {
    const stored = localStorage.getItem('chatModelTokens');
    if (stored) {
      try {
        const storedTokens = JSON.parse(stored);
        const merged = defaultModels.map(model => {
          if (storedTokens[model.id]) {
            return { 
              ...model, 
              tokens: { 
                ...model.tokens, 
                available: storedTokens[model.id].available, 
                lastRefresh: storedTokens[model.id].lastRefresh 
              } 
            };
          }
          return model;
        });
        setModels(merged);
      } catch (err) {
        console.error("Error parsing stored tokens:", err);
        setModels(defaultModels);
      }
    } else {
      setModels(defaultModels);
    }
  }, []);

  // Save token info to localStorage whenever models change
  useEffect(() => {
    const tokenData: { [key: string]: any } = {};
    models.forEach(model => {
      if (model.tokens.total !== Infinity) {
        tokenData[model.id] = {
          available: model.tokens.available,
          lastRefresh: model.tokens.lastRefresh
        };
      }
    });
    localStorage.setItem('chatModelTokens', JSON.stringify(tokenData));
  }, [models]);

  const updateModelTokens = useCallback((modelId: string, newTokens: TokenInfo) => {
    setModels(prev =>
      prev.map(model => 
        model.id === modelId ? { ...model, tokens: newTokens } : model
      )
    );
  }, []);

  const handleSelectModel = (model: ChatModel) => {
    setSelectedModel(model);
    setCurrentPage('chat');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  return (
    <div className="min-h-screen bg-gray-800">
      {currentPage === 'home' ? (
        <HomePage onSelectModel={handleSelectModel} availableModels={models} />
      ) : (
        selectedModel && (
          <ChatInterface 
            availableModels={models}
            activeModelIds={[selectedModel.id]}
            onBackToHome={handleBackToHome}
            updateModelTokens={updateModelTokens}
          />
        )
      )}
    </div>
  );
};

export default App;
