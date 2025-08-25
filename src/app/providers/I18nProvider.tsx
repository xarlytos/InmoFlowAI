import { useEffect } from 'react';
import { initReactI18next } from 'react-i18next';
import i18n from 'i18next';

import esCommon from '@/locales/es/common.json';
import enCommon from '@/locales/en/common.json';

const resources = {
  es: { common: esCommon },
  en: { common: enCommon }
};

i18n.use(initReactI18next).init({
  resources,
  lng: localStorage.getItem('inmoflow-language') || 'es',
  defaultNS: 'common',
  fallbackLng: 'es',
  interpolation: {
    escapeValue: false
  }
});

interface I18nProviderProps {
  children: React.ReactNode;
}

export function I18nProvider({ children }: I18nProviderProps) {
  useEffect(() => {
    const handleLanguageChange = (lng: string) => {
      localStorage.setItem('inmoflow-language', lng);
    };

    i18n.on('languageChanged', handleLanguageChange);
    return () => i18n.off('languageChanged', handleLanguageChange);
  }, []);

  return <>{children}</>;
}

export { i18n };