
import { Language } from '@/types/common';
import { neo4jService } from './neo4jService';

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
  private model: string = 'google/gemma-2-9b-it:free'; // Using free Gemma model
  private siteUrl: string;
  private siteName: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_OPENROUTER_API_KEY || '';
    this.siteUrl = import.meta.env.VITE_SITE_URL || 'http://localhost:8080';
    this.siteName = import.meta.env.VITE_SITE_NAME || 'Eco Sort Adventures';

    if (!this.apiKey) {
      console.warn('RAG LLM Service: OpenRouter API key not found, will use fallback responses');
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

  async generateFeedback(binType: string, itemName: string, language: Language): Promise<RAGResponse> {
    console.log(`RAG LLM Service: Generating feedback for "${itemName}" with bin type "${binType}"`);

    try {
      // First, get the graph data from Neo4j
      const graphData = await neo4jService.getWasteItemInfo(binType, itemName);
      console.log('RAG LLM Service: Retrieved graph data:', graphData);

      // Determine if the sorting was correct (simplified logic)
      const isCorrect = graphData.correctBin.toLowerCase().includes(binType.toLowerCase()) ||
                       binType.toLowerCase().includes(graphData.correctBin.toLowerCase().split(' ')[0]);

      // Generate LLM response using graph data
      if (this.apiKey) {
        const llmResponse = await this.callOpenRouterAPI(itemName, isCorrect, binType, graphData, language);
        if (llmResponse) {
          return { message: llmResponse };
        }
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
    language: Language
  ): Promise<string | null> {
    try {
      console.log('RAG LLM Service: Calling OpenRouter API...');

      const systemPrompt = this.createSystemPrompt(language);
      const userPrompt = this.createUserPrompt(itemName, isCorrect, selectedBin, graphData, language);

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.siteName,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          max_tokens: 200,
          temperature: 0.7
        })
      });

      if (!response.ok) {
        console.error('RAG LLM Service: OpenRouter API error:', response.status, response.statusText);
        return null;
      }

      const data = await response.json();
      const message = data.choices?.[0]?.message?.content;

      if (message) {
        console.log('RAG LLM Service: Successfully generated LLM response');
        return message.trim();
      } else {
        console.warn('RAG LLM Service: No message content in API response');
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


}

// Export a singleton instance
export const ragLLMService = new RAGLLMService();
