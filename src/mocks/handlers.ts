import { http, HttpResponse } from 'msw';
import { db, generateId, delay, shouldFail } from './db';
import type { Property, Lead, Visit, Publication, MatchResult, ValuationInput, ValuationResult } from '@/features/core/types';

export const handlers = [
  // Auth
  http.post('/api/auth/login', async ({ request }) => {
    await delay(300);
    
    const body = await request.json() as { email: string; password: string };
    const user = db.users.find(u => u.email === body.email);
    
    if (user && body.password === 'demo123') {
      return HttpResponse.json({ ok: true, user });
    }
    
    return HttpResponse.json({ ok: false, error: 'Invalid credentials' }, { status: 401 });
  }),

  // Properties
  http.get('/api/properties', async ({ request }) => {
    await delay(200);
    
    const url = new URL(request.url);
    const city = url.searchParams.get('city');
    const status = url.searchParams.get('status');
    const type = url.searchParams.get('type');
    
    let filtered = [...db.properties];
    
    if (city) {
      filtered = filtered.filter(p => p.address.city.toLowerCase().includes(city.toLowerCase()));
    }
    if (status) {
      filtered = filtered.filter(p => p.status === status);
    }
    if (type) {
      filtered = filtered.filter(p => p.type === type);
    }
    
    return HttpResponse.json(filtered);
  }),

  http.post('/api/properties', async ({ request }) => {
    await delay(400);
    
    if (shouldFail()) {
      return HttpResponse.json({ error: 'Failed to create property' }, { status: 500 });
    }
    
    const property = await request.json() as Omit<Property, 'id' | 'createdAt' | 'updatedAt'>;
    const newProperty: Property = {
      ...property,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.properties.push(newProperty);
    return HttpResponse.json(newProperty, { status: 201 });
  }),

  http.put('/api/properties/:id', async ({ params, request }) => {
    await delay(300);
    
    const { id } = params;
    const updates = await request.json() as Partial<Property>;
    const index = db.properties.findIndex(p => p.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    db.properties[index] = {
      ...db.properties[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(db.properties[index]);
  }),

  http.delete('/api/properties/:id', async ({ params }) => {
    await delay(200);
    
    const { id } = params;
    const index = db.properties.findIndex(p => p.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Property not found' }, { status: 404 });
    }
    
    db.properties.splice(index, 1);
    return HttpResponse.json({ ok: true });
  }),

  // Leads
  http.get('/api/leads', async () => {
    await delay(200);
    return HttpResponse.json(db.leads);
  }),

  http.post('/api/leads', async ({ request }) => {
    await delay(300);
    
    const lead = await request.json() as Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>;
    const newLead: Lead = {
      ...lead,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.leads.push(newLead);
    return HttpResponse.json(newLead, { status: 201 });
  }),

  http.put('/api/leads/:id', async ({ params, request }) => {
    await delay(300);
    
    const { id } = params;
    const updates = await request.json() as Partial<Lead>;
    const index = db.leads.findIndex(l => l.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Lead not found' }, { status: 404 });
    }
    
    db.leads[index] = {
      ...db.leads[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(db.leads[index]);
  }),

  // Visits
  http.get('/api/visits', async () => {
    await delay(200);
    return HttpResponse.json(db.visits);
  }),

  http.post('/api/visits', async ({ request }) => {
    await delay(300);
    
    const visit = await request.json() as Omit<Visit, 'id'>;
    const newVisit: Visit = {
      ...visit,
      id: generateId()
    };
    
    db.visits.push(newVisit);
    return HttpResponse.json(newVisit, { status: 201 });
  }),

  http.put('/api/visits/:id', async ({ params, request }) => {
    await delay(300);
    
    const { id } = params;
    const updates = await request.json() as Partial<Visit>;
    const index = db.visits.findIndex(v => v.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Visit not found' }, { status: 404 });
    }
    
    db.visits[index] = { ...db.visits[index], ...updates };
    return HttpResponse.json(db.visits[index]);
  }),

  // Publishing
  http.post('/api/publishing/queue', async ({ request }) => {
    await delay(300);
    
    const { propertyId, portals } = await request.json() as { propertyId: string; portals: string[] };
    
    const publications: Publication[] = portals.map(portal => ({
      id: generateId(),
      propertyId,
      portal: portal as any,
      status: 'queued' as const,
      progress: 0,
      updatedAt: new Date().toISOString()
    }));
    
    db.publications.push(...publications);
    
    // Simulate publishing progress
    publications.forEach(pub => {
      simulatePublishingProgress(pub);
    });
    
    return HttpResponse.json(publications, { status: 201 });
  }),

  http.get('/api/publishing/status', async ({ request }) => {
    await delay(100);
    
    const url = new URL(request.url);
    const propertyId = url.searchParams.get('propertyId');
    
    const publications = db.publications.filter(p => p.propertyId === propertyId);
    return HttpResponse.json(publications);
  }),

  // AI endpoints (fallback if using HTTP driver)
  http.post('/api/ai/match', async ({ request }) => {
    await delay(800);
    
    const { lead, properties } = await request.json() as { lead: Lead; properties: Property[] };
    
    // Use the mock AI logic
    const { MockAiDriver } = await import('../ai/mock');
    const aiDriver = new MockAiDriver();
    const results = await aiDriver.matchLeadToProperties(lead, properties);
    
    return HttpResponse.json(results);
  }),

  http.post('/api/ai/valuation', async ({ request }) => {
    await delay(1200);
    
    const input = await request.json() as ValuationInput;
    
    const { MockAiDriver } = await import('../ai/mock');
    const aiDriver = new MockAiDriver();
    const result = await aiDriver.estimatePrice(input);
    
    return HttpResponse.json(result);
  }),

  http.post('/api/ai/marketing', async ({ request }) => {
    await delay(600);
    
    const { type, property, style, context, seconds } = await request.json() as any;
    
    const { MockAiDriver } = await import('../ai/mock');
    const aiDriver = new MockAiDriver();
    
    let result: any = {};
    
    if (type === 'ad') {
      result.ad = await aiDriver.writeAd(property, style);
    } else if (type === 'email') {
      result.email = await aiDriver.writeEmail(context);
    } else if (type === 'reel') {
      result.reel = await aiDriver.writeReelScript(property, seconds);
    }
    
    return HttpResponse.json(result);
  }),

  // Analytics
  http.get('/api/analytics/kpis', async () => {
    await delay(300);
    
    return HttpResponse.json({
      activeProperties: db.properties.filter(p => p.status === 'active').length,
      newLeads: db.leads.filter(l => l.stage === 'new').length,
      weeklyVisits: db.visits.filter(v => {
        const visitDate = new Date(v.when);
        const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        return visitDate > weekAgo;
      }).length,
      conversionRate: 23.5,
      revenue: 2340000,
      avgDaysToClose: 45
    });
  }),

  http.get('/api/analytics/funnel', async () => {
    await delay(200);
    
    const funnelData = [
      { stage: 'new' as const, count: db.leads.filter(l => l.stage === 'new').length, value: 0 },
      { stage: 'qualified' as const, count: db.leads.filter(l => l.stage === 'qualified').length, value: 0 },
      { stage: 'visiting' as const, count: db.leads.filter(l => l.stage === 'visiting').length, value: 0 },
      { stage: 'offer' as const, count: db.leads.filter(l => l.stage === 'offer').length, value: 0 },
      { stage: 'won' as const, count: db.leads.filter(l => l.stage === 'won').length, value: 0 },
    ];
    
    return HttpResponse.json(funnelData);
  }),

  // Contracts
  http.get('/api/contracts', async () => {
    await delay(200);
    return HttpResponse.json(db.contracts);
  }),

  http.post('/api/contracts', async ({ request }) => {
    await delay(400);
    
    const contract = await request.json() as Omit<Contract, 'id' | 'createdAt' | 'updatedAt'>;
    const newContract: Contract = {
      ...contract,
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    db.contracts.push(newContract);
    return HttpResponse.json(newContract, { status: 201 });
  }),

  http.put('/api/contracts/:id', async ({ params, request }) => {
    await delay(300);
    
    const { id } = params;
    const updates = await request.json() as Partial<Contract>;
    const index = db.contracts.findIndex(c => c.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Contract not found' }, { status: 404 });
    }
    
    db.contracts[index] = { 
      ...db.contracts[index], 
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    return HttpResponse.json(db.contracts[index]);
  }),

  // Marketing templates
  http.get('/api/marketing/templates', async () => {
    await delay(100);
    return HttpResponse.json(db.marketingTemplates);
  }),

  http.put('/api/marketing/templates/:id', async ({ params, request }) => {
    await delay(200);
    
    const { id } = params;
    const updates = await request.json() as Partial<MarketingTemplate>;
    const index = db.marketingTemplates.findIndex(t => t.id === id);
    
    if (index === -1) {
      return HttpResponse.json({ error: 'Template not found' }, { status: 404 });
    }
    
    db.marketingTemplates[index] = { ...db.marketingTemplates[index], ...updates };
    return HttpResponse.json(db.marketingTemplates[index]);
  }),
];

// Simulate publishing progress
function simulatePublishingProgress(publication: Publication) {
  const steps = [25, 50, 75, 100];
  let currentStep = 0;
  
  const interval = setInterval(() => {
    if (currentStep >= steps.length) {
      clearInterval(interval);
      return;
    }
    
    publication.progress = steps[currentStep];
    publication.updatedAt = new Date().toISOString();
    
    if (publication.progress === 100) {
      if (shouldFail(0.1)) {
        publication.status = 'error';
        publication.message = 'Failed to publish: Portal temporarily unavailable';
      } else {
        publication.status = 'published';
        publication.url = `https://${publication.portal.toLowerCase()}.com/property/${publication.propertyId}`;
      }
    } else {
      publication.status = 'publishing';
    }
    
    currentStep++;
  }, 1000 + Math.random() * 1000); // Random delay between steps
}