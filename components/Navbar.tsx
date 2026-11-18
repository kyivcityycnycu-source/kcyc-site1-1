import React, { useLayoutEffect, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, Globe, Moon, Sun } from 'lucide-react';
import { NAV_LINKS_UK, NAV_LINKS_EN } from '../constants';
import { Logo } from './Logo';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';
import { ui } from '../lib/uiClasses';
import { trackCtaClick } from '../services/analytics';
import { PARTICIPANT_JOIN_FORM_URL } from '../constants';
import { openExternal } from '../lib/openExternal';

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  /** Home only: true after user scrolls past hero. Starts false to avoid reload flash. */
  const [pastHero, setPastHero] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { language, setLanguage, t } = useLanguage();
  const { theme, toggleTheme } = useTheme();

  const currentLinks = language === 'uk' ? NAV_LINKS_UK : NAV_LINKS_EN;
  const isHome = location.pathname === '/';
  // Other pages: always visible. Home: CSS defaults to hidden until pastHero.
  const showNavJoin = !isHome || pastHero;

  // useLayoutEffect: hide before paint on home (no flicker on reload / client nav).
  useLayoutEffect(() => {
    if (!isHome) {
      setPastHero(false);
      return;
    }

    setPastHero(false);
    let cancelled = false;
    let observer: IntersectionObserver | null = null;
    let retryTimer: number | undefined;

    const attach = () => {
      const heroCta = document.getElementById('hero-join-cta');
      if (!heroCta) return false;
      observer = new IntersectionObserver(
        ([entry]) => {
          if (!cancelled) setPastHero(!entry.isIntersecting);
        },
        { root: null, threshold: 0.15, rootMargin: '-80px 0px 0px 0px' }
      );
      observer.observe(heroCta);
      return true;
    };

    if (!attach()) {
      retryTimer = window.setInterval(() => {
        if (attach() && retryTimer) window.clearInterval(retryTimer);
      }, 50);
      window.setTimeout(() => {
        if (retryTimer) window.clearInterval(retryTimer);
      }, 3000);
    }

    return () => {
      cancelled = true;
      if (retryTimer) window.clearInterval(retryTimer);
      observer?.disconnect();
    };
  }, [isHome, location.key]);

  const handleNavClick = () => {
    setIsOpen(false);
  };

  const handleJoinClick = (place: 'navbar' | 'navbar_mobile' = 'navbar') => {
    setIsOpen(false);
    trackCtaClick('join', place);
    openExternal(PARTICIPANT_JOIN_FORM_URL);
  };

  const toggleLanguage = () => {
    setLanguage(language === 'uk' ? 'en' : 'uk');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-24 items-center">
          
          <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/')}>
            <Logo className="h-16 md:h-20" />
          </div>

          {/* Desktop Menu (Visible only on XL screens and up) */}
          <div className="hidden xl:flex items-center space-x-6 xl:space-x-8">
            {currentLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                className={({ isActive }) =>
                  `text-sm font-semibold transition-colors duration-200 uppercase tracking-wider ${
                    isActive ? 'text-kmmr-pink' : 'text-kmmr-blue dark:text-gray-200 hover:text-kmmr-green'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            
            <div className="flex items-center gap-3 ml-2">
              {/* Theme Switcher */}
              <button
                type="button"
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-kmmr-blue dark:text-gray-200 transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kmmr-pink"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {/* Language Switcher */}
              <button 
                type="button"
                onClick={toggleLanguage}
                className="flex items-center gap-1 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700 hover:border-kmmr-blue dark:hover:border-kmmr-pink transition-colors text-xs font-bold uppercase text-kmmr-blue dark:text-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kmmr-pink"
              >
                <Globe size={14} />
                <span className={language === 'uk' ? 'text-kmmr-pink' : ''}>UA</span>
                <span className="text-gray-300 dark:text-gray-600">|</span>
                <span className={language === 'en' ? 'text-kmmr-pink' : ''}>EN</span>
              </button>

              <button
                type="button"
                onClick={() => handleJoinClick('navbar')}
                aria-hidden={!showNavJoin}
                tabIndex={showNavJoin ? 0 : -1}
                data-visible={showNavJoin ? 'true' : 'false'}
                className={`nav-join-cta bg-kmmr-pink text-white px-6 py-2.5 ${ui.btnPill} font-bold uppercase text-xs tracking-wider shadow-lg shadow-kmmr-pink/30 hover:bg-opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
              >
                {t('nav.join')}
              </button>
            </div>
          </div>

          {/* Mobile/Tablet menu button */}
          <div className="xl:hidden flex items-center gap-3">
             <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-kmmr-blue dark:text-gray-200 transition-colors"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

             <button 
              onClick={toggleLanguage}
              className="flex items-center gap-1 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-xs font-bold uppercase text-kmmr-blue dark:text-gray-200"
            >
              <span className={language === 'uk' ? 'text-kmmr-pink' : ''}>UA</span>
              <span className="text-gray-300 dark:text-gray-600">|</span>
              <span className={language === 'en' ? 'text-kmmr-pink' : ''}>EN</span>
            </button>

            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-kmmr-blue dark:text-white hover:text-kmmr-pink focus:outline-none"
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Menu Dropdown */}
      {isOpen && (
        <div className="xl:hidden bg-white dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 absolute w-full shadow-xl">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {currentLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `block px-3 py-3 rounded-md text-base font-bold uppercase text-center transition-colors ${
                    isActive 
                      ? 'text-kmmr-pink bg-pink-50 dark:bg-gray-800' 
                      : 'text-kmmr-blue dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
            {showNavJoin && (
              <div className="pt-4">
                <button
                  type="button"
                  onClick={() => handleJoinClick('navbar_mobile')}
                  className={`w-full bg-kmmr-pink text-white px-6 py-3 ${ui.btnPill} font-bold uppercase hover:bg-opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white`}
                >
                  {t('nav.join')}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};