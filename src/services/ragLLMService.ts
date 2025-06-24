
import { Language } from '@/types/common';
import { neo4jService } from './neo4jService';
import { LLMModel } from '@/contexts/ModelSettingsContext';

interface RAGResponse {
  message: string;
}

interface GraphData {
  correctBin: string;
  category: string;
  material: string;
  rule: string;
  recyclingCenter: string;
}

class RAGLLMService {
  private apiKey: string;
  private baseUrl: string = 'https://openrouter.ai/api/v1/chat/completions';
  private siteUrl: string;
  private siteName: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    this.siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:8080';
    this.siteName = import.meta.env.VITE_SITE_NAME || 'Eco Sort Adventures';

    console.log('RAG LLM Service: Constructor called');
    console.log('RAG LLM Service: API Key length:', this.apiKey ? this.apiKey.length : 0);
    console.log('RAG LLM Service: Site URL:', this.siteUrl);
    console.log('RAG LLM Service: Site Name:', this.siteName);

    if (!this.apiKey) {
      console.warn('RAG LLM Service: OpenRouter API key not found, will use fallback responses');
    } else {
      console.log('RAG LLM Service: API key loaded successfully');
    }
  }

  private createSystemPrompt(language: Language): string {
    if (language === 'DE') {
      return `Du bist ein freundlicher und sachkundiger KI-Assistent für Mülltrennung und Recycling.
      Deine Aufgabe ist es, Benutzern dabei zu helfen, Abfall richtig zu sortieren und zu entsorgen.

      Antworte in einem natürlichen, gesprächigen Ton, als würdest du mit einem Freund sprechen.
      Sei ermutigend, lehrreich und hilfreich. Verwende Emojis sparsam, um deine Nachrichten freundlicher zu gestalten.
      Halte deine Antworten prägnant (2-3 Sätze) aber informativ.

      Konzentriere dich auf:
      - Warum der Gegenstand in diese Kategorie gehört
      - Praktische Tipps für die Entsorgung
      - Umweltauswirkungen oder Recycling-Vorteile
      - Wo man den Gegenstand entsorgen kann`;
    } else {
      return `You are a friendly and knowledgeable AI assistant for waste sorting and recycling.
      Your job is to help users properly sort and dispose of waste items.

      Respond in a natural, conversational tone as if talking to a friend.
      Be encouraging, educational, and helpful. Use emojis sparingly to make your messages friendlier.
      Keep your responses concise (2-3 sentences) but informative.

      Focus on:
      - Why the item belongs in this category
      - Practical disposal tips
      - Environmental impact or recycling benefits
      - Where to dispose of the item`;
    }
  }

  private createUserPrompt(
    itemName: string,
    isCorrect: boolean,
    selectedBin: string,
    graphData: GraphData,
    language: Language
  ): string {
    const contextInfo = `
Item: ${itemName}
Correct Bin: ${graphData.correctBin}
Category: ${graphData.category}
Material: ${graphData.material}
Disposal Rule: ${graphData.rule}
Recycling Center: ${graphData.recyclingCenter}
`;

    if (language === 'DE') {
      if (isCorrect) {
        return `Der Benutzer hat "${itemName}" korrekt in "${selectedBin}" sortiert.

Kontext-Informationen:
${contextInfo}

Gib eine ermutigende Antwort, die erklärt, warum diese Wahl richtig war, und teile nützliche Tipps basierend auf den Kontext-Informationen mit.`;
      } else {
        return `Der Benutzer hat "${itemName}" fälschlicherweise in "${selectedBin}" sortiert, aber es gehört in "${graphData.correctBin}".

Kontext-Informationen:
${contextInfo}

Erkläre freundlich, warum es in die richtige Tonne gehört, und gib hilfreiche Tipps basierend auf den Kontext-Informationen.`;
      }
    } else {
      if (isCorrect) {
        return `The user correctly sorted "${itemName}" into "${selectedBin}".

Context Information:
${contextInfo}

Provide an encouraging response explaining why this choice was correct and share useful tips based on the context information.`;
      } else {
        return `The user incorrectly sorted "${itemName}" into "${selectedBin}", but it belongs in "${graphData.correctBin}".

Context Information:
${contextInfo}

Kindly explain why it belongs in the correct bin and provide helpful tips based on the context information.`;
      }
    }
  }

  async generateFeedback(binType: string, itemName: string, language: Language, model?: LLMModel): Promise<RAGResponse> {
    const selectedModel = model || 'meta-llama/llama-3.1-8b-instruct:free'; // Default fallback
    console.log(`RAG LLM Service: Generating feedback for "${itemName}" with bin type "${binType}" using model "${selectedModel}"`);

    try {
      // First, get the graph data from Neo4j
      const graphData = await neo4jService.getWasteItemInfo(binType, itemName);
      console.log('RAG LLM Service: Retrieved graph data:', graphData);

      // Determine if the sorting was correct (simplified logic)
      const isCorrect = graphData.correctBin.toLowerCase().includes(binType.toLowerCase()) ||
                       binType.toLowerCase().includes(graphData.correctBin.toLowerCase().split(' ')[0]);

      // Generate LLM response using graph data
      if (this.apiKey) {
        console.log('RAG LLM Service: API key available, calling OpenRouter...');
        const llmResponse = await this.callOpenRouterAPI(itemName, isCorrect, binType, graphData, language, selectedModel);
        if (llmResponse) {
          console.log('RAG LLM Service: LLM response received, returning it');
          return { message: llmResponse };
        } else {
          console.warn('RAG LLM Service: LLM response was null, falling back to enhanced response');
        }
      } else {
        console.warn('RAG LLM Service: No API key available, skipping LLM call');
      }

      // Fallback to enhanced response using actual Neo4j graph data
      return { message: this.generateFallbackResponse(itemName, isCorrect, binType, graphData, language) };

    } catch (error) {
      console.error('RAG LLM Service: Error generating feedback:', error);
      throw new Error(`Failed to generate AI feedback: ${error.message}`);
    }
  }

  private async callOpenRouterAPI(
    itemName: string,
    isCorrect: boolean,
    selectedBin: string,
    graphData: GraphData,
    language: Language,
    model: LLMModel
  ): Promise<string | null> {
    try {
      console.log('RAG LLM Service: Calling OpenRouter API...');
      console.log('RAG LLM Service: API URL:', this.baseUrl);
      console.log('RAG LLM Service: Model:', model);
      console.log('RAG LLM Service: Site URL:', this.siteUrl);
      console.log('RAG LLM Service: API Key (first 10 chars):', this.apiKey.substring(0, 10) + '...');

      const systemPrompt = this.createSystemPrompt(language);
      const userPrompt = this.createUserPrompt(itemName, isCorrect, selectedBin, graphData, language);

      console.log('RAG LLM Service: System prompt length:', systemPrompt.length);
      console.log('RAG LLM Service: User prompt length:', userPrompt.length);

      const requestBody = {
        model: model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 200,
        temperature: 0.7
      };

      console.log('RAG LLM Service: Request body:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.siteName,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      console.log('RAG LLM Service: Response status:', response.status);
      console.log('RAG LLM Service: Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('RAG LLM Service: OpenRouter API error:', response.status, response.statusText);
        console.error('RAG LLM Service: Error response body:', errorText);
        return null;
      }

      const data = await response.json();
      console.log('RAG LLM Service: Full API response:', JSON.stringify(data, null, 2));

      const message = data.choices?.[0]?.message?.content;

      if (message && message.trim()) {
        console.log('RAG LLM Service: Successfully generated LLM response:', message);
        return message.trim();
      } else {
        console.warn('RAG LLM Service: No message content in API response');
        console.warn('RAG LLM Service: Response structure:', data);
        return null;
      }

    } catch (error) {
      console.error('RAG LLM Service: OpenRouter API call failed:', error);
      return null;
    }
  }

  private generateFallbackResponse(
    itemName: string,
    isCorrect: boolean,
    selectedBin: string,
    graphData: GraphData,
    language: Language
  ): string {
    // Enhanced fallback using actual graph data
    if (language === 'DE') {
      if (isCorrect) {
        return `Toll gemacht! 🎉 "${itemName}" gehört tatsächlich in die ${graphData.correctBin}. Da es aus ${graphData.material} besteht, ist das die richtige Wahl. Tipp: ${graphData.rule} Für größere Mengen können Sie auch das ${graphData.recyclingCenter} nutzen.`;
      } else {
        return `Nicht ganz richtig! 🤔 "${itemName}" gehört eigentlich in die ${graphData.correctBin}, nicht in die ${selectedBin}. Da es aus ${graphData.material} besteht, sollten Sie beachten: ${graphData.rule} Das ${graphData.recyclingCenter} kann Ihnen auch weiterhelfen.`;
      }
    } else {
      if (isCorrect) {
        return `Great job! 🎉 "${itemName}" indeed belongs in the ${graphData.correctBin}. Since it's made of ${graphData.material}, that's the right choice. Tip: ${graphData.rule} For larger quantities, you can also use ${graphData.recyclingCenter}.`;
      } else {
        return `Not quite right! 🤔 "${itemName}" actually belongs in the ${graphData.correctBin}, not the ${selectedBin}. Since it's made of ${graphData.material}, remember: ${graphData.rule} The ${graphData.recyclingCenter} can also help you.`;
      }
    }
  }

  // Test method to debug OpenRouter API
  async testOpenRouterAPI(model?: LLMModel): Promise<any> {
    const testModel = model || 'meta-llama/llama-3.1-8b-instruct:free';
    console.log('RAG LLM Service: Testing OpenRouter API directly with model:', testModel);

    if (!this.apiKey) {
      return { error: 'No API key available' };
    }

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.siteName,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: testModel,
          messages: [
            { role: 'user', content: 'Hello, can you respond with a simple greeting?' }
          ],
          max_tokens: 50,
          temperature: 0.7
        })
      });

      console.log('Test API Response status:', response.status);
      console.log('Test API Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Test API Error details:', errorText);
        return {
          error: `API Error: ${response.status} ${response.statusText}`,
          details: errorText
        };
      }

      const data = await response.json();
      console.log('Test API Success response:', data);
      return { success: true, data };

    } catch (error) {
      console.error('Test API Exception:', error);
      return { error: error.message };
    }
  }

  // Test all available models
  async testAllModels(): Promise<any> {
    const models: LLMModel[] = [
      'meta-llama/llama-3.1-8b-instruct:free',
      'mistralai/mistral-7b-instruct:free',
      'meta-llama/llama-3.2-3b-instruct:free',
      'qwen/qwen2.5-vl-32b-instruct:free'
    ];

    const results: any = {};

    for (const model of models) {
      console.log(`\n=== Testing model: ${model} ===`);
      results[model] = await this.testOpenRouterAPI(model);
      console.log(`Result for ${model}:`, results[model]);
    }

    return results;
  }

}

// Export a singleton instance
export const ragLLMService = new RAGLLMService();

// Expose for debugging in browser console
if (typeof window !== 'undefined') {
  (window as any).ragLLMService = ragLLMService;
}
