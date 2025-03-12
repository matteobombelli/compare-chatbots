import React, { useState } from 'react';

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

// Define interfaces for chats
interface Message {
  id: string;
  modelId: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
}

interface ChatInterfaceProps {
  availableModels: ChatModel[];
  initialModel: ChatModel;
  onBackToHome: () => void;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  availableModels, 
  initialModel, 
  onBackToHome 
}) => {
  // State for active models and messages
  const [activeModels, setActiveModels] = useState<ChatModel[]>([initialModel]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [modelJoinTimestamps, setModelJoinTimestamps] = useState<Record<string, Date>>({
    [initialModel.id]: new Date() // Set initial model's join timestamp
  });
  const [inputValue, setInputValue] = useState('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  
  // Get inactive models
  const inactiveModels = availableModels.filter(
    model => !activeModels.some(activeModel => activeModel.id === model.id)
  );

  // Send message to all active models
  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    // Create user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      modelId: 'user',
      content: inputValue,
      timestamp: new Date(),
      isUser: true
    };
    
    // Create AI responses (in real app, these would come from API calls)
    const aiResponses: Message[] = activeModels.map(model => ({
      id: `${model.id}-${Date.now()}`,
      modelId: model.id,
      content: `This is a simulated response from ${model.name}. In a real implementation, this would be an actual response from the API.`,
      timestamp: new Date(),
      isUser: false
    }));
    
    // Add all messages to the state
    setMessages([...messages, userMessage, ...aiResponses]);
    setInputValue('');
  };

  // Add a new model to the comparison
  const handleAddModel = (model: ChatModel) => {
    setActiveModels([...activeModels, model]);
    
    // Record when this model joined the conversation
    setModelJoinTimestamps(prev => ({
      ...prev,
      [model.id]: new Date()
    }));
    
    setShowModelSelector(false);
  };
  
  // Close the model selector when clicking outside
  const handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (showModelSelector && !target.closest('.model-selector-button') && !target.closest('.model-selector-popup')) {
      setShowModelSelector(false);
    }
  };
  
  // Add and remove event listeners for clicking outside
  React.useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [showModelSelector]);

  // Remove a model from the comparison
  const handleRemoveModel = (modelId: string) => {
    setActiveModels(activeModels.filter(model => model.id !== modelId));
    
    // Remove the join timestamp for this model
    setModelJoinTimestamps(prev => {
      const updated = {...prev};
      delete updated[modelId];
      return updated;
    });
  };
  
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
      
      {/* Chat container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Chat windows */}
        {activeModels.map(model => (
          <div key={model.id} className="flex-1 flex flex-col border-r border-gray-700">
            {/* Model header */}
            <div className="bg-gray-900 p-3 flex items-center justify-between border-b border-gray-700">
              <div className="flex items-center gap-2">
                <img src={model.icon} className="w-8 h-8 rounded-full" alt={model.name} />
                <span className="text-gray-200 font-medium">{model.name}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-gray-400 text-xs">
                  {model.tokens.available.toLocaleString()} / {model.tokens.total.toLocaleString()} tokens
                </span>
                {activeModels.length > 1 && (
                  <button 
                    onClick={() => handleRemoveModel(model.id)} 
                    className="text-gray-400 hover:text-red-400"
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            {/* Messages area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text">
              {messages
                // Only show messages that were created after this model joined the chat
                .filter(message => {
                  // Always show user messages that came after model joined
                  if (message.isUser) {
                    return message.timestamp >= modelJoinTimestamps[model.id];
                  }
                  // Only show this model's responses
                  return message.modelId === model.id;
                })
                .map(message => (
                  <div 
                    key={message.id} 
                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div 
                      className={`max-w-3/4 rounded-lg p-3 ${
                        message.isUser 
                          ? 'bg-blue-600 text-white' 
                          : 'bg-gray-700 text-gray-200'
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Input area */}
      <div className="bg-gray-900 p-4 border-t border-gray-700 relative">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message here..."
            className="flex-1 bg-gray-700 text-gray-200 p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none select-text"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="text-xl font-bold w-36 bg-blue-600 text-white p-3 rounded-lg disabled:opacity-50 hover:bg-blue-500"
          >
            Send
          </button>
          {inactiveModels.some(model => model.tokens.available > 0) && (
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className={`text-xl w-72 font-bold bg-gray-700 text-gray-200 p-3 rounded-lg border model-selector-button ${
                showModelSelector ? 'border-blue-500' : 'border-gray-600 hover:border-blue-500'
              }`}
            >
              + Add Chatbot
            </button>
          )}
        </div>
      </div>
      
      {/* Model selector popup */}
      {showModelSelector ? (
        <div className="absolute bottom-16 right-4 z-10 bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden model-selector-popup">
          <div className="p-3 border-b border-gray-700">
            <h3 className="text-sm font-bold text-gray-200">Add a Chatbot</h3>
          </div>
          
          <div className="max-h-80 overflow-y-auto p-2 space-y-2 w-72">
            {inactiveModels.map(model => (
              <div 
                key={model.id} 
                className={`bg-gray-700 rounded-lg p-2 flex items-center gap-3 border border-gray-600 ${
                  model.tokens.available > 0 ? 'cursor-pointer hover:border-blue-500' : 'opacity-50'
                }`}
                onClick={() => model.tokens.available > 0 && handleAddModel(model)}
              >
                <img src={model.icon} className="w-7 h-7 rounded-full" alt={model.name} />
                <div className="flex-1 min-w-0">
                  <h4 className="text-gray-200 font-medium text-sm truncate">{model.name}</h4>
                  <div className="text-xs">
                    <p className="text-gray-400 truncate">
                      {model.tokens.available.toLocaleString()} / {model.tokens.total.toLocaleString()} tokens
                      {model.tokens.refreshTime ? ` • Refreshes in ${model.tokens.refreshTime}` : ''}
                    </p>
                  </div>
                </div>
                {model.tokens.available === 0 && (
                  <span className="text-yellow-500 text-xs whitespace-nowrap">No tokens</span>
                )}
              </div>
            ))}
            
            {inactiveModels.length === 0 && (
              <p className="text-center py-2 text-sm text-gray-400">All models are already active</p>
            )}
          </div>
        </div>
      ) : ''}
    </div>
  );
};

export default ChatInterface;