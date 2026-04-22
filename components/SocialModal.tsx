
import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, 
  Instagram, 
  Facebook, 
  Linkedin, 
  Send, 
  Youtube, 
  Users 
} from 'lucide-react';

interface SocialModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: 'uk' | 'en';
}

export const SocialModal: React.FC<SocialModalProps> = ({ isOpen, onClose, language }) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md overflow-y-auto overscroll-behavior-y-contain">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl relative my-8"
          >
            <button 
              onClick={onClose}
              className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-300 hover:text-kmmr-pink transition-colors z-10"
            >
              <X size={24} />
            </button>

            <div className="p-10">
              <div className="text-center mb-8">
                <div className="w-20 h-20 bg-kmmr-green/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                  <Users className="text-kmmr-green w-10 h-10" />
                </div>
                <h3 className="text-3xl font-black text-kmmr-blue dark:text-white uppercase tracking-tight">
                  {language === 'uk' ? 'Відкрита комунікація' : 'Open Communication'}
                </h3>
                <p className="text-gray-500 dark:text-gray-300 mt-2 font-medium">
                  {language === 'uk' ? 'Наші соцмережі та канали зв\'язку' : 'Our social media and communication channels'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Instagram, name: 'Instagram', url: 'https://www.instagram.com/kyiv.city.yc.nycu/', brandColor: '#E1306C' },
                  { icon: Facebook, name: 'Facebook', url: 'https://www.facebook.com/kyiv.city.yc.nycu/', brandColor: '#1877F2' },
                  { icon: Send, name: 'Telegram', url: 'https://t.me/Kyiv_City_Youth_Council', brandColor: '#26A5E4' },
                  { icon: Linkedin, name: 'LinkedIn', url: 'https://www.linkedin.com/company/kyiv-city-youth-council?originalSubdomain=ua', brandColor: '#0077B5' },
                  { icon: Youtube, name: 'YouTube', url: 'https://www.youtube.com/@kyiv_city_youth_council', brandColor: '#FF0000' }
                ].map((social, i) => (
                  <motion.a 
                    key={i}
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    whileHover={{ 
                      backgroundColor: social.brandColor,
                      y: -4,
                      transition: { duration: 0.2 }
                    }}
                    className={`flex flex-col items-center justify-center p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 transition-colors group text-kmmr-blue dark:text-white hover:text-white hover:border-transparent ${i === 0 ? 'col-span-2' : ''}`}
                  >
                    <social.icon size={32} className="mb-3 transition-transform group-hover:scale-110" />
                    <span className="font-bold text-sm uppercase tracking-wider">{social.name}</span>
                  </motion.a>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800/80 p-6 text-center border-t border-gray-100 dark:border-gray-700">
              <p className="text-sm text-gray-500 dark:text-gray-300 font-medium">
                {language === 'uk' ? 'Долучайся до нашої спільноти!' : 'Join our community!'}
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
};
