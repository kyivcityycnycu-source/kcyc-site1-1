import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

interface LogoProps {
  className?: string;
  forceTheme?: 'light' | 'dark';
}

const LOGOS = {
  uk: {
    // UK Light Theme (usually dark logo)
    light: 'https://firebasestorage.googleapis.com/v0/b/kcyc-site-b9544.firebasestorage.app/o/LOGO%20KCYC%2FLogo%20%D0%9A%D0%9C%D0%9C%D0%A0%20ua%20color%20(2).png?alt=media&token=5dd239fe-0ad2-4193-97e8-aeea677b6c51',
    // UK Dark Theme (usually light logo)
    dark: 'https://firebasestorage.googleapis.com/v0/b/kcyc-site-b9544.firebasestorage.app/o/LOGO%20KCYC%2FLogo%20%D0%9A%D0%9C%D0%9C%D0%A0%20ua%20color%20(3).png?alt=media&token=7a1689b5-aeba-4d37-92f3-f2b11a6a94bd'
  },
  en: {
    // EN Light Theme
    light: 'https://firebasestorage.googleapis.com/v0/b/kcyc-site-b9544.firebasestorage.app/o/LOGO%20KCYC%2FLogo%20ENG%20color%20(2).png?alt=media&token=171de289-8ae9-4d85-8bbf-d8d0e67eff8f',
    // EN Dark Theme
    dark: 'https://firebasestorage.googleapis.com/v0/b/kcyc-site-b9544.firebasestorage.app/o/LOGO%20KCYC%2FLogo%20ENG%20color%20(3).png?alt=media&token=aaf22fa3-6877-4bdb-a7ae-e7bb2013cc15'
  }
};

export const Logo: React.FC<LogoProps> = ({ className = "h-12", forceTheme }) => {
  const { language } = useLanguage();
  const { theme } = useTheme();
  
  // Use forced theme if provided, otherwise use global theme
  const activeTheme = forceTheme || theme;
  
  const getLogoSrc = () => {
    const langKey = language === 'en' ? 'en' : 'uk';
    const themeKey = activeTheme === 'dark' ? 'dark' : 'light';
    return LOGOS[langKey][themeKey];
  };

  return (
    <img 
      src={getLogoSrc()}
      alt={language === 'uk' ? 'Київська Міська Молодіжна Рада' : 'Kyiv City Youth Council'} 
      className={`${className} w-auto object-contain transition-all duration-300`}
    />
  );
};