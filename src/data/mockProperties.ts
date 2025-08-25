import type { Property } from '@/features/core/types';

export const mockProperties: Property[] = [
  {
    id: '1',
    ref: 'MAD001',
    title: 'Luxury Apartment in Salamanca',
    description: 'Beautiful luxury apartment in the heart of Salamanca district. Completely renovated with high-end finishes, marble floors, and stunning city views. Perfect for those seeking elegance and comfort in Madrid\'s most prestigious neighborhood.',
    price: 750000,
    currency: 'EUR',
    status: 'active',
    type: 'flat',
    address: {
      street: 'Calle Serrano, 45',
      city: 'Madrid',
      state: 'Madrid',
      zip: '28001',
      country: 'Spain',
      lat: 40.4259,
      lng: -3.6898
    },
    features: {
      rooms: 3,
      baths: 2,
      area: 120,
      floor: 4,
      hasElevator: true,
      hasBalcony: true,
      heating: 'central',
      parking: true,
      year: 2020,
      energyLabel: 'A'
    },
    media: [
      {
        id: 'img1',
        url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      },
      {
        id: 'img2',
        url: 'https://images.unsplash.com/photo-1567496898669-ee935f5f647a?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      },
      {
        id: 'img3',
        url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      }
    ],
    tags: ['luxury', 'renovated', 'central'],
    createdAt: '2024-08-20T10:00:00Z',
    updatedAt: '2024-08-22T14:30:00Z'
  },
  {
    id: '2',
    ref: 'MAD002',
    title: 'Modern Studio in Malasaña',
    description: 'Stylish modern studio in trendy Malasaña neighborhood. Perfect for young professionals or students. Recently renovated with modern appliances and great natural light.',
    price: 320000,
    currency: 'EUR',
    status: 'active',
    type: 'studio',
    address: {
      street: 'Calle Fuencarral, 78',
      city: 'Madrid',
      state: 'Madrid',
      zip: '28004',
      country: 'Spain',
      lat: 40.4278,
      lng: -3.7044
    },
    features: {
      rooms: 1,
      baths: 1,
      area: 45,
      floor: 2,
      hasElevator: false,
      hasBalcony: false,
      heating: 'electric',
      parking: false,
      year: 2019,
      energyLabel: 'B'
    },
    media: [
      {
        id: 'img4',
        url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      },
      {
        id: 'img5',
        url: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      }
    ],
    tags: ['modern', 'trendy', 'central'],
    createdAt: '2024-08-15T09:00:00Z',
    updatedAt: '2024-08-21T16:45:00Z'
  },
  {
    id: '3',
    ref: 'MAD003',
    title: 'Family House in Las Rozas',
    description: 'Spacious family house with garden in Las Rozas. Perfect for families looking for tranquility while staying connected to Madrid. Large living areas, private garden, and garage.',
    price: 650000,
    currency: 'EUR',
    status: 'reserved',
    type: 'house',
    address: {
      street: 'Avenida de Atenas, 15',
      city: 'Las Rozas',
      state: 'Madrid',
      zip: '28232',
      country: 'Spain',
      lat: 40.4926,
      lng: -3.8739
    },
    features: {
      rooms: 4,
      baths: 3,
      area: 180,
      floor: 0,
      hasElevator: false,
      hasBalcony: false,
      heating: 'gas',
      parking: true,
      year: 2015,
      energyLabel: 'C'
    },
    media: [
      {
        id: 'img6',
        url: 'https://images.unsplash.com/photo-1449844908441-8829872d2607?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      },
      {
        id: 'img7',
        url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      },
      {
        id: 'img8',
        url: 'https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      }
    ],
    tags: ['family', 'garden', 'suburban'],
    createdAt: '2024-08-10T11:30:00Z',
    updatedAt: '2024-08-23T09:15:00Z'
  },
  {
    id: '4',
    ref: 'MAD004',
    title: 'Penthouse with Terrace in Chamberí',
    description: 'Spectacular penthouse with large terrace in Chamberí. Panoramic views of Madrid, luxury finishes, and private terrace perfect for entertaining.',
    price: 890000,
    currency: 'EUR',
    status: 'active',
    type: 'flat',
    address: {
      street: 'Calle Génova, 12',
      city: 'Madrid',
      state: 'Madrid',
      zip: '28004',
      country: 'Spain',
      lat: 40.4251,
      lng: -3.6953
    },
    features: {
      rooms: 3,
      baths: 2,
      area: 140,
      floor: 8,
      hasElevator: true,
      hasBalcony: true,
      heating: 'central',
      parking: true,
      year: 2018,
      energyLabel: 'A'
    },
    media: [
      {
        id: 'img9',
        url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      },
      {
        id: 'img10',
        url: 'https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      }
    ],
    tags: ['penthouse', 'terrace', 'luxury', 'views'],
    createdAt: '2024-08-24T08:00:00Z',
    updatedAt: '2024-08-24T08:00:00Z'
  },
  {
    id: '5',
    ref: 'MAD005',
    title: 'Office Space in Financial District',
    description: 'Modern office space in Madrid\'s financial district. Open plan layout with meeting rooms, high-speed internet, and parking. Perfect for startups or established companies.',
    price: 480000,
    currency: 'EUR',
    status: 'active',
    type: 'office',
    address: {
      street: 'Paseo de la Castellana, 200',
      city: 'Madrid',
      state: 'Madrid',
      zip: '28046',
      country: 'Spain',
      lat: 40.4482,
      lng: -3.6835
    },
    features: {
      rooms: 6,
      baths: 2,
      area: 200,
      floor: 12,
      hasElevator: true,
      hasBalcony: false,
      heating: 'central',
      parking: true,
      year: 2022,
      energyLabel: 'A'
    },
    media: [
      {
        id: 'img11',
        url: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      },
      {
        id: 'img12',
        url: 'https://images.unsplash.com/photo-1497366412874-3415097a27e7?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      }
    ],
    tags: ['office', 'modern', 'business'],
    createdAt: '2024-07-30T15:20:00Z',
    updatedAt: '2024-08-18T12:00:00Z'
  },
  {
    id: '6',
    ref: 'MAD006',
    title: 'Cozy Apartment in La Latina',
    description: 'Charming apartment in historic La Latina neighborhood. Traditional architecture with modern comforts. Walking distance to tapas bars and markets.',
    price: 420000,
    currency: 'EUR',
    status: 'sold',
    type: 'flat',
    address: {
      street: 'Calle de Toledo, 89',
      city: 'Madrid',
      state: 'Madrid',
      zip: '28005',
      country: 'Spain',
      lat: 40.4089,
      lng: -3.7065
    },
    features: {
      rooms: 2,
      baths: 1,
      area: 75,
      floor: 3,
      hasElevator: false,
      hasBalcony: true,
      heating: 'gas',
      parking: false,
      year: 1950,
      energyLabel: 'D'
    },
    media: [
      {
        id: 'img13',
        url: 'https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      }
    ],
    tags: ['historic', 'charming', 'central'],
    createdAt: '2024-07-15T14:00:00Z',
    updatedAt: '2024-08-20T10:30:00Z'
  },
  {
    id: '7',
    ref: 'MAD007',
    title: 'New Build in Valdebebas',
    description: 'Brand new apartment in developing Valdebebas area. Modern construction with all amenities, close to airport and business parks. Great investment opportunity.',
    price: 380000,
    currency: 'EUR',
    status: 'active',
    type: 'flat',
    address: {
      street: 'Avenida de Valdebebas, 45',
      city: 'Madrid',
      state: 'Madrid',
      zip: '28055',
      country: 'Spain',
      lat: 40.4789,
      lng: -3.6234
    },
    features: {
      rooms: 2,
      baths: 2,
      area: 85,
      floor: 5,
      hasElevator: true,
      hasBalcony: true,
      heating: 'central',
      parking: true,
      year: 2024,
      energyLabel: 'A'
    },
    media: [
      {
        id: 'img14',
        url: 'https://images.unsplash.com/photo-1554995207-c18c203602cb?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      },
      {
        id: 'img15',
        url: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      }
    ],
    tags: ['new build', 'modern', 'investment'],
    createdAt: '2024-08-22T16:00:00Z',
    updatedAt: '2024-08-23T11:20:00Z'
  },
  {
    id: '8',
    ref: 'MAD008',
    title: 'Historic Townhouse in Barrio de las Letras',
    description: 'Unique historic townhouse in the literary quarter. Original features preserved, high ceilings, and traditional Spanish architecture. A piece of Madrid\'s history.',
    price: 1200000,
    currency: 'EUR',
    status: 'active',
    type: 'house',
    address: {
      street: 'Calle de Cervantes, 23',
      city: 'Madrid',
      state: 'Madrid',
      zip: '28014',
      country: 'Spain',
      lat: 40.4134,
      lng: -3.6926
    },
    features: {
      rooms: 5,
      baths: 3,
      area: 250,
      floor: 0,
      hasElevator: false,
      hasBalcony: false,
      heating: 'gas',
      parking: false,
      year: 1890,
      energyLabel: 'E'
    },
    media: [
      {
        id: 'img16',
        url: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      },
      {
        id: 'img17',
        url: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&h=600&fit=crop',
        kind: 'photo',
        w: 800,
        h: 600
      }
    ],
    tags: ['historic', 'unique', 'literary quarter'],
    createdAt: '2024-08-05T12:45:00Z',
    updatedAt: '2024-08-19T09:30:00Z'
  }
];