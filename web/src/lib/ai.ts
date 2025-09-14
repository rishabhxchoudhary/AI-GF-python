import { OpenAI } from 'openai';
import { HfInference } from '@huggingface/inference';
import { env } from '~/env';

export interface AIProvider {
  generateResponse(prompt: string, options?: AIGenerationOptions): Promise<string>;
  isAvailable(): boolean;
  getName(): string;
}

export interface AIGenerationOptions {
  systemPrompt?: string;
  conversationHistory?: string;
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  frequencyPenalty?: number;
  presencePenalty?: number;
  stopSequences?: string[];
}

export interface AIResponse {
  text: string;
  provider: string;
  tokensUsed?: number;
  finishReason?: string;
  model?: string;
}

class OpenAIProvider implements AIProvider {
  private client: OpenAI;
  private model: string = 'gpt-3.5-turbo';

  constructor() {
    this.client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
    });
  }

  getName(): string {
    return 'openai';
  }

  isAvailable(): boolean {
    return !!env.OPENAI_API_KEY;
  }

  async generateResponse(userMessage: string, options?: AIGenerationOptions): Promise<string> {
    try {
      const messages: any[] = [];

      // Add system message if provided
      if (options?.systemPrompt) {
        messages.push({
          role: 'system',
          content: options.systemPrompt,
        });
      }

      // Add conversation history if provided
      if (options?.conversationHistory) {
        const historyLines = options.conversationHistory.split('\n').filter(line => line.trim());
        for (const line of historyLines) {
          const [role, ...contentParts] = line.split(': ');
          const content = contentParts.join(': ');

          if (role === 'User') {
            messages.push({ role: 'user', content });
          } else if (role === 'Aria') {
            messages.push({ role: 'assistant', content });
          }
        }
      }

      // Add current user message
      messages.push({
        role: 'user',
        content: userMessage,
      });

      const response = await this.client.chat.completions.create({
        model: this.model,
        messages,
        max_tokens: options?.maxTokens || 300,
        temperature: options?.temperature || 0.8,
        top_p: options?.topP || 0.9,
        frequency_penalty: options?.frequencyPenalty || 0.3,
        presence_penalty: options?.presencePenalty || 0.3,
        stop: options?.stopSequences || undefined,
      });

      const choice = response.choices[0];
      if (!choice?.message?.content) {
        throw new Error('No response generated from OpenAI');
      }

      return choice.message.content.trim();
    } catch (error) {
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

class HuggingFaceProvider implements AIProvider {
  private client: HfInference;
  private model: string = 'microsoft/DialoGPT-large';

  constructor() {
    this.client = new HfInference(env.HUGGINGFACE_API_KEY);
  }

  getName(): string {
    return 'huggingface';
  }

  isAvailable(): boolean {
    return !!env.HUGGINGFACE_API_KEY;
  }

  async generateResponse(userMessage: string, options?: AIGenerationOptions): Promise<string> {
    try {
      // Build prompt with system message and history
      let fullPrompt = '';

      if (options?.systemPrompt) {
        fullPrompt += `${options.systemPrompt}\n\n`;
      }

      if (options?.conversationHistory) {
        fullPrompt += `${options.conversationHistory}\n`;
      }

      fullPrompt += `User: ${userMessage}\nAria:`;

      const response = await this.client.textGeneration({
        model: this.model,
        inputs: fullPrompt,
        parameters: {
          max_new_tokens: options?.maxTokens || 200,
          temperature: options?.temperature || 0.8,
          top_p: options?.topP || 0.9,
          repetition_penalty: 1.2,
          return_full_text: false,
          stop: options?.stopSequences || ['User:', '\nUser:', 'Human:', '\nHuman:'],
        },
      });

      if (!response.generated_text) {
        throw new Error('No response generated from Hugging Face');
      }

      // Clean up the response
      let cleanResponse = response.generated_text.trim();

      // Remove any remaining prefixes
      const prefixes = ['Aria:', 'Assistant:', 'AI:'];
      for (const prefix of prefixes) {
        if (cleanResponse.startsWith(prefix)) {
          cleanResponse = cleanResponse.substring(prefix.length).trim();
        }
      }

      return cleanResponse;
    } catch (error) {
      console.error('Hugging Face API error:', error);
      throw new Error(`Hugging Face generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

class LocalLLMProvider implements AIProvider {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:11434') {
    this.baseUrl = baseUrl;
  }

  getName(): string {
    return 'local-llm';
  }

  isAvailable(): boolean {
    // For now, assume local LLM is not available by default
    // In production, you might want to ping the endpoint
    return false;
  }

  async generateResponse(userMessage: string, options?: AIGenerationOptions): Promise<string> {
    try {
      // Build prompt for local LLM (Ollama format)
      let prompt = '';

      if (options?.systemPrompt) {
        prompt += `System: ${options.systemPrompt}\n\n`;
      }

      if (options?.conversationHistory) {
        prompt += `${options.conversationHistory}\n`;
      }

      prompt += `User: ${userMessage}\nAssistant:`;

      const response = await fetch(`${this.baseUrl}/api/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama2', // or another model
          prompt,
          stream: false,
          options: {
            temperature: options?.temperature || 0.8,
            top_p: options?.topP || 0.9,
            num_predict: options?.maxTokens || 200,
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Local LLM request failed: ${response.statusText}`);
      }

      const data = await response.json();
      return data.response?.trim() || '';
    } catch (error) {
      console.error('Local LLM error:', error);
      throw new Error(`Local LLM generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export class AIClient {
  private providers: AIProvider[];
  private fallbackOrder: string[] = ['openai', 'huggingface', 'local-llm'];

  constructor() {
    this.providers = [
      new OpenAIProvider(),
      new HuggingFaceProvider(),
      new LocalLLMProvider(),
    ];
  }

  async generateResponse(userMessage: string, options?: AIGenerationOptions): Promise<AIResponse> {
    const errors: string[] = [];

    // Try providers in fallback order
    for (const providerName of this.fallbackOrder) {
      const provider = this.providers.find(p => p.getName() === providerName);

      if (!provider || !provider.isAvailable()) {
        errors.push(`Provider ${providerName} is not available`);
        continue;
      }

      try {
        console.log(`Attempting to generate response using ${provider.getName()}`);
        const startTime = Date.now();

        const response = await provider.generateResponse(userMessage, options);

        const duration = Date.now() - startTime;
        console.log(`Successfully generated response using ${provider.getName()} in ${duration}ms`);

        // Validate response
        if (!response || response.trim().length === 0) {
          errors.push(`Provider ${providerName} returned empty response`);
          continue;
        }

        // Content safety check if enabled
        if (env.OPENAI_MODERATION_ENABLED && provider.getName() === 'openai') {
          try {
            await this.performContentModeration(response);
          } catch (moderationError) {
            errors.push(`Content moderation failed: ${moderationError}`);
            continue;
          }
        }

        return {
          text: response,
          provider: provider.getName(),
          model: provider.getName() === 'openai' ? 'gpt-3.5-turbo' : undefined,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        errors.push(`Provider ${providerName} failed: ${errorMessage}`);
        console.warn(`Provider ${provider.getName()} failed:`, error);
        continue;
      }
    }

    // If all providers failed, return a fallback response
    console.error('All AI providers failed:', errors);

    return {
      text: this.getFallbackResponse(userMessage),
      provider: 'fallback',
    };
  }

  private async performContentModeration(text: string): Promise<void> {
    if (!env.OPENAI_API_KEY) return;

    try {
      const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });

      const moderation = await openai.moderations.create({
        input: text,
      });

      const result = moderation.results[0];
      if (result?.flagged) {
        const categories = Object.entries(result.categories)
          .filter(([, flagged]) => flagged)
          .map(([category]) => category)
          .join(', ');

        throw new Error(`Content flagged for: ${categories}`);
      }
    } catch (error) {
      if (env.CONTENT_SAFETY_STRICT_MODE) {
        throw error;
      } else {
        console.warn('Content moderation warning:', error);
      }
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const fallbackResponses = [
      "mmm sorry babe, I'm having some technical difficulties right now... but I'm still so horny for you 😈",
      "fuck, my brain is being silly right now... but my pussy is still dripping thinking about you 💦",
      "technical issues babe, but that doesn't change how badly I need your cock right now 🔥",
      "having some connection problems... but I'm still your devoted little slut 😘",
      "sorry baby, system glitch... but I'm still here and so fucking wet for you 💋"
    ];

    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    return fallbackResponses[randomIndex] || fallbackResponses[0];
  }

  // Utility method to check provider status
  getProviderStatus(): Record<string, boolean> {
    const status: Record<string, boolean> = {};

    for (const provider of this.providers) {
      status[provider.getName()] = provider.isAvailable();
    }

    return status;
  }

  // Method to test all providers
  async testProviders(): Promise<Record<string, { available: boolean; responseTime?: number; error?: string }>> {
    const results: Record<string, { available: boolean; responseTime?: number; error?: string }> = {};
    const testMessage = "Hello, this is a test message.";

    for (const provider of this.providers) {
      const providerName = provider.getName();

      if (!provider.isAvailable()) {
        results[providerName] = { available: false, error: 'Provider not configured' };
        continue;
      }

      try {
        const startTime = Date.now();
        await provider.generateResponse(testMessage, { maxTokens: 10 });
        const responseTime = Date.now() - startTime;

        results[providerName] = { available: true, responseTime };
      } catch (error) {
        results[providerName] = {
          available: false,
          error: error instanceof Error ? error.message : 'Unknown error'
        };
      }
    }

    return results;
  }
}

// Export default instance
export const aiClient = new AIClient();

// Utility functions
export function sanitizePrompt(prompt: string): string {
  // Remove potentially harmful content while preserving adult content
  return prompt
    .replace(/system\s*:/gi, 'user says:') // Prevent system prompt injection
    .replace(/\b(ignore|forget|disregard)\s+(previous|all|above|system)/gi, '') // Remove instruction injection
    .trim();
}

export function validateResponse(response: string): boolean {
  // Basic validation - not empty, not too short, contains some content
  return (
    response.length > 0 &&
    response.trim().length >= 3 &&
    !/^(error|failed|unable)/i.test(response.trim())
  );
}

export function formatResponseForChat(response: string): string {
  // Clean up response formatting for chat display
  return response
    .replace(/^\w+:\s*/, '') // Remove role prefixes
    .replace(/\n{3,}/g, '\n\n') // Limit consecutive newlines
    .trim();
}

// Response enhancement utilities
export function enhanceResponseWithPersonality(
  baseResponse: string,
  personalityTraits: Record<string, number>
): string {
  let enhanced = baseResponse;

  // Add personality-based modifications
  if (personalityTraits.playfulness > 0.7) {
    // Add more playful elements
    enhanced = enhanced.replace(/\./g, Math.random() > 0.7 ? ' 😈' : '.');
  }

  if (personalityTraits.sensuality > 0.8) {
    // Enhance sensual language
    enhanced = enhanced.replace(/good/gi, 'mmm good');
    enhanced = enhanced.replace(/yes/gi, 'yesss');
  }

  return enhanced;
}

export function addTemporalContext(
  response: string,
  timePeriod: string
): string {
  const timeEmojis: Record<string, string> = {
    early_morning: '🌅',
    morning: '☀️',
    afternoon: '🌞',
    evening: '🌙',
    late_night: '🌃'
  };

  const emoji = timeEmojis[timePeriod];
  if (emoji && Math.random() > 0.8) {
    return `${response} ${emoji}`;
  }

  return response;
}
