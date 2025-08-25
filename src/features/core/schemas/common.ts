import { z } from 'zod';

export const addressSchema = z.object({
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  zip: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export const featuresSchema = z.object({
  rooms: z.number().min(0, 'Rooms must be 0 or more'),
  baths: z.number().min(0, 'Bathrooms must be 0 or more'),
  area: z.number().min(1, 'Area must be greater than 0'),
  floor: z.number().optional(),
  hasElevator: z.boolean().optional(),
  hasBalcony: z.boolean().optional(),
  heating: z.enum(['none', 'gas', 'electric', 'central']).optional(),
  parking: z.boolean().optional(),
  year: z.number().min(1800).max(new Date().getFullYear() + 5).optional(),
  energyLabel: z.enum(['A', 'B', 'C', 'D', 'E', 'F', 'G']).optional(),
});

export const mediaItemSchema = z.object({
  id: z.string(),
  url: z.string().url(),
  kind: z.enum(['photo', 'plan', 'video']),
  w: z.number().optional(),
  h: z.number().optional(),
});