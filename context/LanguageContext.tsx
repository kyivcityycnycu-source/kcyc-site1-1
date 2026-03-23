import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../utils/translations';

type Language = 'uk' | 'en';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved === 'uk' || saved === 'en') ? saved : 'uk';
  });

  useEffect(() => {
    const detectLanguage = async () => {
      const saved = localStorage.getItem('language');
      if (saved) return; // Don't override user preference

      try {
        const response = await fetch('https://ipapi.co/json/');
        const data = await response.json();
        if (data.country_code === 'UA') {
          setLanguage('uk');
        } else {
          setLanguage('en');
        }
      } catch (error) {
        console.warn('Geo-detection failed, defaulting to Ukrainian:', error);
      }
    };

    detectLanguage();
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Simple translation helper
  // Usage: t('hero.titleStart')
  const t = (path: string) => {
    const keys = path.split('.');
    let current: any = translations[language];
    
    for (const key of keys) {
      if (current[key] === undefined) return path;
      current = current[key];
    }
    
    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};