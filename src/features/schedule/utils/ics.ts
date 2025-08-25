import { format } from 'date-fns';
import type { Visit, Property, Lead } from '@/features/core/types';

export function generateICS(visits: Visit[], properties: Property[], leads: Lead[]): string {
  const getProperty = (id: string) => properties.find(p => p.id === id);
  const getLead = (id: string) => leads.find(l => l.id === id);

  const formatDate = (date: string): string => {
    return format(new Date(date), "yyyyMMdd'T'HHmmss");
  };

  const createEvent = (visit: Visit): string => {
    const property = getProperty(visit.propertyId);
    const lead = getLead(visit.leadId);
    
    const start = formatDate(visit.when);
    const end = formatDate(new Date(new Date(visit.when).getTime() + 60 * 60 * 1000).toISOString()); // 1 hour duration
    
    return [
      'BEGIN:VEVENT',
      `UID:${visit.id}@inmoflow.com`,
      `DTSTART:${start}`,
      `DTEND:${end}`,
      `SUMMARY:Property Visit: ${property?.title || 'Unknown Property'}`,
      `DESCRIPTION:Visit with ${lead?.name || 'Unknown Lead'}\\n${property?.address.street || ''}\\n${visit.note || ''}`,
      `LOCATION:${property?.address.street || ''}, ${property?.address.city || ''}`,
      `STATUS:${visit.status.toUpperCase()}`,
      visit.reminderMins ? `BEGIN:VALARM\nACTION:DISPLAY\nDESCRIPTION:Reminder\nTRIGGER:-PT${visit.reminderMins}M\nEND:VALARM` : '',
      'END:VEVENT'
    ].filter(Boolean).join('\n');
  };

  const calendar = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//InmoFlow AI//Visit Calendar//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    ...visits.map(createEvent),
    'END:VCALENDAR'
  ].join('\n');

  return calendar;
}