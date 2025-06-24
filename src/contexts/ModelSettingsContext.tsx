import React, { createContext, useContext, useEffect, useState } from 'react';

export type LLMModel = 
  | 'deepseek/deepseek-r1-0528-qwen3-8b:free'
  | 'mistralai/mistral-7b-instruct:free'
  | 'meta-llama/llama-3.3-8b-instruct:free';

export interface ModelInfo {
  id: LLMModel;
  name: string;
  description: string;
}

export const AVAILABLE_MODELS: ModelInfo[] = [
  {
    id: 'deepseek/deepseek-r1-0528-qwen3-8b:free',
    name: 'DeepSeek R1 Qwen3 8B',
    description: 'Advanced reasoning model with strong analytical capabilities'
  },
  {
    id: 'mistralai/mistral-7b-instruct:free',
    name: 'Mistral 7B Instruct',
    description: 'Efficient instruction-following model with balanced performance'
  },
  {
    id: 'meta-llama/llama-3.3-8b-instruct:free',
    name: 'Llama 3.3 8B Instruct',
    description: 'Latest Llama model with improved instruction following'
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
      : 'meta-llama/llama-3.3-8b-instruct:free'; // Default to Llama 3.3
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
