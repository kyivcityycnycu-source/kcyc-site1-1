import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { SEO } from '../components/SEO';

export const NotFound: React.FC = () => {
  const { language } = useLanguage();
  const uk = language === 'uk';

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-24 bg-white dark:bg-gray-950 transition-colors">
      <SEO
        title={uk ? 'Сторінку не знайдено | КММР' : 'Page not found | KCYC'}
        description={uk ? 'Цієї сторінки не існує.' : 'This page does not exist.'}
        url="https://kmmr.org/404"
      />
      <div className="text-center max-w-lg">
        <p className="text-7xl md:text-8xl font-black text-kmmr-pink mb-4">404</p>
        <h1 className="text-2xl md:text-3xl font-black text-kmmr-blue dark:text-white mb-3">
          {uk ? 'Сторінку не знайдено' : 'Page not found'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
          {uk
            ? 'Можливо, посилання застаріле або адресу введено з помилкою.'
            : 'The link may be outdated or the address was typed incorrectly.'}
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="bg-kmmr-pink text-white font-bold px-8 py-3 rounded-full hover:bg-opacity-90 transition-colors"
          >
            {uk ? 'На головну' : 'Home'}
          </Link>
          <Link
            to="/contacts"
            className="border-2 border-kmmr-green text-kmmr-green font-bold px-8 py-3 rounded-full hover:bg-kmmr-green/10 transition-colors"
          >
            {uk ? 'Приєднатися' : 'Join us'}
          </Link>
        </div>
      </div>
    </div>
  );
};
