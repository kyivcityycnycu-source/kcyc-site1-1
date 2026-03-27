import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SDGS_UK, SDGS_EN, PARTNER_GROUPS_UK, PARTNER_GROUPS_EN, TIMELINE_EVENTS_UK, TIMELINE_EVENTS_EN, CAPACITY_UK, CAPACITY_EN } from '../constants';
import { Target, Flag, Users, HeartHandshake, X, Facebook, Instagram, Linkedin, Send, Youtube } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { motion, AnimatePresence } from 'motion/react';
import { onSnapshot, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { PartnerItem, PartnerType } from '../types';
import { InternshipModal } from './InternshipModal';

export const AboutSection: React.FC = () => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const [fetchedPartners, setFetchedPartners] = useState<PartnerItem[]>([]);
  const [fetchedPartnerTypes, setFetchedPartnerTypes] = useState<PartnerType[]>([]);
  const [isSocialModalOpen, setIsSocialModalOpen] = useState(false);
  const [isInternshipModalOpen, setIsInternshipModalOpen] = useState(false);
  
  const sdgs = language === 'uk' ? SDGS_UK : SDGS_EN;
  const capacity = language === 'uk' ? CAPACITY_UK : CAPACITY_EN;
  const staticPartnerGroups = language === 'uk' ? PARTNER_GROUPS_UK : PARTNER_GROUPS_EN;
  const timeline = language === 'uk' ? TIMELINE_EVENTS_UK : TIMELINE_EVENTS_EN;

  useEffect(() => {
    // Realtime listener for Partners
    const unsubPartners = onSnapshot(collection(db, "partners"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PartnerItem));
      // Sort by order
      data.sort((a,b) => {
         const orderA = a.order !== undefined ? a.order : 999;
         const orderB = b.order !== undefined ? b.order : 999;
         return orderA - orderB;
      });
      setFetchedPartners(data);
    }, (error) => {
      console.error("Error watching partners:", error);
    });

    // Realtime listener for Partner Types
    const unsubTypes = onSnapshot(collection(db, "partner_types"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as PartnerType));
      data.sort((a,b) => {
         const orderA = a.order !== undefined ? a.order : 999;
         const orderB = b.order !== undefined ? b.order : 999;
         return orderA - orderB;
      });
      setFetchedPartnerTypes(data);
    }, (error) => {
      console.error("Error watching partner types:", error);
    });

    return () => {
      unsubPartners();
      unsubTypes();
    };
  }, []);

  const getPartnerName = (p: PartnerItem) => language === 'uk' ? p.name : (p.nameEn || p.name);
  const getTypeName = (pt: PartnerType) => language === 'uk' ? pt.name : (pt.nameEn || pt.name);
  const getTypeDesc = (pt: PartnerType) => language === 'uk' ? pt.description : (pt.descriptionEn || pt.description);

  // Helper to determine if we should show static data or dynamic data
  // We show dynamic data if ANY types are defined in the database.
  const showDynamic = fetchedPartnerTypes.length > 0;

  return (
    <div className="space-y-20 py-16 overflow-x-hidden dark:bg-gray-950 transition-colors duration-300">
      
      {/* Intro Stats Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Users, title: t('about.stats.community'), text: t('about.stats.communityDesc'), color: 'bg-kmmr-blue' },
            { icon: Target, title: t('about.stats.impact'), text: t('about.stats.impactDesc'), color: 'bg-kmmr-green' },
            { icon: Flag, title: t('about.stats.action'), text: t('about.stats.actionDesc'), color: 'bg-kmmr-pink' }
          ].map((item, idx) => (
            <div key={idx} className={`${item.color} rounded-2xl p-8 text-white transform hover:-translate-y-2 transition-transform duration-300 shadow-xl`}>
              <item.icon className="w-12 h-12 mb-6 opacity-80" />
              <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
              <p className="font-medium opacity-90">{item.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main Intro: Who We Are */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <span className="text-kmmr-pink font-bold uppercase tracking-widest text-sm mb-2 block">{t('about.who.tag')}</span>
            <h2 className="text-4xl font-black text-kmmr-blue dark:text-white mb-6">{t('about.who.title')}</h2>
            <div className="space-y-6 text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
              <p className="font-medium text-xl text-kmmr-blue/80 dark:text-blue-300">
                {t('about.who.p1')}
              </p>
              <p>
                {t('about.who.p2')}
              </p>
              <p>
                {t('about.who.p3')}
              </p>
            </div>
          </div>
          <div className="relative">
            <div className="absolute -inset-4 bg-kmmr-green/20 rounded-3xl transform rotate-3"></div>
            <img 
              src="https://firebasestorage.googleapis.com/v0/b/kcyc-site.firebasestorage.app/o/LOGO%20KCYC%2F1228.jpg?alt=media&token=8c94628b-77a2-4702-93c1-8f3933f92640" 
              alt="КММР Team" 
              className="relative rounded-3xl shadow-2xl object-cover w-full h-full"
            />
          </div>
        </div>
      </div>

      {/* Detailed History Timeline */}
      <div className="bg-white dark:bg-gray-900 py-10 transition-colors duration-300">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-kmmr-blue dark:text-white">{t('about.timeline.title')}</h2>
            <div className="w-24 h-1 bg-kmmr-pink mx-auto mt-4 rounded-full"></div>
          </div>

          {/* Timeline Container */}
          <div className="relative ml-4 md:ml-0 md:pl-0">
            {/* Vertical Line */}
            <div className="absolute left-[3px] md:left-[20%] top-0 bottom-0 w-1 bg-gray-100 dark:bg-gray-700"></div>

            <div className="space-y-12 relative">
              {timeline.map((event, idx) => (
                <div key={idx} className="relative md:grid md:grid-cols-5 gap-8 items-start">
                  
                  {/* Year/Label Column */}
                  <div className="md:col-span-1 hidden md:block relative">
                    <span className="absolute right-6 top-[18px] text-2xl font-black text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right whitespace-nowrap">
                      {event.year}
                    </span>
                  </div>

                  {/* Dot on Line */}
                  <div className={`absolute left-[-6px] md:left-[calc(20%-9px)] top-6 w-5 h-5 ${event.bg} rounded-full border-4 border-white dark:border-gray-800 shadow z-10`}></div>

                  {/* Content Card Column - Increased left padding for separation */}
                  <div className="md:col-span-4 pl-12 md:pl-12">
                     <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative">
                        {/* Mobile Year Badge */}
                        <span className="md:hidden absolute top-4 right-4 text-sm font-black text-gray-300 dark:text-gray-600 uppercase">
                          {event.year}
                        </span>

                        <div className="flex items-center gap-3 mb-3">
                          <event.icon className={event.color} size={24} />
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white pr-10 md:pr-0">{event.title}</h3>
                        </div>
                        <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{event.desc}</p>
                     </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SDGs Section */}
      <div className="bg-gray-50 dark:bg-gray-950 py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="text-kmmr-green font-bold uppercase tracking-widest text-sm mb-2 block">{t('about.sdg.tag')}</span>
          <h2 className="text-3xl font-black text-kmmr-blue dark:text-white mb-12">{t('about.sdg.title')}</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {sdgs.map((sdg) => (
              <div key={sdg.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md hover:shadow-xl transition-all group">
                <div 
                  className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center text-white transition-transform group-hover:scale-110"
                  style={{ backgroundColor: sdg.color }}
                >
                  <sdg.icon size={28} />
                </div>
                <div className="text-3xl font-black text-gray-200 dark:text-gray-600 absolute top-4 right-4 group-hover:text-gray-300 dark:group-hover:text-gray-500 transition-colors">{sdg.id}</div>
                <h4 className="font-bold text-gray-800 dark:text-gray-200">{sdg.title}</h4>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Capacity Section */}
      <div className="bg-white dark:bg-gray-900 py-20 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-kmmr-pink font-bold uppercase tracking-widest text-sm mb-2 block">{t('about.capacity.tag')}</span>
            <h2 className="text-3xl font-black text-kmmr-blue dark:text-white mb-4 uppercase tracking-tight">{t('about.capacity.title')}</h2>
            <div className="w-24 h-1 bg-kmmr-pink mx-auto rounded-full"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {capacity.map((item, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ 
                  duration: 0.5, 
                  delay: idx * 0.1,
                  type: "spring",
                  stiffness: 100
                }}
                whileHover={{ y: -8 }}
                onClick={() => {
                  if (idx === 0) {
                    setIsSocialModalOpen(true);
                  } else if (idx === 1) {
                    setIsInternshipModalOpen(true);
                  } else if ([2, 3, 5].includes(idx)) {
                    navigate('/support');
                  } else if (idx === 4) {
                    navigate('/?scroll=join');
                  }
                }}
                className={`group relative p-8 rounded-[2.5rem] text-white overflow-hidden shadow-2xl flex flex-col justify-between border border-white/10 min-h-[380px] ${[0, 1, 2, 3, 4, 5].includes(idx) ? 'cursor-pointer' : ''}`}
                style={{ backgroundColor: item.color }}
              >
                {/* Animated Background Gradients */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-white/20 rounded-full blur-[80px] group-hover:bg-white/30 transition-all duration-700 group-hover:scale-150"></div>
                <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-black/10 rounded-full blur-[60px] group-hover:bg-black/20 transition-all duration-700"></div>
                
                {/* Glass Overlay for Depth */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-8">
                    <div className="bg-white/15 p-4 rounded-2xl backdrop-blur-md border border-white/20 shadow-inner group-hover:rotate-12 transition-transform duration-500">
                      <item.icon size={32} className="text-white" />
                    </div>
                    <div className="text-white/30 font-black text-4xl select-none group-hover:text-white/50 transition-colors">
                      0{idx + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-black mb-4 leading-tight tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-white/85 leading-relaxed font-medium text-sm md:text-base">
                    {item.description}
                  </p>
                </div>
                
                {/* Interactive Bottom Element - Option A: Specific CTA */}
                <div className="relative z-10 mt-8 flex items-center gap-2 text-sm font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-500">
                  <div className="h-[2px] w-8 bg-white"></div>
                  <span>{item.cta}</span>
                </div>
                
                {/* Large Watermark Icon */}
                <div className="absolute -bottom-10 -right-10 opacity-[0.07] group-hover:opacity-[0.15] group-hover:scale-125 group-hover:-rotate-12 transition-all duration-700 pointer-events-none">
                  <item.icon size={180} />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Detailed Partners Section (Dynamic) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="text-center mb-16">
           <h2 className="text-3xl font-black text-kmmr-blue dark:text-white">{t('about.partners.title')}</h2>
           <p className="mt-4 text-gray-600 dark:text-gray-400">{t('about.partners.desc')}</p>
        </div>

        <div className="space-y-16">
          {/* Logic: Render sections based on fetchedPartnerTypes. 
              If no types exist in DB (first load), fallback to staticPartnerGroups */}
          
          {showDynamic ? (
            fetchedPartnerTypes.map((type) => {
             const groupItems = fetchedPartners.filter(p => p.type === type.id);
             if (groupItems.length === 0) return null;

             return (
              <div key={type.id} className="relative animate-fade-in-up">
                {/* Group Header */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-lg text-white flex items-center justify-center w-12 h-12 shrink-0" style={{ backgroundColor: type.color }}>
                    {type.icon ? (
                       <img src={type.icon} alt="" className="w-6 h-6 object-contain brightness-0 invert" style={{ filter: 'brightness(0) invert(1)' }} />
                    ) : (
                       <HeartHandshake size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-kmmr-blue dark:text-white">{getTypeName(type)}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{getTypeDesc(type)}</p>
                  </div>
                </div>

                {/* Partners Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {groupItems.map((partner: any, idx: number) => {
                     const link = partner.link || '#';
                     const bgColor = partner.bgColor || '#ffffff';
                     const name = getPartnerName(partner);

                     const CardContent = (
                        <>
                           <div 
                              className="aspect-video overflow-hidden relative flex items-center justify-center p-4 transition-colors"
                              style={{ backgroundColor: bgColor }}
                           >
                            <img 
                              src={partner.image} 
                              alt={name} 
                              className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"
                            />
                          </div>
                          <div className="p-4 flex items-center justify-center text-center h-20 bg-gray-50 dark:bg-gray-700">
                             <h4 className="font-bold text-sm text-kmmr-blue dark:text-gray-200 leading-tight">{name}</h4>
                          </div>
                        </>
                     );

                     return (
                      <div 
                        key={partner.id || idx}
                        className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                      >
                         {link !== '#' ? (
                            <a href={link} target="_blank" rel="noopener noreferrer" className="block h-full w-full">
                               {CardContent}
                            </a>
                         ) : (
                            <div className="block h-full w-full cursor-default">
                               {CardContent}
                            </div>
                         )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })) : (
            /* Fallback for static data only if no DB types exist (initial setup) */
            staticPartnerGroups.map((group) => {
             // Basic static render
             return (
              <div key={group.id} className="relative">
                <div className="flex items-center gap-4 mb-8">
                  <div className={`p-3 rounded-lg text-white ${group.color}`}>
                    <group.icon size={24} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-kmmr-blue dark:text-white">{group.title}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{group.description}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {group.items.map((partner: any, idx: number) => (
                      <div key={idx} className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                           <div className="aspect-video overflow-hidden relative flex items-center justify-center p-4 bg-white">
                            <img src={partner.image} alt={partner.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500"/>
                          </div>
                          <div className="p-4 flex items-center justify-center text-center h-20 bg-gray-50 dark:bg-gray-700">
                             <h4 className="font-bold text-sm text-kmmr-blue dark:text-gray-200 leading-tight">{partner.name}</h4>
                          </div>
                      </div>
                  ))}
                </div>
              </div>
            );
          }))}
        </div>
      </div>

      {/* Social Media Modal */}
      <AnimatePresence>
        {isSocialModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-lg overflow-hidden shadow-2xl relative"
            >
              <button 
                onClick={() => setIsSocialModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-kmmr-pink transition-colors z-10"
              >
                <X size={24} />
              </button>

              <div className="p-10">
                <div className="text-center mb-8">
                  <div className="w-20 h-20 bg-kmmr-green/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <Users className="text-kmmr-green w-10 h-10" />
                  </div>
                  <h3 className="text-3xl font-black text-kmmr-blue dark:text-white uppercase tracking-tight">
                    {language === 'uk' ? 'Наші соцмережі' : 'Our Social Media'}
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    {language === 'uk' ? 'Будь в курсі всіх новин та подій' : 'Stay updated with all news and events'}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {[
                    { icon: Instagram, name: 'Instagram', url: 'https://www.instagram.com/kyiv.city.yc.nycu/', color: 'hover:bg-pink-500' },
                    { icon: Facebook, name: 'Facebook', url: 'https://www.facebook.com/kyiv.city.yc.nycu/', color: 'hover:bg-blue-600' },
                    { icon: Send, name: 'Telegram', url: 'https://t.me/Kyiv_City_Youth_Council', color: 'hover:bg-blue-400' },
                    { icon: Linkedin, name: 'LinkedIn', url: 'https://www.linkedin.com/company/kyiv-city-youth-council?originalSubdomain=ua', color: 'hover:bg-blue-700' },
                    { icon: Youtube, name: 'YouTube', url: 'https://www.youtube.com/@kyiv_city_youth_council', color: 'hover:bg-red-600' }
                  ].map((social, i) => (
                    <a 
                      key={i}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`flex flex-col items-center justify-center p-6 rounded-3xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 transition-all duration-300 group ${social.color} hover:text-white hover:border-transparent hover:-translate-y-1 ${i === 0 ? 'col-span-2' : ''}`}
                    >
                      <social.icon size={32} className="mb-3 transition-transform group-hover:scale-110" />
                      <span className="font-bold text-sm uppercase tracking-wider">{social.name}</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/80 p-6 text-center border-t border-gray-100 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  {language === 'uk' ? 'Долучайся до нашої спільноти!' : 'Join our community!'}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Internship Registration Modal */}
      <AnimatePresence>
        {isInternshipModalOpen && (
          <InternshipModal 
            isOpen={isInternshipModalOpen} 
            onClose={() => setIsInternshipModalOpen(false)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};