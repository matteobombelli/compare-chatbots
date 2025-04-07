import React, { useState, useEffect } from 'react';

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

// Extend Message interface with optional isLoading, isError, and isDisabled properties
interface Message {
  id: string;
  modelId: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
  isLoading?: boolean;
  isError?: boolean;
  isDisabled?: boolean;
}

interface ChatInterfaceProps {
  availableModels: ChatModel[];
  activeModelIds: string[]; // list of active model IDs
  onBackToHome: () => void;
  updateModelTokens: (modelId: string, newTokens: TokenInfo) => void;
}

// Helper function to estimate token count using word count
const countTokens = (text: string) => {
  return text.trim().split(/\s+/).length;
};

const RatingStars: React.FC<{ rating: number; onRate: (value: number) => void }> = ({ rating, onRate }) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="mt-1 flex space-x-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onRate(star)}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          className={`w-8 h-8 flex items-center justify-center border border-gray-400 rounded-full transition-all duration-300 ease-in-out select-none ${
            star <= (hover || rating)
              ? 'bg-yellow-400 text-white'
              : 'bg-transparent text-gray-500 hover:bg-gray-300'
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );
};

const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  availableModels, 
  activeModelIds: initialActiveModelIds, 
  onBackToHome,
  updateModelTokens
}) => {
  // Use active model IDs from props.
  const [activeModelIds, setActiveModelIds] = useState<string[]>(initialActiveModelIds);
  // Derive active model objects from availableModels using activeModelIds.
  const activeModels = availableModels.filter(model => activeModelIds.includes(model.id));
  const [messages, setMessages] = useState<Message[]>([]);
  const [modelJoinTimestamps, setModelJoinTimestamps] = useState<Record<string, Date>>({});
  const [inputValue, setInputValue] = useState('');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [sessionEnded, setSessionEnded] = useState(false);
  const [disabledModelIds, setDisabledModelIds] = useState<string[]>([]);

  // Test prompts for model performance.
  const fullSuggestionsList = [
    "Explain the theory of relativity in simple terms.",
    "Can you summarize the latest trends in artificial intelligence?",
    "What's the capital of France and why is it significant?",
    "Write a short poem about autumn.",
    "Describe the process of photosynthesis.",
    "What are the key differences between classical and quantum physics?",
    "Give me a brief overview of World War II.",
    "How do you solve a quadratic equation?",
    "What are some healthy meal options for a busy professional?",
    "Can you compare and contrast two major political systems?",
    "Explain blockchain technology and its applications.",
    "What is the impact of climate change on global ecosystems?",
    "Describe the importance of mental health in today's society.",
    "What are some tips for effective time management?",
    "Provide an analysis of the current state of the stock market."
  ];
  const initialDisplayCount = 10;
  const [displayedSuggestions, setDisplayedSuggestions] = useState<string[]>(fullSuggestionsList.slice(0, initialDisplayCount));
  const [nextSuggestionIndex, setNextSuggestionIndex] = useState(initialDisplayCount);
  const [fadingIndices, setFadingIndices] = useState<number[]>([]);

  // Set join timestamps for active models only when a new model is added.
  useEffect(() => {
    setModelJoinTimestamps(prev => {
      const newTimestamps = { ...prev };
      let changed = false;
      activeModels.forEach(model => {
        if (!newTimestamps[model.id]) {
          newTimestamps[model.id] = new Date();
          changed = true;
        }
      });
      return changed ? newTimestamps : prev;
    });
  }, [activeModels]);

  const sendMessage = (messageText: string) => {
    if (!messageText.trim()) return;
    
    const timestamp = new Date();
    const userTokenCount = countTokens(messageText);
    const userMessage: Message = {
      id: `user-${timestamp.getTime()}`,
      modelId: 'user',
      content: messageText,
      timestamp,
      isUser: true
    };
    setMessages(prev => [...prev, userMessage]);

    activeModels.forEach(model => {
      if (disabledModelIds.includes(model.id)) return;
      
      if (model.tokens.total !== Infinity && model.tokens.available < userTokenCount) {
        const disabledMsg: Message = {
          id: `${model.id}-disabled-${timestamp.getTime()}`,
          modelId: model.id,
          content: "You have run out of tokens! Please wait until more become available",
          timestamp: new Date(),
          isUser: false,
          isDisabled: true,
        };
        setMessages(prev => [...prev, disabledMsg]);
        setDisabledModelIds(prev => [...prev, model.id]);
        return;
      }
      
      // Deduct tokens for user's message using updateModelTokens
      if (model.tokens.total !== Infinity) {
        updateModelTokens(model.id, { ...model.tokens, available: model.tokens.available - userTokenCount });
      }
      
      const loadingId = `${model.id}-loading-${timestamp.getTime()}`;
      const loadingMessage: Message = {
        id: loadingId,
        modelId: model.id,
        content: '',
        timestamp: new Date(),
        isUser: false,
        isLoading: true,
      };
      setMessages(prev => [...prev, loadingMessage]);

      // Call getResponse only if model is not disabled
      (async () => {
        try {
          const responseText = await model.getResponse(messageText);
          const responseTokenCount = countTokens(responseText);
          if (model.tokens.total !== Infinity) {
            updateModelTokens(model.id, { ...model.tokens, available: Math.max(model.tokens.available - responseTokenCount, 0) });
          }
          setMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: responseText, isLoading: false } : m));
        } catch (error: any) {
          setMessages(prev => prev.map(m => m.id === loadingId ? { ...m, content: "API Error", isLoading: false, isError: true } : m));
        }
      })();
    });
  };

  const handleSendMessage = () => {
    sendMessage(inputValue);
    setInputValue('');
  };

  const renderRating = (message: Message) => {
    if (message.isUser) return null;
    const currentRating = ratings[message.id] || 0;
    return (
      <RatingStars 
        rating={currentRating} 
        onRate={(value) => setRatings({ ...ratings, [message.id]: value })}
      />
    );
  };

  const renderMessageContent = (message: Message) => {
    if (message.isLoading) {
      return (
        <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
        </svg>
      );
    }
    return message.content;
  };

  const handleSuggestionClick = (suggestion: string, idx: number) => {
    setFadingIndices(prev => [...prev, idx]);
    sendMessage(suggestion);
    setTimeout(() => {
      setDisplayedSuggestions(prev => {
        const newSuggestions = [...prev];
        newSuggestions.splice(idx, 1);
        return newSuggestions;
      });
      if (nextSuggestionIndex < fullSuggestionsList.length) {
        setDisplayedSuggestions(prev => [...prev, fullSuggestionsList[nextSuggestionIndex]]);
        setNextSuggestionIndex(nextSuggestionIndex + 1);
      }
      setFadingIndices(prev => prev.filter(i => i !== idx));
    }, 300);
  };

  const handleEndSession = () => {
    setSessionEnded(true);
  };

  const handleAddModel = (model: ChatModel) => {
    setActiveModelIds(prev => [...prev, model.id]);
    setModelJoinTimestamps(prev => ({
      ...prev,
      [model.id]: new Date()
    }));
    setShowModelSelector(false);
  };

  const handleRemoveModel = (modelId: string) => {
    setActiveModelIds(prev => prev.filter(id => id !== modelId));
    setModelJoinTimestamps(prev => {
      const updated = { ...prev };
      delete updated[modelId];
      return updated;
    });
  };

  const handleDocumentClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (showModelSelector && !target.closest('.model-selector-button') && !target.closest('.model-selector-popup')) {
      setShowModelSelector(false);
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleDocumentClick);
    return () => {
      document.removeEventListener('mousedown', handleDocumentClick);
    };
  }, [showModelSelector]);

  // Refresh token limits every 6 hours (check every minute) and re-enable models if tokens are replenished.
  useEffect(() => {
    const interval = setInterval(() => {
      activeModels.forEach(model => {
        if (model.tokens.total === Infinity) return;
        const lastRefresh = new Date(model.tokens.lastRefresh || new Date());
        const now = new Date();
        const sixHours = 6 * 60 * 60 * 1000;
        if (now.getTime() - lastRefresh.getTime() >= sixHours) {
          updateModelTokens(model.id, { ...model.tokens, available: model.tokens.total, lastRefresh: new Date().toISOString(), refreshTime: '6h' });
          setDisabledModelIds(prev => prev.filter(id => id !== model.id));
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [activeModels, updateModelTokens]);

  if (sessionEnded) {
    const modelRatings = activeModels.map(model => {
      const modelMessages = messages.filter(
        message => !message.isUser && message.modelId === model.id && ratings[message.id] !== undefined
      );
      const total = modelMessages.reduce((sum, msg) => sum + (ratings[msg.id] || 0), 0);
      const avg = modelMessages.length > 0 ? total / modelMessages.length : 0;
      return { model, avg, count: modelMessages.length };
    });
    modelRatings.sort((a, b) => b.avg - a.avg);
    return (
      <div className="h-screen bg-gray-800 flex flex-col items-center justify-center select-none animate-fadeIn">
        <h2 className="text-3xl font-bold text-gray-200 mb-4">Session Summary</h2>
        <div className="w-full max-w-2xl bg-gray-700 p-4 rounded-lg">
          {modelRatings.map(({ model, avg }) => {
            const rounded = Math.round(avg);
            return (
              <div key={model.id} className="flex items-center justify-between border-b border-gray-600 py-2">
                <div className="flex items-center gap-3">
                  <img src={model.icon} alt={model.name} className="w-8 h-8 rounded-full" />
                  <span className="text-white font-medium">{model.name}</span>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map(i => (
                    <span key={i} className={`${i <= rounded ? 'text-yellow-400' : 'text-gray-400'}`}>
                      ★
                    </span>
                  ))}
                  <span className="ml-2 text-gray-300">{avg.toFixed(1)}/5</span>
                </div>
              </div>
            );
          })}
        </div>
        <button
          onClick={onBackToHome}
          className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg transition-all duration-300 ease-in-out hover:bg-blue-500"
        >
          Back to Home
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-800 flex flex-col select-none overflow-hidden animate-fadeIn">
      {/* Header */}
      <header className="bg-gray-900 p-4 border-b border-gray-700 flex justify-between items-center select-none transition-all duration-500 ease-in-out">
        <button
          onClick={onBackToHome}
          className="text-xl text-blue-400 hover:text-blue-300 transition-all duration-500 ease-in-out select-none"
        >
          <span>&#8249; Back</span>
        </button>
        <h1 className="text-2xl font-bold text-blue-400 select-none transition-all duration-500 ease-in-out">
          ChatCompare
        </h1>
        <button
          onClick={handleEndSession}
          className="text-xl font-bold px-4 py-2 bg-blue-600 text-white rounded-lg transition-all duration-300 ease-in-out hover:bg-blue-500 select-none"
        >
          End Session
        </button>
      </header>

      {/* Chat container */}
      <div className="flex-1 flex overflow-hidden">
        {activeModels.map((model, index) => {
          const bgClass = index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-700';
          return (
            <div key={model.id} className={`flex-1 flex flex-col border-r border-gray-700 ${bgClass} transition-all duration-500 ease-in-out`}>
              {/* Model header */}
              <div className="bg-gray-900 p-3 flex flex-col border-b border-gray-700 select-none transition-all duration-500 ease-in-out">
                <div className="flex items-center justify-between select-none">
                  <div className="flex items-center gap-2 select-none">
                    <img src={model.icon} className="w-8 h-8 rounded-full select-none" alt={model.name} />
                    <div className="flex items-center gap-2 select-none">
                      <span className="text-gray-200 font-medium select-none">{model.name}</span>
                      <span className="text-white text-xs select-none">{model.description || 'Description placeholder'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 select-none">
                    <span className="text-gray-400 text-xs select-none">
                      {model.tokens.total === Infinity 
                        ? "Unlimited" 
                        : `${model.tokens.available.toLocaleString()} / ${model.tokens.total.toLocaleString()} tokens`}
                    </span>
                    {activeModels.length > 1 && (
                      <button
                        onClick={() => handleRemoveModel(model.id)}
                        className="text-gray-400 hover:text-red-400 transition-all duration-500 ease-in-out select-none"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Messages area */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text transition-all duration-500 ease-in-out">
                {messages
                  .filter(message => {
                    if (message.isUser) {
                      return message.timestamp >= modelJoinTimestamps[model.id];
                    }
                    return message.modelId === model.id;
                  })
                  .map(message => {
                    let bubbleClass = message.isUser 
                      ? 'bg-blue-600 text-white' 
                      : (message.isError ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-200');
                    if (message.isDisabled) {
                      bubbleClass = 'bg-yellow-500 text-white';
                    }
                    return (
                      <div key={message.id} className={`transition-all duration-500 ease-in-out ${message.isUser ? 'flex justify-end' : 'flex justify-start'}`}>
                        <div className={`max-w-3/4 rounded-lg p-3 transition-all duration-500 ease-in-out ${bubbleClass}`}>
                          {renderMessageContent(message)}
                        </div>
                        {!message.isUser && (
                          <div className="ml-2">
                            {renderRating(message)}
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Input area with suggestion buttons */}
      <div className="bg-gray-900 p-4 border-t border-gray-700 relative select-none transition-all duration-500 ease-in-out">
        <div className="flex gap-2 mb-2 flex-nowrap overflow-hidden">
          {displayedSuggestions.map((suggestion, idx) => (
            <button
              key={idx}
              className={`bg-gray-700 text-gray-200 p-2 h-10 rounded-lg border border-gray-600 cursor-pointer transition-all duration-300 ease-in-out select-none whitespace-nowrap ${
                fadingIndices.includes(idx) ? 'opacity-0' : 'opacity-100'
              } hover:border-blue-500 hover:bg-gray-600`}
              onClick={() => handleSuggestionClick(suggestion, idx)}
            >
              {suggestion}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSendMessage()}
            placeholder="Type your message here..."
            className="flex-1 bg-gray-700 text-gray-200 p-3 rounded-lg border border-gray-600 focus:border-blue-500 focus:outline-none select-text transition-all duration-300 ease-in-out"
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputValue.trim()}
            className="text-xl font-bold w-36 bg-blue-600 text-white p-3 rounded-lg disabled:opacity-50 hover:bg-blue-500 transition-all duration-300 ease-in-out"
          >
            Send
          </button>
          {availableModels.filter(model => !activeModelIds.includes(model.id) && (model.tokens.total === Infinity || model.tokens.available > 0)).length > 0 && (
            <button
              onClick={() => setShowModelSelector(!showModelSelector)}
              className={`text-xl w-72 font-bold bg-gray-700 text-gray-200 p-3 rounded-lg border transition-all duration-300 ease-in-out select-none ${
                showModelSelector ? 'border-blue-500' : 'border-gray-600 hover:border-blue-500'
              }`}
            >
              + Add Chatbot
            </button>
          )}
        </div>
      </div>

      {/* Model selector popup */}
      <div className={`absolute bottom-16 right-4 z-10 bg-gray-800 rounded-lg border border-gray-700 shadow-lg overflow-hidden model-selector-popup select-none transition-opacity duration-500 ease-in-out ${showModelSelector ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}>
        <div className="p-3 border-b border-gray-700 select-none">
          <h3 className="text-sm font-bold text-gray-200 select-none">Add a Chatbot</h3>
        </div>
        <div className="max-h-80 overflow-y-auto p-2 space-y-2 w-72 select-none">
          {availableModels.filter(model => !activeModelIds.includes(model.id)).map(model => (
            <div
              key={model.id}
              className={`bg-gray-700 rounded-lg p-2 flex items-center gap-3 border border-gray-600 transition-all duration-300 ease-in-out select-none ${model.tokens.total === Infinity || model.tokens.available > 0 ? 'cursor-pointer hover:border-blue-500' : 'opacity-50'}`}
              onClick={() => (model.tokens.total === Infinity || model.tokens.available > 0) && handleAddModel(model)}
            >
              <img src={model.icon} className="w-7 h-7 rounded-full select-none" alt={model.name} />
              <div className="flex-1 min-w-0 select-none">
                <h4 className="text-gray-200 font-medium text-sm truncate select-none">{model.name}</h4>
                <div className="text-xs select-none">
                  <p className="text-gray-400 truncate select-none">
                    {model.tokens.total === Infinity 
                      ? "Unlimited" 
                      : `${model.tokens.available.toLocaleString()} / ${model.tokens.total.toLocaleString()} tokens`}
                    {model.tokens.refreshTime ? ` • Refreshes in ${model.tokens.refreshTime}` : ''}
                  </p>
                </div>
              </div>
              {model.tokens.total !== Infinity && model.tokens.available === 0 && (
                <span className="text-yellow-500 text-xs whitespace-nowrap select-none">No tokens</span>
              )}
            </div>
          ))}
          {availableModels.filter(model => !activeModelIds.includes(model.id)).length === 0 && (
            <p className="text-center py-2 text-sm text-gray-400 select-none">All models are already active</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
