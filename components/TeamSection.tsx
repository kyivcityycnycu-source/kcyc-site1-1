import React, { useState, useEffect } from 'react';
import { DEPARTMENTS_UK, DEPARTMENTS_EN, TEAM_MEMBERS_UK, TEAM_MEMBERS_EN } from '../constants';
import { Modal } from './ui/Modal';
import { TeamMember, Department } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { onSnapshot, query, collection } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { Loader2, Instagram, Copy, Check } from 'lucide-react';
import { OptimizedImage } from './ui/OptimizedImage';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { preloadImageUrls } from '../lib/preload';
import { motion, AnimatePresence } from 'motion/react';

interface TeamSectionProps {
  onlyModal?: boolean;
}

export const TeamSection: React.FC<TeamSectionProps> = ({ onlyModal = false }) => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const { language, t } = useLanguage();

  // Sync selected member with URL ID
  useEffect(() => {
    if (id && teamMembers.length > 0) {
      const member = teamMembers.find(m => m.id === id);
      if (member) {
        setSelectedMember(member);
      }
    } else if (!id) {
      setSelectedMember(null);
    }
  }, [id, teamMembers]);

  useEffect(() => {
    setLoading(true);

    // Fetch Departments (Realtime)
    const unsubDepts = onSnapshot(query(collection(db, "departments")), (snapshot) => {
        const fetchedDepts: Department[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Department));

        // Sort Departments by order
        fetchedDepts.sort((a,b) => {
          const orderA = a.order !== undefined ? a.order : 999;
          const orderB = b.order !== undefined ? b.order : 999;
          if (orderA !== orderB) return orderA - orderB;
          return a.name.localeCompare(b.name);
        });

        if (fetchedDepts.length > 0) {
           setDepartments(fetchedDepts);
        } else {
           // Fallback to constants if DB is empty but typically DB has data
           setDepartments(language === 'uk' ? DEPARTMENTS_UK as any : DEPARTMENTS_EN as any);
        }
    }, (error) => {
        console.warn("Error fetching departments:", error);
        setDepartments(language === 'uk' ? DEPARTMENTS_UK as any : DEPARTMENTS_EN as any);
    });

    // Fetch Team (Realtime)
    const unsubTeam = onSnapshot(query(collection(db, "team")), (snapshot) => {
        const fetchedTeam: TeamMember[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as TeamMember));

        // Sort Team Members by order
        fetchedTeam.sort((a,b) => {
          const orderA = a.order !== undefined ? a.order : 999;
          const orderB = b.order !== undefined ? b.order : 999;
          return orderA - orderB;
        });

        if (fetchedTeam.length > 0) {
          setTeamMembers(fetchedTeam);
          // Preload member photos
          preloadImageUrls(fetchedTeam.map(m => m.image).filter(Boolean));
        } else {
          setTeamMembers(language === 'uk' ? TEAM_MEMBERS_UK : TEAM_MEMBERS_EN);
        }
        setLoading(false);
    }, (error) => {
        console.warn("Error fetching team:", error);
        setTeamMembers(language === 'uk' ? TEAM_MEMBERS_UK : TEAM_MEMBERS_EN);
        setLoading(false);
    });

    return () => {
        unsubDepts();
        unsubTeam();
    };
  }, [language]);

  // Function to get members for a specific department
  const getMembersByDept = (deptId: string) => {
    return teamMembers.filter(m => {
      if (Array.isArray(m.departments) && m.departments.length > 0) {
        return m.departments.includes(deptId);
      }
      return m.department === deptId;
    });
  };

  // Helper to get localized text
  const getMemberName = (m: TeamMember) => language === 'uk' ? m.name : (m.nameEn || m.name);
  const getMemberRole = (m: TeamMember) => language === 'uk' ? m.role : (m.roleEn || m.role);
  const getMemberBio = (m: TeamMember) => language === 'uk' ? m.bio : (m.bioEn || m.bio);
  const getMemberDetails = (m: TeamMember) => language === 'uk' ? m.details : (m.detailsEn || m.details);

  const getDeptName = (d: Department) => language === 'uk' ? d.name : (d.nameEn || d.name);
  const getDeptDesc = (d: Department) => language === 'uk' ? d.description : (d.descriptionEn || d.description);

  const handleCopyEmail = (email: string, e: React.MouseEvent) => {
    e.preventDefault();
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 3000);
  };

  const handleCloseModal = () => {
    setSelectedMember(null);
    setCopiedEmail(null);
    if (location.state?.backgroundLocation) {
      navigate(-1);
    } else if (location.state?.fromHome) {
      navigate('/');
    } else {
      navigate('/team');
    }
  };

  // If onlyModal is true, we only render the modal part
  if (onlyModal) {
    return (
      <Modal isOpen={!!selectedMember} onClose={handleCloseModal} size="7xl">
        {selectedMember && (
          <div className="flex flex-col lg:flex-row landscape:flex-row overflow-hidden bg-white dark:bg-gray-800 transition-colors text-left w-full lg:h-[500px] xl:h-[580px] landscape:h-[250px] landscape:sm:h-[300px] landscape:md:h-[300px] landscape:lg:h-[500px] landscape:xl:h-[580px]">
            <div className="relative w-full aspect-square lg:w-[500px] lg:h-[500px] xl:w-[580px] xl:h-[580px] landscape:w-[250px] landscape:h-[250px] landscape:sm:w-[300px] landscape:sm:h-[300px] landscape:md:w-[300px] landscape:md:h-[300px] landscape:lg:w-[500px] landscape:lg:h-[500px] landscape:xl:w-[580px] landscape:xl:h-[580px] bg-gray-100 dark:bg-gray-700 shrink-0 overflow-hidden">
              <OptimizedImage 
                src={selectedMember.image} 
                alt={getMemberName(selectedMember)} 
                className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                containerClassName="absolute inset-0 w-full h-full"
              />
            </div>
            <div className="flex-1 lg:w-[500px] xl:w-[580px] lg:shrink-0 xl:shrink-0 landscape:lg:w-[500px] landscape:xl:w-[580px] landscape:lg:shrink-0 landscape:xl:shrink-0 p-5 md:p-6 lg:p-8 xl:p-10 flex flex-col justify-start lg:overflow-hidden lg:h-full landscape:overflow-hidden landscape:h-full landscape:overflow-y-auto lg:overflow-y-auto">
              <div className="mb-4 shrink-0">
                <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-kmmr-blue dark:text-white mb-2 leading-tight">{getMemberName(selectedMember)}</h3>
                <div className="flex flex-wrap items-start justify-start gap-1.5">
                  {getMemberRole(selectedMember).split(',').map((role, idx) => (
                    <span 
                      key={idx} 
                      className="inline-block bg-kmmr-green/10 text-kmmr-green px-3 py-1 lg:px-4 lg:py-1.5 rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-wide leading-normal text-left w-max max-w-full"
                    >
                      {role.trim()}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3.5 mb-5 overflow-y-auto landscape:overflow-y-visible landscape:flex-none lg:overflow-y-visible lg:flex-none flex-1 pr-1">
                 <p className="text-gray-600 dark:text-gray-300 italic text-sm sm:text-base lg:text-lg xl:text-xl xl:leading-relaxed">"{getMemberBio(selectedMember)}"</p>
                 <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-3"></div>
                 <h5 className="font-bold text-kmmr-blue dark:text-gray-200 uppercase text-[10px] sm:text-xs lg:text-sm xl:text-base">{t('team.modal.role')}</h5>
                 <ul className="space-y-1.5">
                   {getMemberDetails(selectedMember)?.map((detail, idx) => (
                     <li key={idx} className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-xs sm:text-sm lg:text-base xl:text-lg">
                       <span className="mt-1.5 lg:mt-2.5 w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full bg-kmmr-pink shrink-0"></span>
                       <span>{detail}</span>
                     </li>
                   ))}
                 </ul>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto shrink-0">
                {selectedMember.email && (
                  <button 
                    onClick={(e) => handleCopyEmail(selectedMember.email!, e)}
                    className="inline-flex items-center text-left justify-start gap-2 text-kmmr-blue dark:text-blue-400 hover:text-kmmr-pink font-semibold transition-colors group relative text-xs sm:text-sm lg:text-base xl:text-lg cursor-pointer"
                  >
                    <span className="text-left break-all">{t('team.modal.contact')} {selectedMember.email}</span>
                    <div className="flex items-center justify-center w-5 h-5 shrink-0">
                      {copiedEmail === selectedMember.email ? (
                        <Check size={16} className="text-green-500 animate-in zoom-in duration-300" />
                      ) : (
                        <Copy size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    
                    <AnimatePresence>
                      {copiedEmail === selectedMember.email && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.5, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.5, y: 10 }}
                          className="absolute bottom-full left-0 mb-1 bg-green-500 text-white text-[10px] py-1 px-3 rounded-full shadow-lg z-50 pointer-events-none"
                        >
                          {language === 'uk' ? 'Email скопійовано!' : 'Email copied!'}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                )}

                {selectedMember.instagram && (
                  <a 
                    href={selectedMember.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1 text-gray-600 dark:text-gray-300"
                    title="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    );
  }

  return (
    <div className="py-16 bg-white dark:bg-gray-950 min-h-screen transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-kmmr-pink font-bold uppercase tracking-widest text-sm mb-2 block">{t('team.tag')}</span>
          <h2 className="text-4xl font-black text-kmmr-blue dark:text-white">{t('team.title')}</h2>
          <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            {t('team.desc')}
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-kmmr-blue dark:text-blue-400 w-10 h-10" />
          </div>
        ) : (
          <div className="space-y-16">
            {departments.map((dept) => {
              const members = getMembersByDept(dept.id);
              
              return (
                <div key={dept.id} className="relative">
                  {/* Department Header */}
                  <div className="flex items-center gap-4 mb-8">
                    <div 
                      className={`p-3 rounded-lg text-white flex items-center justify-center w-12 h-12 shrink-0 ${dept.color.startsWith('bg-') ? dept.color : ''}`}
                      style={{ backgroundColor: dept.color.startsWith('bg-') ? undefined : dept.color }}
                    >
                       {/* Render Icon: Check if string (URL) or Component (Legacy) */}
                       {typeof dept.icon === 'string' ? (
                          <img 
                            src={dept.icon} 
                            alt="" 
                            className="w-full h-full object-contain brightness-0 invert" 
                            style={{ filter: 'brightness(0) invert(1)' }}
                          />
                       ) : (
                          <dept.icon size={24} />
                       )}
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-kmmr-blue dark:text-white">{getDeptName(dept)}</h3>
                      <p className="text-gray-500 dark:text-gray-400 text-sm">{getDeptDesc(dept)}</p>
                    </div>
                  </div>

                  {/* Members Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {members.length > 0 ? (
                      members.map((member) => (
                        <div 
                          key={member.id}
                          onClick={() => navigate(`/team/${member.id}`, { 
                            state: { 
                              backgroundLocation: location,
                              fromHome: location.pathname === '/' 
                            } 
                          })}
                          className="group relative bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden cursor-pointer hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
                        >
                          <div className="aspect-square overflow-hidden bg-gray-100 dark:bg-gray-700">
                            <OptimizedImage 
                              src={member.image} 
                              alt={getMemberName(member)} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              containerClassName="w-full h-full"
                            />
                          </div>
                          <div className="p-4">
                             <h4 className="font-bold text-lg text-kmmr-blue dark:text-white leading-tight mb-1">{getMemberName(member)}</h4>
                             <p className="text-sm text-gray-500 dark:text-gray-400">{getMemberRole(member)}</p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="col-span-full p-4 border border-dashed border-gray-200 dark:border-gray-700 rounded-xl text-center text-gray-400 text-sm">
                        {t('team.empty')}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <Modal isOpen={!!selectedMember} onClose={handleCloseModal} size="7xl">
        {selectedMember && (
          <div className="flex flex-col lg:flex-row landscape:flex-row overflow-hidden bg-white dark:bg-gray-800 transition-colors text-left w-full lg:h-[500px] xl:h-[580px] landscape:h-[250px] landscape:sm:h-[300px] landscape:md:h-[300px] landscape:lg:h-[500px] landscape:xl:h-[580px]">
            <div className="relative w-full aspect-square lg:w-[500px] lg:h-[500px] xl:w-[580px] xl:h-[580px] landscape:w-[250px] landscape:h-[250px] landscape:sm:w-[300px] landscape:sm:h-[300px] landscape:md:w-[300px] landscape:md:h-[300px] landscape:lg:w-[500px] landscape:lg:h-[500px] landscape:xl:w-[580px] landscape:xl:h-[580px] bg-gray-100 dark:bg-gray-700 shrink-0 overflow-hidden">
              <OptimizedImage 
                src={selectedMember.image} 
                alt={getMemberName(selectedMember)} 
                className="absolute inset-0 w-full h-full object-cover animate-fade-in"
                containerClassName="absolute inset-0 w-full h-full"
              />
            </div>
            <div className="flex-1 lg:w-[500px] xl:w-[580px] lg:shrink-0 xl:shrink-0 landscape:lg:w-[500px] landscape:xl:w-[580px] landscape:lg:shrink-0 landscape:xl:shrink-0 p-5 md:p-6 lg:p-8 xl:p-10 flex flex-col justify-start lg:overflow-hidden lg:h-full landscape:overflow-hidden landscape:h-full landscape:overflow-y-auto lg:overflow-y-auto">
              <div className="mb-4 shrink-0">
                <h3 className="text-xl md:text-2xl lg:text-3xl xl:text-4xl font-black text-kmmr-blue dark:text-white mb-2 leading-tight">{getMemberName(selectedMember)}</h3>
                <div className="flex flex-wrap items-start justify-start gap-1.5">
                  {getMemberRole(selectedMember).split(',').map((role, idx) => (
                    <span 
                      key={idx} 
                      className="inline-block bg-kmmr-green/10 text-kmmr-green px-3 py-1 lg:px-4 lg:py-1.5 rounded-xl text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-wide leading-normal text-left w-max max-w-full"
                    >
                      {role.trim()}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3.5 mb-5 overflow-y-auto landscape:overflow-y-visible landscape:flex-none lg:overflow-y-visible lg:flex-none flex-1 pr-1">
                 <p className="text-gray-600 dark:text-gray-300 italic text-sm sm:text-base lg:text-lg xl:text-xl xl:leading-relaxed">"{getMemberBio(selectedMember)}"</p>
                 <div className="h-px bg-gray-100 dark:bg-gray-700 w-full my-3"></div>
                 <h5 className="font-bold text-kmmr-blue dark:text-gray-200 uppercase text-[10px] sm:text-xs lg:text-sm xl:text-base">{t('team.modal.role')}</h5>
                 <ul className="space-y-1.5">
                   {getMemberDetails(selectedMember)?.map((detail, idx) => (
                     <li key={idx} className="flex items-start gap-2 text-gray-600 dark:text-gray-400 text-xs sm:text-sm lg:text-base xl:text-lg">
                       <span className="mt-1.5 lg:mt-2.5 w-1.5 lg:w-2 h-1.5 lg:h-2 rounded-full bg-kmmr-pink shrink-0"></span>
                       <span>{detail}</span>
                     </li>
                   ))}
                 </ul>
              </div>

              <div className="flex items-center justify-between gap-4 pt-4 border-t border-gray-100 dark:border-gray-700 mt-auto shrink-0">
                {selectedMember.email && (
                  <button 
                    onClick={(e) => handleCopyEmail(selectedMember.email!, e)}
                    className="inline-flex items-center text-left justify-start gap-2 text-kmmr-blue dark:text-blue-400 hover:text-kmmr-pink font-semibold transition-colors group relative text-xs sm:text-sm lg:text-base xl:text-lg cursor-pointer"
                  >
                    <span className="text-left break-all">{t('team.modal.contact')} {selectedMember.email}</span>
                    <div className="flex items-center justify-center w-5 h-5 shrink-0">
                      {copiedEmail === selectedMember.email ? (
                        <Check size={16} className="text-green-500 animate-in zoom-in duration-300" />
                      ) : (
                        <Copy size={16} className="opacity-50 group-hover:opacity-100 transition-opacity" />
                      )}
                    </div>
                    
                    <AnimatePresence>
                      {copiedEmail === selectedMember.email && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.5, y: 10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.5, y: 10 }}
                          className="absolute bottom-full left-0 mb-1 bg-green-500 text-white text-[10px] py-1 px-3 rounded-full shadow-lg z-50 pointer-events-none"
                        >
                          {language === 'uk' ? 'Email скопійовано!' : 'Email copied!'}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </button>
                )}

                {selectedMember.instagram && (
                  <a 
                    href={selectedMember.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center hover:bg-gradient-to-tr hover:from-yellow-400 hover:via-red-500 hover:to-purple-600 hover:text-white transition-all duration-300 transform hover:-translate-y-1 text-gray-600 dark:text-gray-300"
                    title="Instagram"
                  >
                    <Instagram className="w-5 h-5" />
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
