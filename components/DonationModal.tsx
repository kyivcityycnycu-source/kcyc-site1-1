import React, { useState, useEffect } from 'react';
import { Copy, Check, CreditCard, Heart, ExternalLink, Loader2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { useLanguage } from '../context/LanguageContext';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { DonationRequisite } from '../types';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  const { t, language } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [requisites, setRequisites] = useState<DonationRequisite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    
    const unsub = onSnapshot(collection(db, "donations"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as DonationRequisite));
      data.sort((a,b) => {
        const orderA = a.order !== undefined ? a.order : 999;
        const orderB = b.order !== undefined ? b.order : 999;
        return orderA - orderB;
      });
      setRequisites(data);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching donations:", error);
      setLoading(false);
    });

    return () => unsub();
  }, [isOpen]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8 bg-white dark:bg-gray-800 transition-colors duration-300">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-pink-50 dark:bg-pink-900/30 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <Heart className="w-8 h-8 text-kmmr-pink fill-kmmr-pink" />
          </div>
          <h2 className="text-2xl font-black text-kmmr-blue dark:text-white mb-2 transition-colors">{t('donation.title')}</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-sm mx-auto transition-colors">
            {t('donation.desc')}
          </p>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-kmmr-blue" />
            </div>
          ) : requisites.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Немає доступних реквізитів
            </div>
          ) : (
            requisites.map((item) => (
              <div key={item.id} className="relative group">
                <div className="flex items-center gap-4 p-4 border border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-700/50 hover:bg-white dark:hover:bg-gray-700 hover:shadow-md transition-all duration-300">
                  {/* Icon */}
                  <div 
                    className={`w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold shrink-0 ${!item.color?.startsWith('#') ? item.color : ''}`}
                    style={item.color?.startsWith('#') ? { backgroundColor: item.color } : {}}
                  >
                    {item.icon.startsWith('http') ? (
                       <img src={item.icon} alt="icon" className="w-6 h-6 object-contain" />
                    ) : item.icon}
                  </div>

                  <div className="flex-grow min-w-0">
                    <div className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-0.5">
                      {language === 'en' && item.labelEn ? item.labelEn : item.label}
                    </div>
                    <div className="font-mono text-gray-800 dark:text-white font-semibold truncate text-sm sm:text-base">
                      {item.value.startsWith('http') ? 'send.monobank.ua/...' : item.value}
                    </div>
                  </div>

                  {item.type === 'link' ? (
                    <a 
                      href={item.value} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 text-gray-600 dark:text-gray-200 hover:text-kmmr-blue dark:hover:text-blue-300 hover:border-kmmr-blue dark:hover:border-blue-400 transition-colors"
                      title="Open Link"
                    >
                      <ExternalLink size={20} />
                    </a>
                  ) : (
                    <button
                      onClick={() => handleCopy(item.value, item.id)}
                      className="p-2 bg-white dark:bg-gray-600 rounded-lg border border-gray-200 dark:border-gray-500 text-gray-600 dark:text-gray-200 hover:text-kmmr-green dark:hover:text-kmmr-green hover:border-kmmr-green transition-colors relative"
                      title={t('donation.copy')}
                    >
                      {copiedId === item.id ? <Check size={20} /> : <Copy size={20} />}
                    </button>
                  )}
                </div>
                
                {/* Tooltip for copied status */}
                {copiedId === item.id && (
                  <div className="absolute right-0 -top-8 bg-kmmr-green text-white text-xs py-1 px-2 rounded animate-fade-in-up shadow-lg z-10">
                    {t('donation.copied')}
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 dark:text-gray-500">
               {t('donation.officialDetails')}
            </p>
        </div>
      </div>
    </Modal>
  );
};