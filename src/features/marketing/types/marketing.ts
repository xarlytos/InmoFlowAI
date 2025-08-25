import type { Property } from '@/features/core/types';

export type ContentType = 'ad' | 'email' | 'reel' | 'social' | 'blog' | 'flyer';
export type Style = 'friendly' | 'luxury' | 'investor' | 'professional' | 'casual' | 'urgent';
export type ExportFormat = 'text' | 'html' | 'pdf' | 'image';
export type ApprovalStatus = 'draft' | 'pending' | 'approved' | 'rejected';

export interface ContentHistory {
  id: string;
  title: string;
  content: string;
  type: ContentType;
  style: Style;
  propertyId?: string;
  createdAt: Date;
  updatedAt: Date;
  isFavorite: boolean;
  tags: string[];
  metrics?: ContentMetrics;
  versions: ContentVersion[];
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
  approvedAt?: Date;
  comments: ContentComment[];
}

export interface ContentVersion {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  changeNote?: string;
}

export interface ContentComment {
  id: string;
  userId: string;
  userName: string;
  comment: string;
  createdAt: Date;
  isResolved: boolean;
}

export interface ContentMetrics {
  engagement?: number;
  reach?: number;
  clicks?: number;
  conversions?: number;
  sentiment?: 'positive' | 'neutral' | 'negative';
  seoScore?: number;
}

export interface Template {
  id: string;
  name: string;
  description: string;
  content: string;
  type: ContentType;
  style: Style;
  variables: string[];
  isPublic: boolean;
  createdBy: string;
  createdAt: Date;
  usageCount: number;
  rating: number;
}

export interface AudienceSegment {
  id: string;
  name: string;
  description: string;
  criteria: {
    ageRange?: [number, number];
    location?: string[];
    interests?: string[];
    propertyTypes?: string[];
    budget?: [number, number];
  };
  size: number;
}

export interface BatchGenerationJob {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  properties: Property[];
  template: Template;
  options: {
    variations: number;
    schedule?: Date;
  };
  results: ContentHistory[];
  createdAt: Date;
  completedAt?: Date;
  error?: string;
}

export interface SEOAnalysis {
  score: number;
  keywords: string[];
  suggestions: string[];
  hashtags: string[];
  readabilityScore: number;
  sentimentScore: number;
}

export interface MultimediaContent {
  images: {
    url: string;
    alt: string;
    prompt: string;
  }[];
  music?: {
    url: string;
    title: string;
    duration: number;
  };
  effects?: string[];
}

export interface BrandSettings {
  primaryColor: string;
  secondaryColor: string;
  logo?: string;
  fonts: {
    primary: string;
    secondary: string;
  };
  voice: {
    tone: string;
    personality: string[];
    avoidWords: string[];
  };
}

export interface IntegrationSettings {
  socialMedia: {
    facebook?: { accessToken: string; pageId: string };
    instagram?: { accessToken: string; businessAccountId: string };
    twitter?: { accessToken: string; refreshToken: string };
  };
  emailMarketing: {
    mailchimp?: { apiKey: string; listId: string };
    sendgrid?: { apiKey: string; templateId: string };
  };
  crm: {
    hubspot?: { accessToken: string };
    salesforce?: { accessToken: string; instanceUrl: string };
  };
}