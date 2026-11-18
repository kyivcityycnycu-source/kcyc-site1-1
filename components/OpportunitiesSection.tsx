import React, { useEffect, useState } from 'react';
import { OPPORTUNITIES_UK, OPPORTUNITIES_EN, PROJECTS_UK, PROJECTS_EN } from '../constants';
import { Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { query, collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Opportunity, Project } from '../types';
import { ApplicationModal } from './ApplicationModal';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { preloadImageUrls } from '../lib/preload';
import { EmptyState, CardSkeleton } from './ui/SectionSkeleton';
import { formatDisplayDate } from '../lib/dateDisplay';
import { PARTICIPANT_JOIN_FORM_URL } from '../constants';
import { openExternal } from '../lib/openExternal';
import { trackOpportunityApply } from '../services/analytics';

/** Prefer on-site ApplicationModal; Google Form only if set and not the join Form. */
const shouldOpenExternalForm = (opp: Opportunity) => {
  const link = (opp.googleFormLink || '').trim();
  if (!link) return false;
  if (opp.hasRegistration === false) return false;
  // Join Form is for «Приєднатися», not opportunities apply
  if (link === PARTICIPANT_JOIN_FORM_URL || link.includes('UKqw2hm1vRissead6')) return false;
  return true;
};

interface OpportunitiesSectionProps {
  onlyModal?: boolean;
}

export const OpportunitiesSection: React.FC<OpportunitiesSectionProps> = ({ onlyModal = false }) => {
  const { language, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams<{ id: string }>();
  const [opportunities, setOpportunities] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State for Modal
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);

  // Sync selected opportunity with URL ID
  useEffect(() => {
    if (id && opportunities.length > 0) {
      const opp = opportunities.find(o => o.id === id);
      if (opp) {
        setSelectedOpportunity(opp);
      }
    } else if (!id) {
      setSelectedOpportunity(null);
    }
  }, [id, opportunities]);

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'Volunteering': return t('opportunities.types.volunteering');
      case 'Education': return t('opportunities.types.education');
      case 'Event': return t('opportunities.types.event');
      case 'Job': return t('opportunities.types.job');
      default: return type;
    }
  };

  // Helper to convert project to opportunity format
  const convertProjectToOpp = (p: Project): Opportunity => {
    const title = language === 'uk' ? p.title : (p.titleEn || p.title);
    const desc = language === 'uk' ? p.description : (p.descriptionEn || p.description);

    return {
      id: p.id,
      title: title,
      description: desc,
      deadline: p.deadline!,
      type: 'Event',
      link: '',
      image: p.image,
      hasRegistration: p.hasRegistration,
      googleFormLink: p.googleFormLink,
      questions: p.questions
    };
  };

  const loadStaticData = () => {
    const staticOpps = language === 'uk' ? OPPORTUNITIES_UK : OPPORTUNITIES_EN;
    const staticProjs = language === 'uk' ? PROJECTS_UK : PROJECTS_EN;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Filter active projects from static data
    const activeStaticProjs = staticProjs
      .filter(p => p.deadline && new Date(p.deadline) >= today)
      .map(convertProjectToOpp);

    return [...staticOpps, ...activeStaticProjs];
  };

  const handleCloseModal = () => {
    setSelectedOpportunity(null);
    if (location.state?.backgroundLocation) {
      navigate(-1);
    } else if (location.state?.fromHome) {
      navigate('/');
    } else {
      navigate('/opportunities');
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch opportunities
        const qOpps = query(collection(db, "opportunities"));
        // 2. Fetch projects
        const qProjs = query(collection(db, "projects"));

        const [oppsSnapshot, projsSnapshot] = await Promise.all([
          getDocs(qOpps),
          getDocs(qProjs)
        ]);

        let fetchedOpps: Opportunity[] = oppsSnapshot.docs.map(doc => {
            const data = doc.data();
            // Handle language logic for raw Opportunities too
            const title = language === 'uk' ? data.title : (data.titleEn || data.title);
            const desc = language === 'uk' ? data.description : (data.descriptionEn || data.description);

            return {
              id: doc.id,
              ...data,
              title,
              description: desc
            } as Opportunity;
        });

        // 3. Process projects into opportunities
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeProjectsAsOpps: Opportunity[] = projsSnapshot.docs
          .map(doc => ({ id: doc.id, ...doc.data() } as Project))
          .filter(p => p.deadline && new Date(p.deadline) >= today)
          .map(convertProjectToOpp);

        // 4. Combine
        let combinedOpps = [...fetchedOpps, ...activeProjectsAsOpps];

        // 5. Fallback to static data if DB is empty
        if (combinedOpps.length === 0) {
           combinedOpps = loadStaticData();
        }

        // 6. Sort by deadline 
        combinedOpps.sort((a, b) => {
           if (!a.deadline) return 1;
           if (!b.deadline) return -1;
           const dateA = new Date(a.deadline).getTime();
           const dateB = new Date(b.deadline).getTime();
           return dateA - dateB;
        });

        setOpportunities(combinedOpps);
        // Preload opportunity images
        preloadImageUrls(combinedOpps.map(o => o.image).filter(Boolean) as string[]);
      } catch (error) {
        console.warn("Error fetching data:", error);
        // Fallback on error
        const data = loadStaticData();
        setOpportunities(data);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [language]);

  if (onlyModal) {
    return (
      <ApplicationModal 
        isOpen={!!selectedOpportunity} 
        onClose={handleCloseModal} 
        opportunity={selectedOpportunity} 
      />
    );
  }

  return (
    <div className="py-16 bg-white dark:bg-gray-950 transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
          <div>
            <span className="text-kmmr-pink font-bold uppercase tracking-widest text-sm mb-2 block">{t('opportunities.tag')}</span>
            <h2 className="text-4xl font-black text-kmmr-blue dark:text-white">{t('opportunities.title')}</h2>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <CardSkeleton key={i} aspect="aspect-[4/3]" />
            ))}
          </div>
        ) : opportunities.length === 0 ? (
          <EmptyState title={t('opportunities.emptyTitle')} description={t('opportunities.emptyDesc')} />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {opportunities.map((opp) => (
              <div 
                key={opp.id} 
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    navigate(`/opportunities/${opp.id}`, { 
                      state: { backgroundLocation: location, fromHome: location.pathname === '/' } 
                    });
                  }
                }}
                onClick={() => navigate(`/opportunities/${opp.id}`, { 
                  state: { 
                    backgroundLocation: location,
                    fromHome: location.pathname === '/' 
                  } 
                })}
                className="border border-gray-100 dark:border-gray-700 rounded-2xl p-6 hover:border-kmmr-pink/30 hover:shadow-lg transition-all duration-300 group bg-gray-50 dark:bg-gray-800 hover:bg-white dark:hover:bg-gray-700 animate-fade-in-up flex flex-col cursor-pointer focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kmmr-pink"
              >
                <div className="flex justify-between items-start mb-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${
                    opp.type === 'Volunteering' ? 'bg-kmmr-green/10 text-kmmr-green' :
                    opp.type === 'Education' ? 'bg-kmmr-blue/10 text-kmmr-blue dark:text-blue-400 dark:bg-blue-400/10' :
                    'bg-kmmr-pink/10 text-kmmr-pink'
                  }`}>
                    {getTypeLabel(opp.type)}
                  </span>
                  <div className={`flex items-center gap-1 text-xs font-semibold ${!opp.deadline ? 'text-green-600' : 'text-gray-400 dark:text-gray-500'}`}>
                    {opp.deadline ? (
                      <>
                        <Clock size={12} />
                        <span>{formatDisplayDate(opp.deadline, language)}</span>
                      </>
                    ) : (
                      <>
                        <Clock size={12} />
                        <span>{t('opportunities.ongoing')}</span>
                      </>
                    )}
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-kmmr-blue dark:text-white mb-3 group-hover:text-kmmr-pink transition-colors">{opp.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm mb-6 line-clamp-3 flex-grow">{opp.description}</p>
                
                <button 
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    trackOpportunityApply('list');
                    if (shouldOpenExternalForm(opp)) {
                      openExternal(opp.googleFormLink!);
                      return;
                    }
                    navigate(`/opportunities/${opp.id}`, { 
                      state: { 
                        backgroundLocation: location,
                        fromHome: location.pathname === '/' 
                      } 
                    });
                  }}
                  className="text-sm font-bold text-kmmr-blue dark:text-blue-400 border-b-2 border-transparent group-hover:border-kmmr-pink transition-all self-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-kmmr-pink"
                >
                  {t('opportunities.apply')}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <ApplicationModal 
        isOpen={!!selectedOpportunity} 
        onClose={handleCloseModal} 
        opportunity={selectedOpportunity} 
      />
    </div>
  );
};
