export type Role = 'admin' | 'agent' | 'assistant';
export type Currency = 'EUR' | 'USD';
export type PropertyStatus = 'draft' | 'active' | 'reserved' | 'sold' | 'rented';
export type Portal = 'Idealista' | 'Fotocasa' | 'Habitaclia' | 'OwnSite';
export type LeadStage = 'new' | 'qualified' | 'visiting' | 'offer' | 'won' | 'lost';
export type Heating = 'none' | 'gas' | 'electric' | 'central';

export interface MediaItem {
  id: string;
  url: string;
  kind: 'photo' | 'plan' | 'video';
  w?: number;
  h?: number;
}

export interface Address {
  street: string;
  city: string;
  state?: string;
  zip?: string;
  country: string;
  lat?: number;
  lng?: number;
}

export interface Features {
  rooms: number;
  baths: number;
  area: number;
  floor?: number;
  hasElevator?: boolean;
  hasBalcony?: boolean;
  heating?: Heating;
  parking?: boolean;
  year?: number;
  energyLabel?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'G';
}

export interface Property {
  id: string;
  ref: string;
  title: string;
  description?: string;
  price: number;
  currency: Currency;
  status: PropertyStatus;
  type: 'flat' | 'house' | 'studio' | 'office' | 'plot';
  address: Address;
  features: Features;
  media: MediaItem[];
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface LeadPreferences {
  city?: string;
  type?: Property['type'][];
  minRooms?: number;
  minArea?: number;
  maxPrice?: number;
  mustHave?: Array<'elevator' | 'balcony' | 'parking'>;
}

export interface Lead {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  stage: LeadStage;
  budget?: number;
  preferences?: LeadPreferences;
  source?: string;
  note?: string;
  lostReason?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  propertyId: string;
  leadId: string;
  when: string;
  note?: string;
  status: 'scheduled' | 'done' | 'no_show' | 'canceled';
  reminderMins?: number;
}

export interface Publication {
  id: string;
  propertyId: string;
  portal: Portal;
  status: 'queued' | 'publishing' | 'published' | 'error';
  url?: string;
  message?: string;
  progress?: number;
  updatedAt: string;
}

export interface MatchResult {
  leadId: string;
  propertyId: string;
  score: number;
  reasons: string[];
}

export interface ValuationInput {
  address: Address;
  features: Features;
  priceHint?: number;
}

export interface ValuationResult {
  suggestedPrice: number;
  range: [number, number];
  comps: Array<{
    ref: string;
    distanceKm: number;
    price: number;
    area: number;
    rooms: number;
  }>;
  rationale: string[];
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
}

export interface Contract {
  id: string;
  propertyId: string;
  leadId: string;
  template: string;
  variables: Record<string, string>;
  status: 'draft' | 'sent' | 'signed' | 'completed';
  signatureData?: string;
  createdAt: string;
  updatedAt: string;
}

export interface KPIData {
  activeProperties: number;
  newLeads: number;
  weeklyVisits: number;
  conversionRate: number;
  revenue: number;
  avgDaysToClose: number;
}

export interface FunnelData {
  stage: LeadStage;
  count: number;
  value: number;
}

export interface MarketingTemplate {
  id: string;
  type: 'ad' | 'email' | 'reel';
  style: 'friendly' | 'luxury' | 'investor';
  template: string;
}