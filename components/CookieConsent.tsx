import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { getCookieConsent, setCookieConsent } from '../lib/cookieConsent';
import { initGA, disableGA, trackPageView } from '../services/analytics';

export const CookieConsent: React.FC = () => {
  const { language } = useLanguage();
  const location = useLocation();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookieConsent() === null);
  }, []);

  const accept = () => {
    setCookieConsent('accepted');
    setVisible(false);
    initGA();
    trackPageView(location.pathname);
  };

  const reject = () => {
    disableGA();
    setCookieConsent('rejected');
    setVisible(false);
  };

  if (!visible) return null;

  const copy =
    language === 'uk'
      ? {
          title: 'Cookie та аналітика',
          text: 'Необхідні cookie для сайту. Analytics — лише за згодою.',
          accept: 'Прийняти',
          reject: 'Лише необхідні',
          privacy: 'Політика',
        }
      : {
          title: 'Cookies & analytics',
          text: 'Necessary cookies for the site. Analytics only with consent.',
          accept: 'Accept',
          reject: 'Necessary only',
          privacy: 'Policy',
        };

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label={copy.title}
      className="fixed bottom-0 inset-x-0 z-[10000] p-3 sm:p-4 pointer-events-none"
    >
      <div className="pointer-events-auto max-w-xl sm:max-w-2xl mx-auto rounded-xl sm:rounded-2xl border border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-xl px-3 py-3 sm:px-5 sm:py-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-kmmr-blue dark:text-white leading-tight">
              {copy.title}
            </p>
            <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 leading-snug">
              {copy.text}{' '}
              <Link
                to="/privacy"
                className="text-kmmr-pink font-semibold underline underline-offset-2"
              >
                {copy.privacy}
              </Link>
            </p>
          </div>
          <div className="flex gap-2 shrink-0">
            <button
              type="button"
              onClick={reject}
              className="flex-1 sm:flex-none border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100 font-bold text-xs sm:text-sm py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kmmr-pink"
            >
              {copy.reject}
            </button>
            <button
              type="button"
              onClick={accept}
              className="flex-1 sm:flex-none bg-kmmr-pink text-white font-bold text-xs sm:text-sm py-2 px-3 rounded-lg hover:bg-opacity-90 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kmmr-pink"
            >
              {copy.accept}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
