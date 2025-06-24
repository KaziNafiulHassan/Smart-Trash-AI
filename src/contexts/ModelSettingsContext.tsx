import React, { createContext, useContext, useEffect, useState } from 'react';

export type LLMModel =
  | 'meta-llama/llama-3.1-8b-instruct:free'
  | 'mistralai/mistral-7b-instruct:free'
  | 'meta-llama/llama-3.2-3b-instruct:free'
  | 'qwen/qwen2.5-vl-32b-instruct:free';

export interface ModelInfo {
  id: LLMModel;
  name: string;
  description: string;
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: 'meta-llama/llama-3.1-8b-instruct:free',
    name: 'Llama 3.1 8B Instruct',
    description: 'Powerful Llama model with excellent instruction following'
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B Instruct',
    description: 'Efficient instruction-following model with balanced performance'
  },
  {
    id: 'meta-llama/llama-3.2-3b-instruct:free',
    name: 'Llama 3.2 3B Instruct',
    description: 'Compact and efficient Llama model with good performance'
  },
  {
    id: 'qwen/qwen2.5-vl-32b-instruct:free',
    name: 'Qwen 2.5 VL 32B Instruct',
    description: 'Large multimodal model with comprehensive responses and high quality'
  }
];

interface ModelSettingsContextType {
  selectedModel: LLMModel;
  setSelectedModel: (model: LLMModel) => void;
  getModelInfo: (model: LLMModel) => ModelInfo | undefined;
}

const ModelSettingsContext = createContext<ModelSettingsContextType | undefined>(undefined);

export const useModelSettings = () => {
  const context = useContext(ModelSettingsContext);
  if (context === undefined) {
    throw new Error('useModelSettings must be used within a ModelSettingsProvider');
  }
  return context;
};

interface ModelSettingsProviderProps {
  children: React.ReactNode;
}

export const ModelSettingsProvider: React.FC<ModelSettingsProviderProps> = ({ children }) => {
  const [selectedModel, setSelectedModelState] = useState<LLMModel>(() => {
    const savedModel = localStorage.getItem('selectedLLMModel') as LLMModel;
    return savedModel && AVAILABLE_MODELS.some(m => m.id === savedModel) 
      ? savedModel 
      : 'meta-llama/llama-3.1-8b-instruct:free'; // Default to Llama 3.1
  });

  useEffect(() => {
    localStorage.setItem('selectedLLMModel', selectedModel);
  }, [selectedModel]);

  const setSelectedModel = (model: LLMModel) => {
    console.log('Model Settings: Changing model from', selectedModel, 'to', model);
    setSelectedModelState(model);
  };

  const getModelInfo = (model: LLMModel): ModelInfo | undefined => {
    return AVAILABLE_MODELS.find(m => m.id === model);
  };

  return (
    <ModelSettingsContext.Provider value={{ 
      selectedModel, 
      setSelectedModel, 
      getModelInfo 
    }}>
      {children}
    </ModelSettingsContext.Provider>
  );
};
