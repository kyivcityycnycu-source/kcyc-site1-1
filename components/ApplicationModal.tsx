import React, { useState, useEffect } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle, AtSign, User, Phone, Mail, MessageSquare, ListTodo, ClipboardList, Briefcase, GraduationCap, Calendar, ChevronDown, Check } from 'lucide-react';
import { Modal } from './ui/Modal';
import { useLanguage } from '../context/LanguageContext';
import { submitApplicationForm } from '../services/api';
import { Opportunity } from '../types';
import { motion, AnimatePresence } from 'motion/react';

export type FormFieldType = 'text' | 'textarea' | 'social' | 'select';

export interface FormQuestion {
  id: string;
  label: string;
  type: FormFieldType;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select inputs
  allowMultiple?: boolean; // For select inputs (checkbox vs radio)
}

interface ApplicationModalProps {
  isOpen: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
}

// Default questions if none are configured (Legacy support)
const getDefaultQuestions = (type: string, t: any): FormQuestion[] => {
  if (type === 'Volunteering') {
    return [
      { id: 'social', label: t('application.socialLink'), type: 'social', required: true, placeholder: t('application.socialLinkPlaceholder') },
      { id: 'skills', label: t('application.skills'), type: 'textarea', required: true, placeholder: t('application.skillsPlaceholder') },
      { id: 'availability', label: t('application.availability'), type: 'text', required: true, placeholder: t('application.availabilityPlaceholder') },
      { id: 'motivation', label: t('contacts.labels.motivation'), type: 'textarea', required: false, placeholder: t('contacts.placeholders.motivation') },
    ];
  } else {
    // Event / Education / Job
    return [
      { id: 'social', label: t('application.socialLink'), type: 'social', required: true, placeholder: t('application.socialLinkPlaceholder') },
      { id: 'organization', label: t('application.organization'), type: 'text', required: true, placeholder: t('application.organizationPlaceholder') },
      { id: 'expectations', label: t('application.expectations'), type: 'textarea', required: false, placeholder: t('application.expectationsPlaceholder') },
    ];
  }
};

export const ApplicationModal: React.FC<ApplicationModalProps> = ({ isOpen, onClose, opportunity }) => {
  const { t, language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(false);

  // Standard static fields
  const [staticData, setStaticData] = useState({
    name: '',
    phone: '',
    email: ''
  });

  // Dynamic answers storage
  const [answers, setAnswers] = useState<Record<string, string>>({});
  
  // Specific state for social media inputs helper
  const [socialState, setSocialState] = useState<{platform: string, handle: string}>({
    platform: 'Instagram',
    handle: ''
  });

  // Initialize fields when opportunity changes
  useEffect(() => {
    if (isOpen) {
      setAnswers({});
      setSocialState({ platform: 'Instagram', handle: '' });
      setStaticData({ name: '', phone: '', email: '' });
    }
  }, [isOpen, opportunity]);

  if (!opportunity) return null;

  // Determine which questions to show
  const questionsToShow = opportunity.questions && opportunity.questions.length > 0 
    ? opportunity.questions 
    : getDefaultQuestions(opportunity.type, t);

  const handleStaticChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setStaticData({ ...staticData, [e.target.name]: e.target.value });
  };

  const handleAnswerChange = (id: string, value: string) => {
    setAnswers(prev => ({ ...prev, [id]: value }));
  };

  const handleSocialChange = (field: 'platform' | 'handle', value: string) => {
    const newState = { ...socialState, [field]: value };
    setSocialState(newState);
    // Automatically update the 'social' answer key if it exists in questions
    // This assumes the question ID for social media is 'social' or similar, 
    // but in dynamic forms, we map it by the question ID.
  };

  const handleSelectChange = (qId: string, option: string, isMultiple: boolean) => {
    const currentVal = answers[qId] || '';
    
    if (isMultiple) {
      const selected = currentVal ? currentVal.split(', ') : [];
      if (selected.includes(option)) {
        setAnswers(prev => ({ ...prev, [qId]: selected.filter(s => s !== option).join(', ') }));
      } else {
        setAnswers(prev => ({ ...prev, [qId]: [...selected, option].join(', ') }));
      }
    } else {
      setAnswers(prev => ({ ...prev, [qId]: option }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(false);

    try {
      // Finalize answers
      const finalAnswers: Record<string, string> = {};
      
      questionsToShow.forEach(q => {
        if (q.type === 'social') {
          if (socialState.handle) {
            finalAnswers[q.label] = `${socialState.platform}: @${socialState.handle}`;
          }
        } else if (answers[q.id]) {
          finalAnswers[q.label] = answers[q.id];
        }
      });

      await submitApplicationForm({
        name: staticData.name,
        phone: staticData.phone,
        email: staticData.email,
        opportunityId: opportunity.id,
        opportunityTitle: opportunity.title,
        type: opportunity.type,
        answers: finalAnswers
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 3000);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'Volunteering': return t('opportunities.types.volunteering');
      case 'Education': return t('opportunities.types.education');
      case 'Event': return t('opportunities.types.event');
      case 'Job': return t('opportunities.types.job');
      default: return type;
    }
  };

  // Updated styles for Dark Mode support (matching InternshipModal)
  const inputStyle = "w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-kmmr-blue dark:focus:border-blue-500/50 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 dark:text-white transition-all outline-none font-medium placeholder-gray-400 dark:placeholder-gray-500";
  const labelStyle = "block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1";

  const getHeaderIcon = (type: string) => {
    switch (type) {
      case 'Volunteering': return <ClipboardList className="text-kmmr-blue dark:text-blue-400 w-10 h-10" />;
      case 'Education': return <GraduationCap className="text-kmmr-blue dark:text-blue-400 w-10 h-10" />;
      case 'Event': return <Calendar className="text-kmmr-blue dark:text-blue-400 w-10 h-10" />;
      case 'Job': return <Briefcase className="text-kmmr-blue dark:text-blue-400 w-10 h-10" />;
      default: return <ListTodo className="text-kmmr-blue dark:text-blue-400 w-10 h-10" />;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="5xl">
      <div className="bg-white dark:bg-gray-900 transition-colors duration-300">
        <div className="p-8 md:p-10 pb-4 md:pb-5">
          <AnimatePresence mode="wait">
            {success ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle size={32} className="text-green-500" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-kmmr-blue dark:text-white">{t('application.success')}</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {language === 'uk' ? 'Ми зв\'яжемося з вами найближчим часом.' : 'We will contact you shortly.'}
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="form-container"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="text-center mb-10">
                  <div className="w-20 h-20 bg-kmmr-blue/10 dark:bg-blue-500/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    {getHeaderIcon(opportunity.type)}
                  </div>
                  <h3 className="text-3xl font-black text-kmmr-blue dark:text-white uppercase tracking-tight">
                    {t('application.title')} <span className="text-kmmr-pink">{opportunity.title}</span>
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                    {getTypeLabel(opportunity.type)}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* --- STANDARD FIELDS (Always present) --- */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="relative">
                      <label className={labelStyle}>{t('contacts.labels.name')} <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-blue-400/70" size={18} />
                        <input 
                          type="text" 
                          name="name" 
                          required 
                          value={staticData.name}
                          onChange={handleStaticChange}
                          className={inputStyle}
                          placeholder={t('contacts.placeholders.name')}
                        />
                      </div>
                    </div>

                    <div className="relative">
                      <label className={labelStyle}>{t('contacts.labels.phone')} <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-blue-400/70" size={18} />
                        <input 
                          type="tel" 
                          name="phone" 
                          required 
                          value={staticData.phone}
                          onChange={handleStaticChange}
                          className={inputStyle}
                          placeholder="+380..."
                        />
                      </div>
                    </div>

                    <div className="relative md:col-span-2">
                      <label className={labelStyle}>{t('contacts.labels.email')} <span className="text-red-500">*</span></label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-blue-400/70" size={18} />
                        <input 
                          type="email" 
                          name="email" 
                          required 
                          value={staticData.email}
                          onChange={handleStaticChange}
                          className={inputStyle}
                          placeholder="email@example.com"
                        />
                      </div>
                    </div>
                  </div>

                  {/* --- DYNAMIC FIELDS --- */}
                  <div className="space-y-6">
                    {questionsToShow.map((q) => (
                      <div key={q.id} className="relative">
                        <label className={labelStyle}>
                          {q.label} {q.required && <span className="text-red-500">*</span>}
                        </label>
                        
                        {q.type === 'text' && (
                          <div className="relative">
                            <ListTodo className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-blue-400/70" size={18} />
                            <input 
                              type="text" 
                              required={q.required}
                              placeholder={q.placeholder}
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              className={inputStyle}
                            />
                          </div>
                        )}

                        {q.type === 'textarea' && (
                          <div className="relative">
                            <MessageSquare className="absolute left-4 top-4 text-gray-400 dark:text-blue-400/70" size={18} />
                            <textarea 
                              required={q.required}
                              placeholder={q.placeholder}
                              rows={3}
                              value={answers[q.id] || ''}
                              onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                              className={`${inputStyle} resize-none pt-4`}
                            />
                          </div>
                        )}

                        {q.type === 'select' && (
                          <div className="grid grid-cols-1 gap-3">
                             {q.options?.map((opt, idx) => {
                                const currentVal = answers[q.id] || '';
                                const isSelected = q.allowMultiple 
                                   ? currentVal.split(', ').includes(opt)
                                   : currentVal === opt;
                                
                                return (
                                   <label 
                                      key={idx} 
                                      className={`flex items-center gap-3 p-4 rounded-2xl border-2 cursor-pointer transition-all group ${
                                         isSelected 
                                            ? 'border-kmmr-blue bg-blue-50/50 dark:bg-blue-900/10 shadow-sm' 
                                            : 'border-transparent bg-gray-50 dark:bg-gray-800/50 hover:border-kmmr-blue/30 dark:hover:border-blue-500/30'
                                      }`}
                                   >
                                      <div className={`w-5 h-5 flex items-center justify-center shrink-0 transition-all border-2 ${
                                         isSelected 
                                            ? (q.allowMultiple ? 'bg-kmmr-blue border-kmmr-blue rounded-md' : 'bg-kmmr-blue border-kmmr-blue rounded-full') 
                                            : (q.allowMultiple ? 'border-gray-300 dark:border-slate-600 rounded-md' : 'border-gray-300 dark:border-slate-600 rounded-full')
                                      }`}>
                                        {isSelected && (
                                           q.allowMultiple 
                                              ? <Check size={14} className="text-white stroke-[3px]" /> 
                                              : <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                        )}
                                      </div>
                                      <input 
                                         type="checkbox" 
                                         name={q.id} 
                                         value={opt}
                                         checked={isSelected}
                                         onChange={() => handleSelectChange(q.id, opt, q.allowMultiple || false)}
                                         className="hidden"
                                      />
                                      <span className={`text-sm font-bold ${isSelected ? 'text-kmmr-blue dark:text-white' : 'text-gray-600 dark:text-gray-400'}`}>{opt}</span>
                                   </label>
                                );
                             })}
                          </div>
                        )}

                        {q.type === 'checkbox' && (
                          <div className="flex gap-4">
                            <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${answers[q.id] === 'Так' ? 'border-kmmr-blue bg-blue-50/50 dark:bg-blue-900/10 text-kmmr-blue dark:text-blue-400' : 'border-transparent bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-kmmr-blue/30'}`}>
                              <input 
                                type="radio" 
                                name={q.id}
                                required={q.required}
                                checked={answers[q.id] === 'Так'}
                                onChange={() => handleAnswerChange(q.id, 'Так')}
                                className="w-4 h-4 text-kmmr-blue focus:ring-kmmr-blue"
                              />
                              <span className="text-sm font-bold">Так</span>
                            </label>
                            <label className={`flex-1 flex items-center justify-center gap-2 p-4 rounded-2xl border-2 cursor-pointer transition-colors ${answers[q.id] === 'Ні' ? 'border-kmmr-pink bg-pink-50/50 dark:bg-pink-900/10 text-kmmr-pink dark:text-pink-400' : 'border-transparent bg-gray-50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 hover:border-kmmr-pink/30'}`}>
                              <input 
                                type="radio" 
                                name={q.id}
                                required={q.required}
                                checked={answers[q.id] === 'Ні'}
                                onChange={() => handleAnswerChange(q.id, 'Ні')}
                                className="w-4 h-4 text-kmmr-pink focus:ring-kmmr-pink"
                              />
                              <span className="text-sm font-bold">Ні</span>
                            </label>
                          </div>
                        )}

                        {q.type === 'social' && (
                          <div className="flex rounded-2xl overflow-hidden bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus-within:border-kmmr-blue dark:focus-within:border-blue-500/50 transition-all h-[54px]">
                            <div className="relative border-r-2 border-white dark:border-gray-900">
                              <select 
                                value={socialState.platform}
                                onChange={(e) => handleSocialChange('platform', e.target.value)}
                                className="appearance-none bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 h-full pl-5 pr-10 focus:outline-none text-[10px] sm:text-[11px] font-black uppercase tracking-widest transition-colors cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-600"
                              >
                                <option value="Instagram">Instagram</option>
                                <option value="Telegram">Telegram</option>
                                <option value="Facebook">Facebook</option>
                                <option value="TikTok">TikTok</option>
                                <option value="LinkedIn">LinkedIn</option>
                                <option value="Twitter">Twitter/X</option>
                              </select>
                              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 dark:text-gray-400">
                                <ChevronDown size={14} />
                              </div>
                            </div>
                            
                            <div className="flex-grow relative">
                               {socialState.platform !== 'Facebook' && socialState.platform !== 'LinkedIn' && (
                                 <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 dark:text-blue-400/70">
                                   <AtSign size={16} />
                                 </div>
                               )}
                               <input 
                                  type="text" 
                                  required={q.required}
                                  value={socialState.handle}
                                  onChange={(e) => handleSocialChange('handle', e.target.value)}
                                  className={`w-full h-full bg-transparent pr-4 text-gray-900 dark:text-white outline-none font-medium placeholder-gray-400 dark:placeholder-gray-500 text-sm ${
                                    (socialState.platform === 'Facebook' || socialState.platform === 'LinkedIn') ? 'pl-4' : 'pl-10'
                                  }`}
                                  placeholder={
                                    (socialState.platform === 'Facebook' || socialState.platform === 'LinkedIn') 
                                      ? (language === 'en' ? 'Paste the link to your profile' : 'Вставте посилання на вашу сторінку')
                                      : (q.placeholder || 'username')
                                  }
                                />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-300 rounded-2xl flex items-center gap-3 text-sm border-2 border-red-100 dark:border-red-900/50 font-bold">
                      <AlertCircle size={18} />
                      <span>{t('contacts.error')}</span>
                    </div>
                  )}

                  <div className="pt-2">
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="w-full bg-kmmr-blue hover:bg-kmmr-blue/90 text-white font-black py-4 rounded-2xl shadow-xl shadow-kmmr-blue/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loading ? <Loader2 size={20} className="animate-spin" /> : <>{t('application.submit')} <Send size={18} /></>}
                    </button>
                    <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 text-center mt-4 px-4 leading-relaxed font-medium">
                      {t('contacts.consent')}
                    </p>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        
        {!success && (
          <div className="bg-gray-50 dark:bg-gray-800/80 p-6 text-center border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              {opportunity.type === 'Event' 
                ? (language === 'uk' ? 'Чекаємо на зустріч з вами! Ми надішлемо підтвердження на вказану пошту.' : 'Looking forward to meeting you! We will send a confirmation to your email.')
                : (language === 'uk' ? 'Ми переглянемо вашу анкету протягом 2-3 робочих днів.' : 'We will review your application within 2-3 business days.')}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};
