import { nanoid } from 'nanoid';
import type { Property, Lead, Visit, Publication, User, Contract, MarketingTemplate } from '@/features/core/types';

// In-memory database
export const db = {
  users: [
    {
      id: 'user-1',
      email: 'admin@inmoflow.com',
      name: 'Ana García',
      role: 'admin' as const,
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    },
    {
      id: 'user-2', 
      email: 'agent@inmoflow.com',
      name: 'Carlos Ruiz',
      role: 'agent' as const,
      avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop'
    }
  ] as User[],

  properties: [
    {
      id: 'prop-1',
      ref: 'MAD-001',
      title: 'Elegante piso en Salamanca',
      description: 'Precioso piso reformado en el barrio de Salamanca, con acabados de lujo y vistas despejadas.',
      price: 850000,
      currency: 'EUR' as const,
      status: 'active' as const,
      type: 'flat' as const,
      address: {
        street: 'Calle Serrano 95',
        city: 'Madrid',
        zip: '28006',
        country: 'España',
        lat: 40.4318,
        lng: -3.6883
      },
      features: {
        rooms: 3,
        baths: 2,
        area: 120,
        floor: 4,
        hasElevator: true,
        hasBalcony: true,
        heating: 'central' as const,
        parking: true,
        year: 2015,
        energyLabel: 'B' as const
      },
      media: [
        { id: 'media-1', url: 'https://images.pexels.com/photos/1643383/pexels-photo-1643383.jpeg', kind: 'photo' },
        { id: 'media-2', url: 'https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg', kind: 'photo' }
      ],
      tags: ['Lujo', 'Centro', 'Reformado'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'prop-2',
      ref: 'BCN-002',
      title: 'Ático con terraza en Eixample',
      description: 'Espectacular ático con terraza de 40m² en pleno Eixample barcelonés.',
      price: 720000,
      currency: 'EUR' as const,
      status: 'active' as const,
      type: 'flat' as const,
      address: {
        street: 'Passeig de Gràcia 88',
        city: 'Barcelona',
        zip: '08008',
        country: 'España',
        lat: 41.3851,
        lng: 2.1734
      },
      features: {
        rooms: 2,
        baths: 2,
        area: 95,
        floor: 8,
        hasElevator: true,
        hasBalcony: true,
        heating: 'gas' as const,
        parking: false,
        year: 2010,
        energyLabel: 'C' as const
      },
      media: [
        { id: 'media-3', url: 'https://images.pexels.com/photos/1571453/pexels-photo-1571453.jpeg', kind: 'photo' }
      ],
      tags: ['Ático', 'Terraza', 'Centro'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ] as Property[],

  leads: [
    {
      id: 'lead-1',
      name: 'María López',
      email: 'maria.lopez@email.com',
      phone: '+34 666 777 888',
      stage: 'qualified' as const,
      budget: 800000,
      preferences: {
        city: 'Madrid',
        type: ['flat'],
        minRooms: 2,
        minArea: 100,
        maxPrice: 900000,
        mustHave: ['elevator', 'parking']
      },
      source: 'Website',
      note: 'Interesada en mudarse en 3 meses',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'lead-2',
      name: 'Roberto Silva',
      email: 'roberto.silva@email.com',
      phone: '+34 655 444 333',
      stage: 'visiting' as const,
      budget: 600000,
      preferences: {
        city: 'Barcelona',
        type: ['flat', 'studio'],
        minRooms: 1,
        minArea: 70,
        maxPrice: 650000
      },
      source: 'Portal',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ] as Lead[],

  visits: [
    {
      id: 'visit-1',
      propertyId: 'prop-1',
      leadId: 'lead-1',
      when: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      note: 'Primera visita, mostrar zona común',
      status: 'scheduled' as const,
      reminderMins: 60
    }
  ] as Visit[],

  publications: [] as Publication[],
  contracts: [] as Contract[],

  marketingTemplates: [
    {
      id: 'template-1',
      type: 'ad' as const,
      style: 'friendly' as const,
      template: '🏠 ¡Descubre tu nuevo hogar en {{city}}!\n\n{{title}} - €{{price}}\n\n✨ {{rooms}} habitaciones, {{baths}} baños\n📐 {{area}}m² de puro confort'
    },
    {
      id: 'template-2',
      type: 'email' as const,
      style: 'luxury' as const,
      template: 'Estimado/a {{client}},\n\nTengo el placer de presentarle una exclusiva propiedad que cumple con sus criterios de búsqueda...'
    }
  ] as MarketingTemplate[]
};

// Helper functions
export function generateId(): string {
  return nanoid();
}

export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function shouldFail(chance = 0.05): boolean {
  return Math.random() < chance;
}