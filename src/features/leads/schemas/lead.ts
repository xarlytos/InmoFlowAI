import { z } from 'zod';

export const leadPreferencesSchema = z.object({
  city: z.string().optional(),
  type: z.array(z.enum(['flat', 'house', 'studio', 'office', 'plot'])).optional(),
  minRooms: z.number().min(0).optional(),
  minArea: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  mustHave: z.array(z.enum(['elevator', 'balcony', 'parking'])).optional(),
});

export const leadSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters').max(80, 'Name too long'),
  email: z.string().email('Invalid email').optional(),
  phone: z.string().optional(),
  stage: z.enum(['new', 'qualified', 'visiting', 'offer', 'won', 'lost']),
  budget: z.number().min(0).optional(),
  preferences: leadPreferencesSchema.optional(),
  source: z.string().optional(),
  note: z.string().optional(),
  lostReason: z.string().max(240, 'Reason too long').optional(),
});

export type LeadFormData = z.infer<typeof leadSchema>;