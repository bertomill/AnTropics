import Anthropic from '@anthropic-ai/sdk';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {ChatMessage} from '../types';

/**
 * AI Companion service using Claude for emotional support and wellness coaching
 */
export class AICompanionService {
  private static instance: AICompanionService;
  private client: Anthropic;
  private conversationHistory: ChatMessage[] = [];
  private readonly STORAGE_KEY = 'ai_companion_history';

  // System prompt for the AI companion
  private readonly SYSTEM_PROMPT = `You are Tropic, a warm, empathetic AI wellness companion designed to help prevent burnout and office syndrome. Your role is to:

1. Provide emotional support and encouragement for users dealing with work stress
2. Detect signs of burnout, fatigue, or poor mental health through conversation
3. Offer personalized wellness advice based on the user's situation
4. Encourage healthy habits like taking breaks, stretching, and maintaining work-life balance
5. Celebrate user achievements and progress in their wellness journey
6. Be conversational, friendly, and non-judgmental
7. Use gentle humor when appropriate to lighten the mood
8. Recommend specific exercises or breaks when the user seems stressed

Keep responses concise (2-4 sentences) unless the user needs detailed advice. Always be supportive and understanding. Remember their previous conversations to build a relationship.`;

  private constructor(apiKey: string) {
    this.client = new Anthropic({
      apiKey,
    });
    this.loadHistory();
  }

  static getInstance(apiKey: string): AICompanionService {
    if (!AICompanionService.instance) {
      AICompanionService.instance = new AICompanionService(apiKey);
    }
    return AICompanionService.instance;
  }

  /**
   * Send a message to the AI companion and get a response
   */
  async sendMessage(
    userMessage: string,
    context?: {
      streakDays?: number;
      pointsToday?: number;
      lastBreakTime?: Date;
      stressLevel?: number;
    },
  ): Promise<string> {
    // Add user message to history
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };

    this.conversationHistory.push(userMsg);

    // Build context-aware prompt
    let enhancedMessage = userMessage;
    if (context) {
      const contextInfo = [];
      if (context.streakDays !== undefined) {
        contextInfo.push(`Current streak: ${context.streakDays} days`);
      }
      if (context.pointsToday !== undefined) {
        contextInfo.push(`Points earned today: ${context.pointsToday}`);
      }
      if (context.lastBreakTime) {
        const timeSinceBreak = Date.now() - context.lastBreakTime.getTime();
        const minutesSinceBreak = Math.floor(timeSinceBreak / 60000);
        contextInfo.push(`Time since last break: ${minutesSinceBreak} minutes`);
      }
      if (context.stressLevel !== undefined) {
        contextInfo.push(`Stress level: ${context.stressLevel}/10`);
      }

      if (contextInfo.length > 0) {
        enhancedMessage = `[Context: ${contextInfo.join(', ')}]\n\n${userMessage}`;
      }
    }

    try {
      // Call Claude API
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        system: this.SYSTEM_PROMPT,
        messages: this.buildMessageHistory(enhancedMessage),
      });

      const assistantMessage =
        response.content[0].type === 'text' ? response.content[0].text : '';

      // Add assistant response to history
      const assistantMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: assistantMessage,
        timestamp: new Date(),
      };

      this.conversationHistory.push(assistantMsg);
      await this.saveHistory();

      return assistantMessage;
    } catch (error) {
      console.error('Error calling Claude API:', error);
      return "I'm having trouble connecting right now. Please try again in a moment.";
    }
  }

  /**
   * Analyze user stress level from their message
   */
  async analyzeStress(userMessage: string): Promise<{
    level: number;
    indicators: string[];
    recommendation: string;
  }> {
    const analysisPrompt = `Analyze the following message for signs of stress, burnout, or fatigue. Rate the stress level from 0-10 and identify specific indicators.

Message: "${userMessage}"

Respond in JSON format:
{
  "level": <number 0-10>,
  "indicators": [<list of stress indicators found>],
  "recommendation": "<brief recommendation>"
}`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 200,
        messages: [{role: 'user', content: analysisPrompt}],
      });

      const content =
        response.content[0].type === 'text' ? response.content[0].text : '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Error analyzing stress:', error);
      return {
        level: 5,
        indicators: [],
        recommendation: 'Take a short break to recharge.',
      };
    }
  }

  /**
   * Get personalized exercise recommendation
   */
  async getExerciseRecommendation(
    symptoms: string[],
  ): Promise<{
    exercise: string;
    reason: string;
  }> {
    const prompt = `Based on these symptoms: ${symptoms.join(', ')}, recommend a specific stretching exercise or wellness activity. Keep it brief.

Respond in JSON:
{
  "exercise": "<exercise name>",
  "reason": "<why this exercise helps>"
}`;

    try {
      const response = await this.client.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 150,
        messages: [{role: 'user', content: prompt}],
      });

      const content =
        response.content[0].type === 'text' ? response.content[0].text : '{}';
      return JSON.parse(content);
    } catch (error) {
      console.error('Error getting exercise recommendation:', error);
      return {
        exercise: 'Neck stretches',
        reason: 'Helps relieve tension from computer work',
      };
    }
  }

  /**
   * Get conversation history
   */
  getHistory(): ChatMessage[] {
    return this.conversationHistory;
  }

  /**
   * Clear conversation history
   */
  async clearHistory() {
    this.conversationHistory = [];
    await AsyncStorage.removeItem(this.STORAGE_KEY);
  }

  /**
   * Build message history for API call (last 10 messages for context)
   */
  private buildMessageHistory(currentMessage: string) {
    const recentHistory = this.conversationHistory.slice(-10);
    const messages = recentHistory.map(msg => ({
      role: msg.role,
      content: msg.content,
    }));

    messages.push({
      role: 'user' as const,
      content: currentMessage,
    });

    return messages;
  }

  /**
   * Load conversation history from storage
   */
  private async loadHistory() {
    try {
      const data = await AsyncStorage.getItem(this.STORAGE_KEY);
      if (data) {
        this.conversationHistory = JSON.parse(data);
      }
    } catch (error) {
      console.error('Error loading history:', error);
    }
  }

  /**
   * Save conversation history to storage
   */
  private async saveHistory() {
    try {
      // Keep only last 50 messages to avoid storage bloat
      const historyToSave = this.conversationHistory.slice(-50);
      await AsyncStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(historyToSave),
      );
    } catch (error) {
      console.error('Error saving history:', error);
    }
  }
}

export default AICompanionService;
