import React from 'react';
import { PRINCIPLES_UK, PRINCIPLES_EN } from '../constants';
import { useLanguage } from '../context/LanguageContext';

export const PrinciplesSection: React.FC = () => {
  const { language, t } = useLanguage();
  const principles = language === 'uk' ? PRINCIPLES_UK : PRINCIPLES_EN;

  return (
    <div className="py-20 bg-white dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-kmmr-pink font-bold uppercase tracking-widest text-sm mb-2 block">{t('focus.tag')}</span>
          <h2 className="text-4xl font-black text-kmmr-blue dark:text-white">{t('focus.title')}</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('focus.desc')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {principles.map((principle) => (
            <div key={principle.id} className="group p-6 rounded-3xl bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 border border-transparent hover:border-gray-100 dark:hover:border-gray-600 hover:shadow-xl transition-all duration-300 flex flex-col h-full">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-6 ${principle.color} shadow-lg group-hover:scale-110 transition-transform flex-shrink-0`}>
                <principle.icon size={24} />
              </div>
              <h3 className="text-lg font-bold text-kmmr-blue dark:text-white mb-3">{principle.title}</h3>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm mb-4 flex-grow">
                {principle.description}
              </p>
              {principle.theses && principle.theses.length > 0 && (
                <ul className="space-y-2 border-t border-gray-100 dark:border-gray-700 pt-4">
                  {principle.theses.map((thesis, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className={`w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0 ${principle.color.replace('bg-', 'bg-opacity-50 bg-')}`} />
                      <span>{thesis}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};