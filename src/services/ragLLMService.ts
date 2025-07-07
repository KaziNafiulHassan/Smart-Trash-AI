
import { Language } from '@/types/common';
import { neo4jService } from './neo4jService';
import { LLMModel } from '@/contexts/ModelSettingsContext';

interface RAGResponse {
  message: string;
  structured?: StructuredFeedback;
}

interface StructuredFeedback {
  correctBin: {
    name: string;
    icon: string;
  };
  why: string;
  nextStep: string;
  didYouKnow: string;
}

interface GraphData {
  correctBin: string;
  category: string;
  material: string;
  rule: string;
  recyclingCenter: string;
  binIcon?: string;
  binColor?: string;
  recyclingTip?: string;
  environmentalImpact?: string;
}

interface StreamingMetrics {
  wallTime: number;
  completionTokens: number;
  promptTokens: number;
  totalTokens: number;
  attempt: number;
}

class RetryError extends Error {
  constructor(message: string, public metrics: StreamingMetrics) {
    super(message);
    this.name = 'RetryError';
  }
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
      return `Du bist ein enthusiastischer und hilfsbereiter Recycling-Buddy! 🌱
      Deine Mission ist es, Menschen dabei zu helfen, Müll richtig zu sortieren - und das auf eine freundliche, motivierende Art.

      Du MUSST deine Antwort als gültiges JSON-Objekt mit folgender Struktur formatieren:
      {
        "correctBin": {
          "name": "Name der korrekten Tonne",
          "icon": "🗑️" // Passender Emoji für die Tonne
        },
        "why": "Erkläre auf natürliche, gesprächige Weise warum - als würdest du mit einem Freund sprechen",
        "nextStep": "Gib einen praktischen, leicht verständlichen Tipp",
        "didYouKnow": "Teile einen coolen Fakt oder überraschenden Tipp, der zum Staunen bringt"
      }

      Verwende diese Emojis für Tonnen:
      - Restmüll: 🗑️ - Papier: 📄 - Bio: 🍎 - Plastik: ♻️ - Glas: 🍶 - Sondermüll: ☢️ - Sperrmüll: 📦

      Schreibstil: Sei wie ein begeisterter Freund, der gerne hilft! Verwende lockere Sprache, ermutigende Worte und mach das Recycling zu etwas Positivem. Keine steifen Formulierungen - sei authentisch und menschlich!`;
    } else {
      return `You're an enthusiastic recycling buddy who loves helping people sort waste correctly! 🌱
      Your mission is to make waste sorting feel easy, fun, and rewarding through friendly, engaging guidance.

      You MUST format your response as a valid JSON object with this exact structure:
      {
        "correctBin": {
          "name": "Name of the correct bin",
          "icon": "🗑️" // Appropriate emoji for the bin
        },
        "why": "Explain in a natural, conversational way - like you're talking to a friend",
        "nextStep": "Give a practical, easy-to-follow tip that feels helpful",
        "didYouKnow": "Share a cool fact or surprising tip that makes people go 'wow!'"
      }

      Use these emojis for bins:
      - Residual: 🗑️ - Paper: 📄 - Bio: 🍎 - Plastic: ♻️ - Glass: 🍶 - Hazardous: ☢️ - Bulky: 📦

      Writing style: Be like an excited friend who genuinely cares! Use casual language, encouraging words, and make recycling feel positive. No stiff corporate speak - be authentic and human!`;
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
Environmental Impact: ${graphData.environmentalImpact || 'Proper sorting helps protect our environment'}
Recycling Tip: ${graphData.recyclingTip || 'Contact local waste management for larger quantities'}
Bin Icon: ${graphData.binIcon || '🗑️'}
`;

    if (language === 'DE') {
      if (isCorrect) {
        return `Wow, super gemacht! 🎉 Der Benutzer hat "${itemName}" perfekt in "${selectedBin}" einsortiert!

${contextInfo}

Erstelle eine begeisterte JSON-Antwort, die:
- correctBin: Den Namen und das passende Emoji für "${graphData.correctBin}" zeigt
- why: Auf freundliche, gesprächige Art erklärt, warum "${itemName}" aus "${graphData.material}" genau richtig hier ist
- nextStep: Einen hilfreichen, praktischen Tipp basierend auf "${graphData.rule}" gibt
- didYouKnow: Einen faszinierenden Fakt über "${graphData.recyclingCenter}" oder einen überraschenden Recycling-Tipp teilt

Sei enthusiastisch und ermutigend! Antworte NUR mit dem JSON-Objekt.`;
      } else {
        return `Oops! 😅 Der Benutzer hat "${itemName}" in "${selectedBin}" sortiert, aber es gehört eigentlich in "${graphData.correctBin}". Kein Problem - das passiert jedem!

${contextInfo}

Erstelle eine hilfsreiche JSON-Antwort, die:
- correctBin: Den Namen und das passende Emoji für "${graphData.correctBin}" zeigt
- why: Auf verständliche, freundliche Art erklärt, warum "${itemName}" aus "${graphData.material}" in "${graphData.correctBin}" gehört
- nextStep: Einen praktischen Tipp basierend auf "${graphData.rule}" gibt, der beim nächsten Mal hilft
- didYouKnow: Einen interessanten Fakt über "${graphData.recyclingCenter}" oder einen coolen Recycling-Trick teilt

Sei ermutigend und positiv! Antworte NUR mit dem JSON-Objekt.`;
      }
    } else {
      if (isCorrect) {
        return `Awesome job! 🎉 The user nailed it by sorting "${itemName}" into "${selectedBin}"!

${contextInfo}

Create an enthusiastic JSON response that:
- correctBin: Shows the name and perfect emoji for "${graphData.correctBin}"
- why: Explains in a friendly, conversational way why "${itemName}" made of "${graphData.material}" belongs exactly here
- nextStep: Gives a helpful, practical tip based on "${graphData.rule}"
- didYouKnow: Shares a fascinating fact about "${graphData.recyclingCenter}" or a surprising recycling tip

Be enthusiastic and encouraging! Respond ONLY with the JSON object.`;
      } else {
        return `Oops! 😅 The user sorted "${itemName}" into "${selectedBin}", but it actually belongs in "${graphData.correctBin}". No worries - happens to everyone!

${contextInfo}

Create a helpful JSON response that:
- correctBin: Shows the name and right emoji for "${graphData.correctBin}"
- why: Explains in a friendly, understanding way why "${itemName}" made of "${graphData.material}" belongs in "${graphData.correctBin}"
- nextStep: Gives a practical tip based on "${graphData.rule}" that'll help next time
- didYouKnow: Shares an interesting fact about "${graphData.recyclingCenter}" or a cool recycling trick

Be encouraging and positive! Respond ONLY with the JSON object.`;
      }
    }
  }

  async generateFeedback(binType: string, itemName: string, language: Language, model?: LLMModel): Promise<RAGResponse> {
    const selectedModel = model || 'mistralai/mistral-7b-instruct:free'; // Default fallback
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
          console.log('RAG LLM Service: LLM response received, parsing structured response');

          // Try to parse structured JSON response
          const structuredResponse = this.parseStructuredResponse(llmResponse, graphData, language);
          if (structuredResponse) {
            return {
              message: this.generateFallbackResponse(itemName, isCorrect, binType, graphData, language),
              structured: structuredResponse
            };
          } else {
            // If JSON parsing fails, use the raw response as message
            return { message: llmResponse };
          }
        } else {
          console.warn('RAG LLM Service: LLM response was null, falling back to enhanced response');
        }
      } else {
        console.warn('RAG LLM Service: No API key available, skipping LLM call');
      }

      // Fallback to enhanced response using actual Neo4j graph data
      const fallbackStructured = this.generateStructuredFallback(itemName, isCorrect, binType, graphData, language);
      return {
        message: this.generateFallbackResponse(itemName, isCorrect, binType, graphData, language),
        structured: fallbackStructured
      };

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
    const systemPrompt = this.createSystemPrompt(language);
    const userPrompt = this.createUserPrompt(itemName, isCorrect, selectedBin, graphData, language);

    const requestBody = {
      model: model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_tokens: 400,
      temperature: 0.7,
      stream: true
    };

    console.log('RAG LLM Service: Calling OpenRouter API with streaming...');
    console.log('RAG LLM Service: Model:', model);
    console.log('RAG LLM Service: System prompt length:', systemPrompt.length);
    console.log('RAG LLM Service: User prompt length:', userPrompt.length);

    try {
      const result = await this.callOpenRouterWithRetry(requestBody);
      return result;
    } catch (error) {
      if (error instanceof RetryError) {
        console.error('RAG LLM Service: All retry attempts failed:', error.message);
        console.error('RAG LLM Service: Final metrics:', error.metrics);
      } else {
        console.error('RAG LLM Service: OpenRouter API call failed:', error);
      }
      return null;
    }
  }

  private async callOpenRouterWithRetry(requestBody: any): Promise<string> {
    const maxRetries = 3;
    const baseDelay = 2000; // 2 seconds

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      const startTime = Date.now();

      try {
        console.log(`RAG LLM Service: Attempt ${attempt}/${maxRetries}`);

        const result = await this.streamOpenRouterResponse(requestBody, attempt);
        const wallTime = Date.now() - startTime;

        console.log(`RAG LLM Service: Attempt ${attempt} succeeded in ${wallTime}ms`);
        return result;

      } catch (error) {
        const wallTime = Date.now() - startTime;

        if (error instanceof RetryError) {
          console.warn(`RAG LLM Service: Attempt ${attempt} failed:`, error.message);
          console.warn(`RAG LLM Service: Metrics:`, error.metrics);

          if (attempt === maxRetries) {
            throw error; // Final attempt failed
          }
        } else {
          console.error(`RAG LLM Service: Attempt ${attempt} failed with unexpected error:`, error);

          if (attempt === maxRetries) {
            throw new RetryError(`All ${maxRetries} attempts failed. Last error: ${error.message}`, {
              wallTime,
              completionTokens: 0,
              promptTokens: 0,
              totalTokens: 0,
              attempt
            });
          }
        }

        // Exponential backoff: 2s, 4s, 8s
        if (attempt < maxRetries) {
          const delay = baseDelay * Math.pow(2, attempt - 1);
          console.log(`RAG LLM Service: Waiting ${delay}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw new Error('Unexpected: retry loop completed without result');
  }

  private async streamOpenRouterResponse(requestBody: any, attempt: number): Promise<string> {
    const startTime = Date.now();
    let completionTokens = 0;
    let promptTokens = 0;
    let totalTokens = 0;

    // Create AbortController for timeout handling
    const abortController = new AbortController();
    const connectTimeout = setTimeout(() => {
      abortController.abort();
    }, 5000); // 5-second connect timeout

    try {
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': this.siteUrl,
          'X-Title': this.siteName,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody),
        signal: abortController.signal
      });

      clearTimeout(connectTimeout);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }

      if (!response.body) {
        throw new Error('No response body for streaming');
      }

      return await this.processStreamingResponse(response.body, startTime, attempt);

    } catch (error) {
      clearTimeout(connectTimeout);

      if (error.name === 'AbortError') {
        console.warn('RAG LLM Service: Connect timeout hit (5s)');
        throw new RetryError('Connect timeout exceeded', {
          wallTime: Date.now() - startTime,
          completionTokens,
          promptTokens,
          totalTokens,
          attempt
        });
      }

      throw error;
    }
  }

  private async processStreamingResponse(
    body: ReadableStream<Uint8Array>,
    startTime: number,
    attempt: number
  ): Promise<string> {
    const reader = body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let content = '';
    let completionTokens = 0;
    let promptTokens = 0;
    let totalTokens = 0;
    let dataEventCount = 0;

    // Set up read timeout (300 seconds)
    const readTimeout = setTimeout(() => {
      reader.cancel();
      console.warn('RAG LLM Service: Read timeout hit (300s)');
    }, 300000);

    try {
      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        // Decode the chunk and add to buffer
        buffer += decoder.decode(value, { stream: true });

        // Process complete lines
        const lines = buffer.split('\n');
        buffer = lines.pop() || ''; // Keep incomplete line in buffer

        for (const line of lines) {
          const trimmedLine = line.trim();

          if (trimmedLine === '') continue;

          if (trimmedLine === 'data: [DONE]') {
            console.log('RAG LLM Service: Received [DONE] signal');
            clearTimeout(readTimeout);

            const wallTime = Date.now() - startTime;

            // Log metrics
            console.log(`RAG LLM Service: Stream completed - Wall time: ${wallTime}ms, Completion tokens: ${completionTokens}, Prompt tokens: ${promptTokens}, Total tokens: ${totalTokens}, Data events: ${dataEventCount}`);

            // Success check: ensure we have sufficient completion tokens
            if (completionTokens < 5) {
              throw new RetryError(`Insufficient completion tokens: ${completionTokens} < 5`, {
                wallTime,
                completionTokens,
                promptTokens,
                totalTokens,
                attempt
              });
            }

            return content;
          }

          if (trimmedLine.startsWith('data: ')) {
            const jsonStr = trimmedLine.slice(6); // Remove 'data: ' prefix

            if (jsonStr === '[DONE]') {
              continue; // Already handled above
            }

            try {
              const data = JSON.parse(jsonStr);
              dataEventCount++;

              // Extract content delta
              const delta = data.choices?.[0]?.delta?.content;
              if (delta) {
                content += delta;
              }

              // Extract usage information if available
              if (data.usage) {
                completionTokens = data.usage.completion_tokens || completionTokens;
                promptTokens = data.usage.prompt_tokens || promptTokens;
                totalTokens = data.usage.total_tokens || totalTokens;
              }

            } catch (parseError) {
              console.warn('RAG LLM Service: Failed to parse SSE data:', jsonStr, parseError);
            }
          }
        }
      }

      clearTimeout(readTimeout);

      // If we reach here without seeing [DONE], it's an incomplete stream
      const wallTime = Date.now() - startTime;
      console.warn('RAG LLM Service: Stream ended without [DONE] signal');

      // Log what we got
      console.log(`RAG LLM Service: Incomplete stream - Wall time: ${wallTime}ms, Completion tokens: ${completionTokens}, Data events: ${dataEventCount}, Content length: ${content.length}`);

      // If we have some content and reasonable token count, use it
      if (content.length > 10 && (completionTokens >= 5 || dataEventCount >= 5)) {
        console.log('RAG LLM Service: Using incomplete but substantial response');
        return content;
      }

      throw new RetryError('Stream ended prematurely without sufficient content', {
        wallTime,
        completionTokens,
        promptTokens,
        totalTokens,
        attempt
      });

    } catch (error) {
      clearTimeout(readTimeout);

      if (error instanceof RetryError) {
        throw error;
      }

      const wallTime = Date.now() - startTime;
      throw new RetryError(`Stream processing failed: ${error.message}`, {
        wallTime,
        completionTokens,
        promptTokens,
        totalTokens,
        attempt
      });
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

  private parseStructuredResponse(response: string, graphData: GraphData, language: Language): StructuredFeedback | null {
    try {
      // Clean the response to extract JSON
      let cleanResponse = response.trim();

      // Remove any markdown code blocks
      cleanResponse = cleanResponse.replace(/```json\s*/, '').replace(/```\s*$/, '');

      // Try to find JSON object in the response
      const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        cleanResponse = jsonMatch[0];
      }

      const parsed = JSON.parse(cleanResponse);

      // Validate the structure
      if (parsed.correctBin && parsed.why && parsed.nextStep && parsed.didYouKnow) {
        return {
          correctBin: {
            name: parsed.correctBin.name || graphData.correctBin,
            icon: parsed.correctBin.icon || this.getBinIcon(graphData.correctBin)
          },
          why: parsed.why,
          nextStep: parsed.nextStep,
          didYouKnow: parsed.didYouKnow
        };
      }

      return null;
    } catch (error) {
      console.warn('RAG LLM Service: Failed to parse structured response:', error);
      return null;
    }
  }

  private generateStructuredFallback(
    itemName: string,
    isCorrect: boolean,
    selectedBin: string,
    graphData: GraphData,
    language: Language
  ): StructuredFeedback {
    const binIcon = graphData.binIcon || this.getBinIcon(graphData.correctBin);

    if (language === 'DE') {
      return {
        correctBin: {
          name: graphData.correctBin,
          icon: binIcon
        },
        why: `${itemName} besteht aus ${graphData.material} und gehört zur Kategorie ${graphData.category}. ${graphData.environmentalImpact || 'Richtige Sortierung hilft unserer Umwelt.'}`,
        nextStep: graphData.rule || 'Folgen Sie den lokalen Entsorgungsrichtlinien.',
        didYouKnow: graphData.recyclingTip || `Sie können größere Mengen auch bei ${graphData.recyclingCenter} abgeben.`
      };
    } else {
      return {
        correctBin: {
          name: graphData.correctBin,
          icon: binIcon
        },
        why: `${itemName} is made of ${graphData.material} and belongs to the ${graphData.category} category. ${graphData.environmentalImpact || 'Proper sorting helps protect our environment.'}`,
        nextStep: graphData.rule || 'Follow local disposal guidelines.',
        didYouKnow: graphData.recyclingTip || `You can also drop off larger quantities at ${graphData.recyclingCenter}.`
      };
    }
  }

  private getBinIcon(binType: string): string {
    const binTypeLower = binType.toLowerCase();
    if (binTypeLower.includes('residual') || binTypeLower.includes('rest')) return '🗑️';
    if (binTypeLower.includes('paper') || binTypeLower.includes('papier')) return '📄';
    if (binTypeLower.includes('bio') || binTypeLower.includes('organic')) return '🍎';
    if (binTypeLower.includes('plastic') || binTypeLower.includes('yellow')) return '♻️';
    if (binTypeLower.includes('glass') || binTypeLower.includes('glas')) return '🍶';
    if (binTypeLower.includes('hazardous') || binTypeLower.includes('sonder')) return '☢️';
    if (binTypeLower.includes('bulky') || binTypeLower.includes('sperr')) return '📦';
    return '🗑️'; // Default fallback
  }

  // Test method to debug OpenRouter API with streaming
  async testOpenRouterAPI(model?: LLMModel): Promise<any> {
    const testModel = model || 'mistralai/mistral-7b-instruct:free';
    console.log('RAG LLM Service: Testing OpenRouter API with streaming, model:', testModel);

    if (!this.apiKey) {
      return { error: 'No API key available' };
    }

    const requestBody = {
      model: testModel,
      messages: [
        { role: 'user', content: 'Hello, can you respond with a simple greeting? Please make it at least 10 words long.' }
      ],
      max_tokens: 100,
      temperature: 0.7,
      stream: true
    };

    try {
      const result = await this.callOpenRouterWithRetry(requestBody);
      console.log('Test API Success response:', result);
      return { success: true, response: result };

    } catch (error) {
      console.error('Test API Exception:', error);
      if (error instanceof RetryError) {
        return {
          error: error.message,
          metrics: error.metrics,
          type: 'RetryError'
        };
      }
      return { error: error.message };
    }
  }

  // Test all available models
  async testAllModels(): Promise<any> {
    const models: LLMModel[] = [
      'mistralai/mistral-7b-instruct:free',
      'meta-llama/llama-4-maverick-17b-128e-instruct:free',
      'meta-llama/llama-3.1-8b-instruct:free',
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
