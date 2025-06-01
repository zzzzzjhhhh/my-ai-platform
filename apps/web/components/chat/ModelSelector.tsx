"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChevronDown } from 'lucide-react';

export interface ModelOption {
  id: string;
  name: string;
  description: string;
  cost: 'free' | 'paid';
}

interface ModelSelectorProps {
  selectedModel: string;
  onModelChange: (modelId: string) => void;
  disabled?: boolean;
}

const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: 'deepseek/deepseek-r1-0528:free',
    name: 'DeepSeek: R1 0528',
    description: 'May 28th update to the original DeepSeek May 28th update to the original DeepSeek R1.',   
    cost: 'free'
  },
  {
    id: 'meta-llama/llama-3.1-8b-instruct:free',
    name: 'Llama 3.1 8B',
    description: 'Fast and efficient, good for most conversations',
    cost: 'free'
  },
  {
    id: 'google/gemini-flash-1.5',
    name: 'Gemini Flash 1.5',
    description: 'Google\'s fast and efficient model',
    cost: 'paid'
  }
];

export function ModelSelector({ selectedModel, onModelChange, disabled = false }: ModelSelectorProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  
  const selectedModelInfo = AVAILABLE_MODELS.find(model => model.id === selectedModel) || AVAILABLE_MODELS[0] as ModelOption;

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className="w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{selectedModelInfo.name}</span>
          {selectedModelInfo.cost === 'free' && (
            <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">FREE</span>
          )}
        </div>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <Card className="absolute top-full left-0 right-0 z-50 mt-1 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Select AI Model</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 pt-0">
            {AVAILABLE_MODELS.map((model) => (
              <Button
                key={model.id}
                variant={model.id === selectedModel ? "default" : "ghost"}
                className="w-full justify-start h-auto p-3"
                onClick={() => {
                  onModelChange(model.id);
                  setIsOpen(false);
                }}
              >
                <div className="text-left">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{model.name}</span>
                    {model.cost === 'free' && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">FREE</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground text-wrap">{model.description}</p>
                </div>
              </Button>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
} 