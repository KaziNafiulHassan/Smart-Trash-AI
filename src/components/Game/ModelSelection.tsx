import React from 'react';
import { Bot, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useModelSettings, AVAILABLE_MODELS, LLMModel } from '@/contexts/ModelSettingsContext';
import { Language } from '@/types/common';

interface ModelSelectionProps {
  language: Language;
}

const texts = {
  EN: {
    modelSelection: 'AI Model',
    selectModel: 'Select AI Model',
    currentModel: 'Current Model'
  },
  DE: {
    modelSelection: 'KI-Modell',
    selectModel: 'KI-Modell Auswählen',
    currentModel: 'Aktuelles Modell'
  }
};

const ModelSelection: React.FC<ModelSelectionProps> = ({ language }) => {
  const { selectedModel, setSelectedModel, getModelInfo } = useModelSettings();
  const t = texts[language];
  const currentModelInfo = getModelInfo(selectedModel);

  const handleModelSelect = (model: LLMModel) => {
    console.log('Model Selection: Changing model to', model);
    setSelectedModel(model);
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-900 dark:text-gray-300">
        {t.modelSelection}
      </label>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-between bg-white hover:bg-gray-50 border-gray-300 text-gray-900 hover:text-gray-900 dark:bg-purple-900/30 dark:hover:bg-purple-800/40 dark:border-purple-400/30 dark:text-purple-200"
          >
            <div className="flex items-center space-x-2">
              <Bot className="h-4 w-4" />
              <span className="truncate">
                {currentModelInfo?.name || 'Select Model'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 opacity-50" />
          </Button>
        </DropdownMenuTrigger>
        
        <DropdownMenuContent
          align="start"
          className="w-80 bg-white dark:bg-gray-900 backdrop-blur-sm border-gray-200 dark:border-purple-400/30 shadow-lg"
        >
          {AVAILABLE_MODELS.map((model) => (
            <DropdownMenuItem
              key={model.id}
              onClick={() => handleModelSelect(model.id)}
              className={`cursor-pointer p-3 hover:bg-gray-100 dark:hover:bg-purple-800/30 ${
                selectedModel === model.id
                  ? 'bg-blue-50 dark:bg-purple-900/50 border-l-4 border-blue-500 dark:border-cyan-400'
                  : ''
              }`}
            >
              <div className="flex flex-col space-y-1">
                <div className="flex items-center space-x-2">
                  <Bot className="h-4 w-4 text-blue-600 dark:text-cyan-400" />
                  <span className="font-medium text-gray-900 dark:text-gray-100">
                    {model.name}
                  </span>
                  {selectedModel === model.id && (
                    <span className="text-xs bg-blue-600 dark:bg-cyan-500 text-white px-2 py-1 rounded-full">
                      {t.currentModel}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-600 dark:text-gray-400 ml-6">
                  {model.description}
                </p>
              </div>
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
      
      {currentModelInfo && (
        <p className="text-xs text-gray-600 dark:text-gray-400">
          {currentModelInfo.description}
        </p>
      )}
    </div>
  );
};

export default ModelSelection;
