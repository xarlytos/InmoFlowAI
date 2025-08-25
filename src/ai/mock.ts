import type { Lead, Property, MatchResult, ValuationInput, ValuationResult } from '@/features/core/types';
import type { AiDriver } from './llm';

export class MockAiDriver implements AiDriver {
  async matchLeadToProperties(lead: Lead, properties: Property[]): Promise<MatchResult[]> {
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const results: MatchResult[] = properties
      .filter(p => p.status === 'active')
      .map(property => {
        let score = 50; // Base score
        const reasons: string[] = [];

        // Budget matching
        if (lead.budget && property.price <= lead.budget) {
          score += 20;
          reasons.push('Price within budget');
        } else if (lead.budget && property.price > lead.budget * 1.2) {
          score -= 15;
          reasons.push('Price above budget');
        }

        // Location matching
        if (lead.preferences?.city && 
            property.address.city.toLowerCase().includes(lead.preferences.city.toLowerCase())) {
          score += 15;
          reasons.push('Preferred location match');
        }

        // Type matching
        if (lead.preferences?.type?.includes(property.type)) {
          score += 10;
          reasons.push('Property type matches preferences');
        }

        // Room requirements
        if (lead.preferences?.minRooms && property.features.rooms >= lead.preferences.minRooms) {
          score += 10;
          reasons.push('Sufficient bedrooms');
        }

        // Area requirements
        if (lead.preferences?.minArea && property.features.area >= lead.preferences.minArea) {
          score += 10;
          reasons.push('Adequate size');
        }

        // Must-have features
        if (lead.preferences?.mustHave) {
          for (const feature of lead.preferences.mustHave) {
            switch (feature) {
              case 'elevator':
                if (property.features.hasElevator) {
                  score += 5;
                  reasons.push('Has elevator');
                }
                break;
              case 'balcony':
                if (property.features.hasBalcony) {
                  score += 5;
                  reasons.push('Has balcony');
                }
                break;
              case 'parking':
                if (property.features.parking) {
                  score += 5;
                  reasons.push('Has parking');
                }
                break;
            }
          }
        }

        // Ensure score is within bounds
        score = Math.max(0, Math.min(100, score));

        return {
          leadId: lead.id,
          propertyId: property.id,
          score,
          reasons: reasons.length > 0 ? reasons : ['Basic compatibility']
        };
      })
      .sort((a, b) => b.score - a.score);

    return results;
  }

  async estimatePrice(input: ValuationInput): Promise<ValuationResult> {
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Base price calculation
    const basePricePerSqm = this.getBasePriceForCity(input.address.city);
    let suggestedPrice = basePricePerSqm * input.features.area;

    // Adjustments
    const adjustments: string[] = [];

    if (input.features.hasElevator) {
      suggestedPrice *= 1.05;
      adjustments.push('Elevator adds 5%');
    }

    if (input.features.hasBalcony) {
      suggestedPrice *= 1.03;
      adjustments.push('Balcony adds 3%');
    }

    if (input.features.parking) {
      suggestedPrice *= 1.08;
      adjustments.push('Parking adds 8%');
    }

    if (input.features.energyLabel && ['A', 'B'].includes(input.features.energyLabel)) {
      suggestedPrice *= 1.04;
      adjustments.push('High energy efficiency adds 4%');
    }

    if (input.features.year && input.features.year > 2010) {
      suggestedPrice *= 1.02;
      adjustments.push('Modern construction adds 2%');
    }

    // Generate comparable properties
    const comps = this.generateComparables(input, suggestedPrice);

    return {
      suggestedPrice: Math.round(suggestedPrice),
      range: [Math.round(suggestedPrice * 0.9), Math.round(suggestedPrice * 1.1)],
      comps,
      rationale: [
        `Base price: €${basePricePerSqm}/m² in ${input.address.city}`,
        `Area adjustment: ${input.features.area}m²`,
        ...adjustments,
        'Comparison with similar properties in the area'
      ]
    };
  }

  async writeAd(property: Property, style: 'friendly' | 'luxury' | 'investor'): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 600));

    const templates = {
      friendly: `🏠 ¡Descubre tu nuevo hogar en ${property.address.city}!

${property.title} - €${property.price.toLocaleString()}

✨ ${property.features.rooms} habitaciones, ${property.features.baths} baños
📐 ${property.features.area}m² de puro confort
${property.features.hasBalcony ? '🌿 Con balcón para disfrutar' : ''}
${property.features.parking ? '🚗 Plaza de parking incluida' : ''}

${property.description || 'Una oportunidad única en una ubicación privilegiada.'}

¡Ven a visitarlo! Te va a enamorar desde el primer momento.`,

      luxury: `EXCLUSIVA PROPIEDAD EN ${property.address.city.toUpperCase()}

${property.title}
Precio: €${property.price.toLocaleString()}

Características excepcionales:
• ${property.features.rooms} dormitorios de diseño
• ${property.features.baths} baños de alta gama  
• ${property.features.area}m² de elegancia
${property.features.hasElevator ? '• Acceso con ascensor privado' : ''}
${property.features.parking ? '• Plaza de parking exclusiva' : ''}

${property.description || 'Una residencia que define el estándar de lujo moderno.'}

Para inversores y compradores exigentes que buscan lo excepcional.`,

      investor: `OPORTUNIDAD DE INVERSIÓN - ${property.address.city}

REF: ${property.ref}
Precio: €${property.price.toLocaleString()}
Rentabilidad estimada: 5.2% anual

Datos técnicos:
- ${property.features.rooms}H/${property.features.baths}B
- ${property.features.area}m² útiles
- Año construcción: ${property.features.year || 'N/A'}
- Calificación energética: ${property.features.energyLabel || 'N/A'}

ROI proyectado:
• Alquiler mensual estimado: €${Math.round(property.price * 0.004)}
• Gastos anuales: ~€${Math.round(property.price * 0.01)}
• Revalorización anual esperada: 3-4%

Activo sólido en ubicación estratégica.`
    };

    return templates[style];
  }

  async writeEmail(context: {
    to: string;
    subject: string;
    goal: string;
    bullets: string[];
  }): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 500));

    return `Asunto: ${context.subject}

Estimado/a ${context.to},

Espero que este mensaje le encuentre bien.

${context.goal}

He preparado la siguiente información que puede ser de su interés:

${context.bullets.map(bullet => `• ${bullet}`).join('\n')}

Quedo a su disposición para cualquier consulta adicional o para concertar una visita en el momento que mejor le convenga.

Un cordial saludo,

Equipo InmoFlow AI
📞 +34 900 123 456
📧 info@inmoflow.com`;
  }

  async writeReelScript(property: Property, seconds: number): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 400));

    const hooks = [
      '¿Buscas casa? Este lugar te va a sorprender...',
      'La casa de tus sueños existe, y está aquí',
      'Tour de 30 segundos por tu futuro hogar',
      'Esto no es solo una casa, es tu próximo capítulo'
    ];

    const randomHook = hooks[Math.floor(Math.random() * hooks.length)];

    if (seconds <= 15) {
      return `[0-2s] ${randomHook}

[3-5s] Plano general de la fachada

[6-8s] Salón principal - "${property.features.area}m² de pura comodidad"

[9-11s] Cocina/dormitorio principal

[12-15s] "€${property.price.toLocaleString()} en ${property.address.city} - ¡Visitala ya!"`;
    } else {
      return `[0-3s] ${randomHook}

[4-7s] Fachada exterior con transición suave

[8-12s] Tour por salón - "${property.features.rooms} dormitorios, ${property.features.baths} baños"

[13-17s] Cocina moderna / detalles únicos

[18-22s] Dormitorio principal / balcón (si tiene)

[23-26s] Vista general final

[27-30s] "€${property.price.toLocaleString()} - ${property.address.city}"
[27-30s] "Más info en bio 👆"`;
    }
  }

  private getBasePriceForCity(city: string): number {
    const cityPrices: Record<string, number> = {
      'Madrid': 4500,
      'Barcelona': 4200,
      'Valencia': 2800,
      'Sevilla': 2200,
      'Bilbao': 3500,
      'Málaga': 3200,
      'Zaragoza': 2000,
    };

    return cityPrices[city] || 2500; // Default price per sqm
  }

  private generateComparables(input: ValuationInput, suggestedPrice: number) {
    return [
      {
        ref: 'REF-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        distanceKm: 0.3,
        price: Math.round(suggestedPrice * (0.95 + Math.random() * 0.1)),
        area: input.features.area + Math.round((Math.random() - 0.5) * 20),
        rooms: input.features.rooms,
      },
      {
        ref: 'REF-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        distanceKm: 0.7,
        price: Math.round(suggestedPrice * (0.92 + Math.random() * 0.16)),
        area: input.features.area + Math.round((Math.random() - 0.5) * 30),
        rooms: input.features.rooms + (Math.random() > 0.5 ? 1 : 0),
      },
      {
        ref: 'REF-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        distanceKm: 1.2,
        price: Math.round(suggestedPrice * (0.88 + Math.random() * 0.24)),
        area: input.features.area + Math.round((Math.random() - 0.5) * 40),
        rooms: Math.max(1, input.features.rooms + Math.round((Math.random() - 0.5) * 2)),
      }
    ];
  }
}