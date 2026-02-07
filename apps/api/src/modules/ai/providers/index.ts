export interface AIProvider {
  generateText(prompt: string, model?: string): Promise<{ text: string; usage: { inputTokens: number; outputTokens: number; totalTokens: number } }>;
}
