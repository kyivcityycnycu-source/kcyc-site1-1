import React, { useState, useEffect } from 'react';
import { Send, Loader2, CheckCircle, AlertCircle, AtSign } from 'lucide-react';
import { Modal } from './ui/Modal';
import { useLanguage } from '../context/LanguageContext';
import { submitApplicationForm } from '../services/api';
import { Opportunity } from '../types';

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
  const { t } = useLanguage();
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

  // Updated styles for Dark Mode support
  const inputStyle = "w-full px-4 py-2 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 focus:outline-none focus:border-kmmr-blue transition-colors placeholder-gray-400 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-500";
  const labelStyle = "text-sm font-bold text-gray-700 dark:text-gray-300";

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-8 bg-white dark:bg-gray-800 transition-colors duration-300">
        {success ? (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-kmmr-green rounded-full flex items-center justify-center mb-6">
              <CheckCircle size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold mb-2 text-kmmr-blue dark:text-white">{t('application.success')}</h3>
          </div>
        ) : (
          <div>
            <div className="mb-6 border-b border-gray-100 dark:border-gray-700 pb-4">
              <h3 className="text-2xl font-black text-kmmr-blue dark:text-white">
                {t('application.title')} <span className="text-kmmr-pink">{opportunity.title}</span>
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 uppercase tracking-wider">{getTypeLabel(opportunity.type)}</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* --- STANDARD FIELDS (Always present) --- */}
              <div className="space-y-2">
                <label className={labelStyle}>{t('contacts.labels.name')} <span className="text-red-500">*</span></label>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className={labelStyle}>{t('contacts.labels.phone')} <span className="text-red-500">*</span></label>
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
                <div className="space-y-2">
                  <label className={labelStyle}>{t('contacts.labels.email')} <span className="text-red-500">*</span></label>
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

              {/* --- DYNAMIC FIELDS --- */}
              {questionsToShow.map((q) => (
                <div key={q.id} className="space-y-2">
                  <label className={labelStyle}>
                    {q.label} {q.required && <span className="text-red-500">*</span>}
                  </label>
                  
                  {q.type === 'text' && (
                    <input 
                      type="text" 
                      required={q.required}
                      placeholder={q.placeholder}
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className={inputStyle}
                    />
                  )}

                  {q.type === 'textarea' && (
                    <textarea 
                      required={q.required}
                      placeholder={q.placeholder}
                      rows={3}
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      className={inputStyle}
                    />
                  )}

                  {q.type === 'select' && (
                    <div className="grid grid-cols-1 gap-2">
                       {q.options?.map((opt, idx) => {
                          const currentVal = answers[q.id] || '';
                          const isSelected = q.allowMultiple 
                             ? currentVal.split(', ').includes(opt)
                             : currentVal === opt;
                          
                          return (
                             <label 
                                key={idx} 
                                className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all group ${
                                   isSelected 
                                      ? 'border-[#D7269B] bg-gray-50 dark:bg-gray-700/50 shadow-sm' 
                                      : 'border-gray-200 dark:border-slate-700 hover:border-kmmr-blue/50 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/30'
                                }`}
                             >
                                <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                   isSelected ? 'border-[#D7269B] bg-[#D7269B] text-white' : 'border-gray-300 dark:border-slate-500 bg-white dark:bg-transparent text-transparent group-hover:border-gray-400 dark:group-hover:border-gray-400'
                                }`}>
                                </div>
                                <input 
                                   type="checkbox" 
                                   name={q.id} 
                                   value={opt}
                                   checked={isSelected}
                                   onChange={() => handleSelectChange(q.id, opt, q.allowMultiple || false)}
                                   className="hidden"
                                />
                                <span className={`text-sm font-montserrat ${isSelected ? 'text-kmmr-blue dark:text-white font-bold' : 'text-gray-600 dark:text-gray-300'}`}>{opt}</span>
                             </label>
                          );
                       })}
                    </div>
                  )}

                  {q.type === 'checkbox' && (
                    <div className="flex gap-4">
                      <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${answers[q.id] === 'Так' ? 'border-kmmr-blue bg-blue-50 dark:bg-blue-900/20 text-kmmr-blue dark:text-blue-400' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-kmmr-blue/50'}`}>
                        <input 
                          type="radio" 
                          name={q.id}
                          required={q.required}
                          checked={answers[q.id] === 'Так'}
                          onChange={() => handleAnswerChange(q.id, 'Так')}
                          className="w-4 h-4 text-kmmr-blue focus:ring-kmmr-blue"
                        />
                        <span className="text-sm font-medium">Так</span>
                      </label>
                      <label className={`flex-1 flex items-center justify-center gap-2 p-3 rounded-lg border cursor-pointer transition-colors ${answers[q.id] === 'Ні' ? 'border-kmmr-pink bg-pink-50 dark:bg-pink-900/20 text-kmmr-pink dark:text-pink-400' : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:border-kmmr-pink/50'}`}>
                        <input 
                          type="radio" 
                          name={q.id}
                          required={q.required}
                          checked={answers[q.id] === 'Ні'}
                          onChange={() => handleAnswerChange(q.id, 'Ні')}
                          className="w-4 h-4 text-kmmr-pink focus:ring-kmmr-pink"
                        />
                        <span className="text-sm font-medium">Ні</span>
                      </label>
                    </div>
                  )}

                  {q.type === 'social' && (
                    <div className="flex rounded-lg shadow-sm">
                      <select 
                        value={socialState.platform}
                        onChange={(e) => handleSocialChange('platform', e.target.value)}
                        className="rounded-l-lg border border-r-0 border-gray-300 bg-gray-100 text-gray-700 py-2 px-3 focus:outline-none focus:border-kmmr-blue focus:ring-1 focus:ring-kmmr-blue text-sm font-medium transition-colors cursor-pointer hover:bg-gray-200 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
                      >
                        <option value="Instagram">Instagram</option>
                        <option value="Telegram">Telegram</option>
                        <option value="Facebook">Facebook</option>
                        <option value="TikTok">TikTok</option>
                        <option value="LinkedIn">LinkedIn</option>
                        <option value="Twitter">X (Twitter)</option>
                      </select>
                      
                      <div className="flex-grow relative">
                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                           <AtSign size={16} />
                         </div>
                         <input 
                            type="text" 
                            required={q.required}
                            value={socialState.handle}
                            onChange={(e) => handleSocialChange('handle', e.target.value)}
                            className={`${inputStyle} rounded-l-none pl-9`}
                            placeholder={q.placeholder || 'username'}
                          />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 text-red-500 dark:text-red-300 rounded-lg flex items-center gap-2 text-sm border border-red-100 dark:border-red-900">
                  <AlertCircle size={16} />
                  <span>{t('contacts.error')}</span>
                </div>
              )}

              <div>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="w-full bg-kmmr-pink hover:bg-pink-600 text-white font-bold py-3 rounded-xl uppercase tracking-wider transition-all mt-4 flex items-center justify-center gap-2 disabled:opacity-70 shadow-lg hover:shadow-xl dark:shadow-none"
                >
                  {loading ? <Loader2 size={20} className="animate-spin" /> : <>{t('application.submit')} <Send size={18} /></>}
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-3 text-center">
                  {t('contacts.consent')}
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </Modal>
  );
};