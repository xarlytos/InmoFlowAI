export const CONTACT_CONFIG = {
  // Main agency phone number
  phone: {
    number: '+34666777888',
    display: '+34 666 77 78 88'
  },
  
  // WhatsApp configuration
  whatsapp: {
    number: '34666777888', // Without + for WhatsApp API
    defaultMessage: 'Hello! I\'m interested in one of your properties. Could you please provide more information?'
  },
  
  // Email configuration
  email: {
    general: 'info@realestate.com',
    sales: 'sales@realestate.com',
    support: 'support@realestate.com'
  },
  
  // Office hours
  officeHours: {
    weekdays: '9:00 AM - 7:00 PM',
    saturday: '10:00 AM - 5:00 PM',
    sunday: 'Closed'
  },
  
  // Social media
  social: {
    facebook: 'https://facebook.com/realestate',
    instagram: 'https://instagram.com/realestate',
    twitter: 'https://twitter.com/realestate',
    linkedin: 'https://linkedin.com/company/realestate'
  },
  
  // Address
  address: {
    street: 'Calle Gran Vía, 123',
    city: 'Madrid',
    postalCode: '28001',
    country: 'Spain'
  }
};

// Helper functions
export const formatPhoneForCall = (phone: string) => {
  return phone.startsWith('+') ? phone : `+${phone}`;
};

export const formatPhoneForWhatsApp = (phone: string) => {
  return phone.replace(/[^0-9]/g, '');
};

export const createWhatsAppUrl = (propertyTitle?: string, propertyRef?: string) => {
  const baseMessage = CONTACT_CONFIG.whatsapp.defaultMessage;
  const propertyInfo = propertyTitle ? ` I'm specifically interested in: ${propertyTitle}${propertyRef ? ` (Ref: ${propertyRef})` : ''}` : '';
  const message = encodeURIComponent(baseMessage + propertyInfo);
  
  return `https://wa.me/${CONTACT_CONFIG.whatsapp.number}?text=${message}`;
};

export const createEmailUrl = (subject?: string, body?: string) => {
  const emailSubject = encodeURIComponent(subject || 'Property Inquiry');
  const emailBody = encodeURIComponent(body || 'Hello,\n\nI\'m interested in learning more about your properties.\n\nBest regards');
  
  return `mailto:${CONTACT_CONFIG.email.sales}?subject=${emailSubject}&body=${emailBody}`;
};