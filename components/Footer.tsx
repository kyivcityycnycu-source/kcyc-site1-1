import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Youtube, Mail, MapPin, Phone, Heart, Loader2, Check, Linkedin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { DonationModal } from './DonationModal';
import { Logo } from './Logo';
import { subscribeToNewsletter, isFormSpamError } from '../services/api';
import { HoneypotField } from './ui/HoneypotField';
import { FIELD_MAX, isValidEmail, sanitizeFormValue } from '../lib/validation';
import { ui } from '../lib/uiClasses';
import { trackCtaClick, trackFormSubmit } from '../services/analytics';

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.462l4.552 1.42l10.532-6.645c.498-.303.953-.14.579.192l-8.533 7.701h-.002l.002.001l-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15l4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.434z"/>
  </svg>
);

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [honeypot, setHoneypot] = useState('');
  const openedAt = useRef(Date.now());
  const { t, language } = useLanguage();
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  
  const [emailLinkProps, setEmailLinkProps] = useState({
    href: 'https://mail.google.com/mail/?view=cm&fs=1&to=kyiv.city.yc.nycu@gmail.com',
    target: '_blank'
  });

  useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    
    if (isMobile) {
      setEmailLinkProps({
        href: 'mailto:kyiv.city.yc.nycu@gmail.com',
        target: '_self'
      });
    }
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    if (!isValidEmail(email)) {
      trackFormSubmit('newsletter', 'validation_error');
      alert(t('contacts.invalidEmail'));
      return;
    }
    setStatus('loading');
    
    try {
      await subscribeToNewsletter(email, { honeypot, openedAt: openedAt.current });
      setStatus('success');
      trackFormSubmit('newsletter', 'success');
      setEmail('');
      setHoneypot('');
      openedAt.current = Date.now();
      setTimeout(() => setStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setStatus('idle');
      trackFormSubmit('newsletter', 'error');
      if (isFormSpamError(error) && error.code === 'rate_limit') {
        alert(t('contacts.rateLimit'));
      } else if (isFormSpamError(error) && error.code === 'too_fast') {
        alert(t('contacts.tooFast'));
      } else {
        alert(language === 'uk' ? 'Щось пішло не так. Спробуйте ще раз.' : 'Something went wrong. Please try again.');
      }
    }
  };

  return (
    <footer className="bg-kmmr-blue text-white pt-16 pb-8 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
          
          <div className="space-y-4">
            <div className="mb-4">
              <Logo className="h-16" forceTheme="dark" />
            </div>
            <p className="text-gray-200 text-sm leading-relaxed">
              {t('footer.desc')}
            </p>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold uppercase tracking-wider mb-4">{t('footer.contacts')}</h4>
            <ul className="space-y-3">
              <li className="text-gray-200 hover:text-white transition-colors">
                <a 
                  href="https://maps.app.goo.gl/oLVazPLxvkL6ibrv6" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-start gap-3 w-full"
                >
                  <MapPin className="w-5 h-5 text-kmmr-pink shrink-0" />
                  <span className="text-sm">м. Київ, вул. Хрещатик, 36</span>
                </a>
              </li>
              <li className="text-gray-200 hover:text-white transition-colors">
                <a 
                  href={emailLinkProps.href} 
                  target={emailLinkProps.target}
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 w-full"
                >
                  <Mail className="w-5 h-5 text-kmmr-pink shrink-0" />
                  <span className="text-sm">kyiv.city.yc.nycu@gmail.com</span>
                </a>
              </li>
              <li className="text-gray-200 hover:text-white transition-colors">
                <a href="tel:+380994568764" className="flex items-center gap-3 w-full">
                  <Phone className="w-5 h-5 text-kmmr-pink shrink-0" />
                  <span className="text-sm">+38 (099) 456-87-64</span>
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className="text-lg font-bold uppercase tracking-wider mb-4">{t('footer.news')}</h4>
            <p className="text-gray-200 text-sm">{t('footer.newsDesc')}</p>
            <form onSubmit={handleSubscribe} className="space-y-2 relative">
              <HoneypotField value={honeypot} onChange={setHoneypot} />
              <label htmlFor="footer-newsletter-email" className="sr-only">
                Email
              </label>
              <input
                id="footer-newsletter-email"
                type="email"
                name="email"
                aria-label="Email"
                placeholder={t('footer.inputPlaceholder')}
                value={email}
                onChange={(e) => setEmail(sanitizeFormValue('email', e.target.value))}
                required
                maxLength={FIELD_MAX.email}
                autoComplete="email"
                disabled={status === 'loading' || status === 'success'}
                className={`w-full px-4 py-2.5 ${ui.input} bg-white/10 border border-white/25 text-white placeholder-gray-300 focus:outline-none focus:border-kmmr-green transition-colors disabled:opacity-50`}
              />
              {/* Secondary CTA — outline green (pink donate is primary) */}
              <button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className={`w-full ${ui.btnPill} bg-transparent text-kmmr-green border-2 border-kmmr-green font-bold py-2.5 hover:bg-kmmr-green/15 transition-colors uppercase text-sm tracking-wide flex items-center justify-center gap-2 disabled:cursor-not-allowed`}
              >
                {status === 'loading' ? <Loader2 className="animate-spin w-4 h-4" /> : 
                 status === 'success' ? <Check className="w-4 h-4" /> :
                 t('footer.subscribe')}
              </button>
              <p className="text-xs text-gray-300 text-center leading-relaxed pt-1">
                {t('footer.newsConsent')}{' '}
                <Link to="/privacy" className="text-kmmr-pink font-semibold underline underline-offset-2 hover:opacity-90">
                  {t('contacts.privacyLink')}
                </Link>
              </p>
            </form>
          </div>

          <div className="space-y-6">
            <div>
              <h4 className="text-lg font-bold uppercase tracking-wider mb-4">{t('footer.follow')}</h4>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/kyiv.city.yc.nycu/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-kmmr-pink transition-all duration-300 transform hover:-translate-y-1">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="https://www.facebook.com/kyiv.city.yc.nycu/" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-600 transition-all duration-300 transform hover:-translate-y-1">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="https://t.me/Kyiv_City_Youth_Council" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-500 transition-all duration-300 transform hover:-translate-y-1">
                  <TelegramIcon className="w-5 h-5" />
                </a>
                <a href="https://www.linkedin.com/company/kyiv-city-youth-council?originalSubdomain=ua" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="https://www.youtube.com/@kyiv_city_youth_council" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-red-600 transition-all duration-300 transform hover:-translate-y-1">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div className="pt-6 border-t border-white/10">
              <button 
                type="button"
                onClick={() => {
                  trackCtaClick('donate', 'footer');
                  setIsDonationOpen(true);
                }}
                className={`w-full ${ui.btnPill} bg-kmmr-pink hover:bg-pink-600 text-white font-bold py-3 flex items-center justify-center gap-2 transition-all shadow-lg shadow-kmmr-pink/20 group`}
              >
                <Heart size={18} className="fill-white group-hover:animate-pulse" />
                <span>{t('donation.btn')}</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 text-center flex flex-col items-center gap-2">
          <a href="https://nycukraine.org" target="_blank" rel="noopener noreferrer" className="text-sm text-gray-300 hover:text-white transition-colors pb-1">
            {t('footer.memberOf')}
          </a>
          <Link to="/privacy" className="text-sm text-gray-300 hover:text-white transition-colors">
            {t('footer.privacy')}
          </Link>
          <p className="text-sm text-gray-400">
            © {new Date().getFullYear()} {language === 'en' ? 'KCYC' : 'КММР'}. {t('footer.rights')}
          </p>
        </div>
      </div>

      <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />
    </footer>
  );
};
