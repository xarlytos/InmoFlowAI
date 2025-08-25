import { z } from 'zod';
import { addressSchema, featuresSchema, mediaItemSchema } from '@/features/core/schemas/common';

export const propertySchema = z.object({
  id: z.string().optional(),
  ref: z.string().min(1, 'Reference is required'),
  title: z.string().min(3, 'Title must be at least 3 characters').max(120, 'Title too long'),
  description: z.string().optional(),
  price: z.number().min(1, 'Price must be greater than 0'),
  currency: z.enum(['EUR', 'USD']),
  status: z.enum(['draft', 'active', 'reserved', 'sold', 'rented']),
  type: z.enum(['flat', 'house', 'studio', 'office', 'plot']),
  address: addressSchema,
  features: featuresSchema,
  media: z.array(mediaItemSchema).max(50, 'Maximum 50 media items allowed'),
  tags: z.array(z.string()).optional(),
});

export type PropertyFormData = z.infer<typeof propertySchema>;