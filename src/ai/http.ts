import type { Lead, Property, MatchResult, ValuationInput, ValuationResult } from '@/features/core/types';
import type { AiDriver } from './llm';

export class HttpAiDriver implements AiDriver {
  constructor(private baseUrl: string) {}

  async matchLeadToProperties(lead: Lead, properties: Property[]): Promise<MatchResult[]> {
    const response = await fetch(`${this.baseUrl}/ai/match`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ lead, properties }),
    });

    if (!response.ok) {
      throw new Error('Failed to match lead to properties');
    }

    return response.json();
  }

  async estimatePrice(input: ValuationInput): Promise<ValuationResult> {
    const response = await fetch(`${this.baseUrl}/ai/valuation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      throw new Error('Failed to estimate price');
    }

    return response.json();
  }

  async writeAd(property: Property, style: 'friendly' | 'luxury' | 'investor'): Promise<string> {
    const response = await fetch(`${this.baseUrl}/ai/marketing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'ad', property, style }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate ad');
    }

    const result = await response.json();
    return result.ad;
  }

  async writeEmail(context: {
    to: string;
    subject: string;
    goal: string;
    bullets: string[];
  }): Promise<string> {
    const response = await fetch(`${this.baseUrl}/ai/marketing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'email', context }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate email');
    }

    const result = await response.json();
    return result.email;
  }

  async writeReelScript(property: Property, seconds: number): Promise<string> {
    const response = await fetch(`${this.baseUrl}/ai/marketing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'reel', property, seconds }),
    });

    if (!response.ok) {
      throw new Error('Failed to generate reel script');
    }

    const result = await response.json();
    return result.reel;
  }
}