import { z } from 'zod';

export const visitSchema = z.object({
  id: z.string().optional(),
  propertyId: z.string().min(1, 'Property is required'),
  leadId: z.string().min(1, 'Lead is required'),
  when: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid date'),
  note: z.string().optional(),
  status: z.enum(['scheduled', 'done', 'no_show', 'canceled']),
  reminderMins: z.number().min(0).optional(),
});

export type VisitFormData = z.infer<typeof visitSchema>;