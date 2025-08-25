import type { Lead, Property, MatchResult, ValuationInput, ValuationResult } from '@/features/core/types';

export interface AiDriver {
  matchLeadToProperties(lead: Lead, properties: Property[]): Promise<MatchResult[]>;
  estimatePrice(input: ValuationInput): Promise<ValuationResult>;
  writeAd(property: Property, style: 'friendly' | 'luxury' | 'investor'): Promise<string>;
  writeEmail(context: {
    to: string;
    subject: string;
    goal: string;
    bullets: string[];
  }): Promise<string>;
  writeReelScript(property: Property, seconds: number): Promise<string>;
}

let driver: AiDriver;

export async function getAiDriver(): Promise<AiDriver> {
  if (!driver) {
    const baseUrl = import.meta.env.VITE_AI_BASE_URL;
    if (baseUrl) {
      const { HttpAiDriver } = await import('./http');
      driver = new HttpAiDriver(baseUrl);
    } else {
      const { MockAiDriver } = await import('./mock');
      driver = new MockAiDriver();
    }
  }
  return driver;
}