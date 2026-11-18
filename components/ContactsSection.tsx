import React from 'react';
import { ExternalLink, Users } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { PARTICIPANT_JOIN_FORM_URL } from '../constants';
import { trackCtaClick } from '../services/analytics';
import { openExternal } from '../lib/openExternal';
import { ui } from '../lib/uiClasses';

export const ContactsSection: React.FC = () => {
  const { t } = useLanguage();

  const openJoinForm = () => {
    trackCtaClick('join', 'contacts');
    openExternal(PARTICIPANT_JOIN_FORM_URL);
  };

  return (
    <div
      id="contacts"
      className="py-24 bg-gray-50 dark:bg-[#0F172A] text-gray-900 dark:text-white relative overflow-hidden flex items-center justify-center transition-colors duration-300"
    >
      <div className="absolute top-0 left-0 w-96 h-96 bg-kmmr-pink/30 rounded-full blur-[100px] translate-y-[-20%] translate-x-[-20%]" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-kmmr-green/20 rounded-full blur-[100px] translate-y-[20%] translate-x-[20%]" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg shadow-kmmr-pink/10 transition-colors">
              <Users size={40} className="text-kmmr-pink" />
            </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-6">{t('contacts.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">
            {t('contacts.subtitle')}
          </p>
        </div>

        <div className="bg-white/80 dark:bg-[#1E293B]/80 backdrop-blur-xl rounded-3xl border border-gray-200 dark:border-white/5 shadow-2xl overflow-hidden p-1 transition-colors">
          <div className="p-8 md:p-14 flex flex-col items-center text-center gap-6">
            <p className="text-gray-600 dark:text-gray-300 max-w-xl text-sm md:text-base leading-relaxed">
              {t('contacts.googleFormHint')}
            </p>
            <button
              type="button"
              onClick={openJoinForm}
              className={`group inline-flex items-center justify-center gap-2 bg-kmmr-pink text-white px-8 py-4 ${ui.btnPill} font-bold uppercase tracking-wider hover:bg-pink-600 transition-all shadow-lg shadow-kmmr-pink/30 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kmmr-pink`}
            >
              {t('contacts.openGoogleForm')}
              <ExternalLink className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
