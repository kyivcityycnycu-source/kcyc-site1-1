import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Handshake, UserPlus, ChevronRight, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';

export const JoinUsSection: React.FC = () => {
  const { t } = useLanguage();
  const [showChronology, setShowChronology] = useState(false);
  const [emailLink, setEmailLink] = useState('https://mail.google.com/mail/?view=cm&fs=1&to=kyiv.city.yc.nycu@gmail.com');

  React.useEffect(() => {
    const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    if (isMobile) {
      setEmailLink('mailto:kyiv.city.yc.nycu@gmail.com');
    }
  }, []);

  const categories = [
    {
      id: 'igs',
      title: t('joinUs.igs.title'),
      subtitle: t('joinUs.igs.subtitle'),
      icon: Building2,
      color: 'bg-[#97C93E]',
      items: [
        { text: t('joinUs.igs.memoSelfGov'), link: 'https://docs.google.com/document/d/1zi_9RikvGg2VJk5JsNUi4LAozJq3gk1e/edit?rtpof=true&sd=true&tab=t.0', linkText: t('joinUs.igs.memoLink') },
        { text: t('joinUs.igs.orgChronology'), action: () => setShowChronology(!showChronology) }
      ]
    },
    {
      id: 'partner',
      title: t('joinUs.partner.title'),
      subtitle: t('joinUs.partner.subtitle'),
      icon: Handshake,
      color: 'bg-[#001D4A]',
      items: [
        { text: t('joinUs.partner.memoRead'), link: 'https://docs.google.com/document/d/1zi_9RikvGg2VJk5JsNUi4LAozJq3gk1e/edit?usp=sharing&ouid=108583037115454714008&rtpof=true&sd=true', linkText: t('joinUs.partner.memoLink') },
        { text: t('joinUs.partner.emailContact'), link: emailLink, linkText: 'пошту' }
      ]
    },
    {
      id: 'volunteer',
      title: t('joinUs.volunteer.title'),
      subtitle: t('joinUs.volunteer.subtitle'),
      icon: UserPlus,
      color: 'bg-[#D81B94]',
      items: [
        { 
          text: t('joinUs.volunteer.fillForm'), 
          action: () => {
            const el = document.getElementById('contacts');
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }
        },
        { text: t('joinUs.volunteer.readProposal'), link: '/opportunities', linkText: t('joinUs.volunteer.proposalLink') }
      ]
    }
  ];

  const chronologySteps = [
    { title: t('joinUs.chronology.step1'), desc: t('joinUs.chronology.step1Desc'), color: 'bg-[#97C93E]' },
    { title: t('joinUs.chronology.step2'), desc: t('joinUs.chronology.step2Desc'), color: 'bg-[#D81B94]', link: 'https://drive.google.com/file/d/1JB4xZ5lr2SSmZ6geFVh2NTWFFzSwhA6-/view' },
    { title: t('joinUs.chronology.step3'), desc: t('joinUs.chronology.step3Desc'), color: 'bg-[#001D4A]', link: 'https://docs.google.com/document/d/1zi_9RikvGg2VJk5JsNUi4LAozJq3gk1e/edit?usp=sharing&ouid=108583037115454714008&rtpof=true&sd=true' },
    { title: t('joinUs.chronology.step4'), desc: t('joinUs.chronology.step4Desc'), color: 'bg-[#4A2C2A]' },
    { title: t('joinUs.chronology.step5'), desc: t('joinUs.chronology.step5Desc'), color: 'bg-[#FF8A00]' }
  ];

  return (
    <section id="join" className="py-24 bg-white dark:bg-gray-950 transition-colors duration-300 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-6xl font-black text-gray-900 dark:text-white mb-4">
            {t('joinUs.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {categories.map((cat) => (
            <div key={cat.id} className="flex flex-col group">
              <div className={`${cat.color} text-white py-5 px-8 rounded-full text-center font-black text-2xl mb-10 shadow-xl transform group-hover:scale-105 transition-all duration-300`}>
                {cat.title}
              </div>
              <div className="px-2">
                <h3 className="font-extrabold text-xl mb-8 text-gray-800 dark:text-gray-100 leading-tight min-h-[3rem]">
                  {cat.subtitle}
                </h3>
                <ul className="space-y-8">
                  {cat.items.map((item, idx) => (
                    <li key={idx} className="text-gray-600 dark:text-gray-400 text-base md:text-lg leading-relaxed flex items-start gap-3">
                      <div className={`mt-2 w-2 h-2 rounded-full shrink-0 ${cat.color}`} />
                      <div className="flex-grow">
                        {item.link ? (
                          <span>
                            {item.text.split(item.linkText || '').map((part, i, arr) => (
                              <React.Fragment key={i}>
                                {part}
                                {i < arr.length - 1 && (
                                  item.link?.startsWith('http') || item.link?.startsWith('mailto') ? (
                                    <a 
                                      href={item.link} 
                                      target={item.link?.startsWith('http') ? "_blank" : "_self"}
                                      rel={item.link?.startsWith('http') ? "noopener noreferrer" : ""}
                                      className="text-kmmr-blue dark:text-blue-400 font-bold underline decoration-2 underline-offset-4 hover:text-kmmr-pink transition-colors inline-flex items-center gap-1"
                                    >
                                      {item.linkText}
                                      {item.link?.startsWith('http') && <ExternalLink size={14} />}
                                    </a>
                                  ) : (
                                    <Link 
                                      to={item.link || '#'} 
                                      className="text-kmmr-blue dark:text-blue-400 font-bold underline decoration-2 underline-offset-4 hover:text-kmmr-pink transition-colors inline-flex items-center gap-1"
                                    >
                                      {item.linkText}
                                    </Link>
                                  )
                                )}
                              </React.Fragment>
                            ))}
                          </span>
                        ) : item.action ? (
                          <button 
                            onClick={item.action}
                            className="text-left hover:text-kmmr-blue dark:hover:text-blue-400 transition-colors group/btn flex items-start gap-2 font-medium"
                          >
                            <span className="underline decoration-2 underline-offset-4">{item.text}</span>
                            <ChevronRight size={18} className={`mt-1 transition-transform ${showChronology && item.text === t('joinUs.igs.orgChronology') ? 'rotate-90' : 'group-hover/btn:translate-x-1'}`} />
                          </button>
                        ) : (
                          item.text
                        )}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        <AnimatePresence>
          {showChronology && (
            <motion.div 
              initial={{ opacity: 0, height: 0, y: 20 }}
              animate={{ opacity: 1, height: 'auto', y: 0 }}
              exit={{ opacity: 0, height: 0, y: 20 }}
              className="mt-24"
            >
              <div className="bg-gray-50 dark:bg-gray-900/50 rounded-[3rem] p-8 md:p-16 border border-gray-100 dark:border-white/5 relative">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-950 px-8 py-2 rounded-full border border-gray-100 dark:border-white/5 text-xs font-black uppercase tracking-widest text-gray-400 z-30">
                  Timeline
                </div>

                <h3 className="text-3xl font-black mb-16 text-center dark:text-white uppercase tracking-tighter">
                  {t('joinUs.chronology.title')}
                </h3>
                
                <div className="relative pt-4">
                  {/* Timeline Bar - Positioned relative to the middle gap */}
                  <div className="hidden md:block absolute top-[110px] left-0 w-full h-12 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                    <div className="flex h-full">
                      {chronologySteps.map((step, i) => (
                        <div key={i} className={`${step.color} flex-1 h-full border-r-2 border-white/10 last:border-0`} />
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-5 relative z-10">
                    {chronologySteps.map((step, i) => (
                      <div key={i} className="flex flex-col items-center text-center group/step px-4">
                        {/* Step Title Box */}
                        <div className="h-[80px] flex items-center justify-center mb-12">
                          <div className={`${step.color} text-white px-6 py-3 rounded-2xl font-black text-lg shadow-lg transform group-hover/step:scale-105 transition-transform w-full md:w-auto`}>
                            {step.title}
                          </div>
                        </div>

                        {/* Mobile Spacer */}
                        <div className="md:hidden w-1.5 h-12 bg-gray-200 dark:bg-gray-800 mb-6 rounded-full" />
                        
                        {/* Step Description */}
                        <div className="relative px-2 md:mt-12">
                           {/* Desktop Circle Indicator */}
                           <div className={`hidden md:block w-6 h-6 rounded-full ${step.color} border-4 border-white dark:border-gray-900 absolute -top-[42px] left-1/2 -translate-x-1/2 shadow-md z-20`} />
                           
                           <p className="text-sm md:text-base text-gray-600 dark:text-gray-400 leading-relaxed font-medium">
                             {step.link ? (
                               <span>
                                 {step.desc.split(t('joinUs.chronology.linkText')).map((part, j, arr) => (
                                   <React.Fragment key={j}>
                                     {part}
                                     {j < arr.length - 1 && (
                                       <a 
                                        href={step.link} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-kmmr-blue dark:text-blue-400 font-bold underline decoration-2 underline-offset-2 hover:text-kmmr-pink transition-colors inline-flex items-center gap-0.5"
                                       >
                                         {t('joinUs.chronology.linkText')}
                                         <ExternalLink size={12} />
                                       </a>
                                     )}
                                   </React.Fragment>
                                 ))}
                               </span>
                             ) : step.desc}
                           </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};
