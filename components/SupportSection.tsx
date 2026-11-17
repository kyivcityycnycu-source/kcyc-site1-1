
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Send, Loader2, CheckCircle, AlertCircle, Handshake } from 'lucide-react';
import { submitSupportForm, SupportFormData, isFormSpamError } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { HoneypotField } from './ui/HoneypotField';
import { FIELD_MAX, ensureUaPhonePrefix, isValidEmail, isValidPhone, sanitizeFormValue } from '../lib/validation';
import { ui } from '../lib/uiClasses';
import { trackFormSubmit } from '../services/analytics';

export const SupportSection: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<SupportFormData>({
    orgName: '',
    repName: '',
    phone: '',
    email: '',
    commTag: '',
    orgSocial: '',
    eventStartDate: '',
    eventEndDate: '',
    projectTitle: '',
    description: '',
    supportType: ''
  });
  const [honeypot, setHoneypot] = useState('');
  const openedAt = useRef(Date.now());

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; phone?: string }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const nextFields: { email?: string; phone?: string } = {};
    if (!isValidEmail(formData.email)) nextFields.email = t('contacts.invalidEmail');
    if (!isValidPhone(formData.phone)) nextFields.phone = t('contacts.invalidPhone');
    setFieldErrors(nextFields);
    if (Object.keys(nextFields).length > 0) {
      trackFormSubmit('support_initiative', 'validation_error');
      return;
    }

    setStatus('loading');

    try {
      await submitSupportForm(formData, { honeypot, openedAt: openedAt.current });
      setStatus('success');
      trackFormSubmit('support_initiative', 'success');
      setFormData({ 
        orgName: '', repName: '', phone: '', email: '', commTag: '', orgSocial: '', eventStartDate: '', eventEndDate: '',
        projectTitle: '', description: '', supportType: '' 
      });
      setFieldErrors({});
      setHoneypot('');
      openedAt.current = Date.now();
      
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      trackFormSubmit('support_initiative', 'error');
      if (isFormSpamError(error) && error.code === 'rate_limit') {
        setErrorMessage(t('contacts.rateLimit'));
      } else if (isFormSpamError(error) && error.code === 'too_fast') {
        setErrorMessage(t('contacts.tooFast'));
      } else {
        setErrorMessage(t('contacts.error'));
      }
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: sanitizeFormValue(name, value) });
    if (name === 'email' || name === 'phone') {
      setFieldErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const supportOptions = [
    { value: 'info', label: t('support.options.info') },
    { value: 'resource', label: t('support.options.resource') },
    { value: 'partnership', label: t('support.options.partnership') },
    { value: 'volunteers', label: t('support.options.volunteers') },
    { value: 'mentor', label: t('support.options.mentor') },
    { value: 'other', label: t('support.options.other') },
  ];

  return (
    <div className="py-24 bg-gray-50 dark:bg-[#0B1221] text-gray-900 dark:text-white relative overflow-hidden flex items-center justify-center transition-colors duration-300">
       {/* Background decorative circles */}
       <div className="absolute top-0 right-0 w-96 h-96 bg-kmmr-blue/40 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/3"></div>
       <div className="absolute bottom-0 left-0 w-96 h-96 bg-kmmr-purple/30 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/3"></div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-6">
             <div className="p-4 bg-white dark:bg-[#1E293B] rounded-2xl border border-gray-200 dark:border-white/5 shadow-lg shadow-kmmr-green/10 transition-colors">
                <Handshake size={40} className="text-kmmr-green"/>
             </div>
          </div>
          <h2 className="text-3xl md:text-5xl font-black mb-6">{t('support.title')}</h2>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto text-sm md:text-base leading-relaxed">{t('support.subtitle')}</p>
        </div>

        <div className="bg-white dark:bg-[#131C2F] rounded-3xl border border-gray-200 dark:border-white/5 shadow-2xl overflow-hidden p-1 transition-colors">
          {status === 'success' ? (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in-up">
              <div className="w-20 h-20 bg-kmmr-green rounded-full flex items-center justify-center mb-6 shadow-lg shadow-kmmr-green/20">
                <CheckCircle size={40} className="text-white" />
              </div>
              <h3 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">{t('support.successTitle')}</h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md">
                {t('support.successDesc')}
              </p>
              <button 
                onClick={() => setStatus('idle')}
                className="mt-8 bg-gray-100 dark:bg-[#1E293B] text-gray-900 dark:text-white border border-gray-200 dark:border-white/10 px-8 py-3 rounded-surface font-bold hover:bg-gray-200 dark:hover:bg-white/5 transition-all"
              >
                {t('contacts.retryBtn')}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="p-6 md:p-10 space-y-6 relative">
              <HoneypotField value={honeypot} onChange={setHoneypot} />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">{t('support.labels.orgName')}</label>
                  <input 
                    type="text" 
                    name="orgName"
                    value={formData.orgName}
                    onChange={handleChange}
                    required
                    maxLength={FIELD_MAX.shortText}
                    disabled={status === 'loading'}
                    className="w-full bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-surface px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-kmmr-green/50 focus:ring-1 focus:ring-kmmr-green/50 transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    placeholder={t('support.placeholders.orgName')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">{t('support.labels.repName')}</label>
                  <input 
                    type="text" 
                    name="repName"
                    value={formData.repName}
                    onChange={handleChange}
                    required
                    maxLength={FIELD_MAX.name}
                    autoComplete="name"
                    disabled={status === 'loading'}
                    className="w-full bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-surface px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-kmmr-green/50 focus:ring-1 focus:ring-kmmr-green/50 transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    placeholder={t('support.placeholders.repName')}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">{t('contacts.labels.email')}</label>
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    maxLength={FIELD_MAX.email}
                    autoComplete="email"
                    aria-invalid={!!fieldErrors.email}
                    disabled={status === 'loading'}
                    className={`w-full bg-gray-50 dark:bg-[#1E293B] border rounded-surface px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-1 transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm ${fieldErrors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-400/40' : 'border-gray-200 dark:border-white/10 focus:border-kmmr-green/50 focus:ring-kmmr-green/50'}`}
                    placeholder="email@example.com"
                  />
                  {fieldErrors.email && <p className="text-xs text-red-500 ml-1">{fieldErrors.email}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">{t('contacts.labels.phone')}</label>
                  <input 
                    type="tel" 
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onFocus={() => {
                      if (!formData.phone.trim()) {
                        setFormData((prev) => ({ ...prev, phone: ensureUaPhonePrefix('') }));
                      }
                    }}
                    required
                    inputMode="tel"
                    autoComplete="tel"
                    maxLength={FIELD_MAX.phoneDisplay}
                    aria-invalid={!!fieldErrors.phone}
                    disabled={status === 'loading'}
                    className={`w-full bg-gray-50 dark:bg-[#1E293B] border rounded-surface px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:ring-1 transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm ${fieldErrors.phone ? 'border-red-400 focus:border-red-400 focus:ring-red-400/40' : 'border-gray-200 dark:border-white/10 focus:border-kmmr-green/50 focus:ring-kmmr-green/50'}`}
                    placeholder={t('contacts.phonePlaceholder')}
                  />
                  {fieldErrors.phone && <p className="text-xs text-red-500 ml-1">{fieldErrors.phone}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Тег Telegram або Instagram для комунікації</label>
                  <input 
                    type="text" 
                    name="commTag"
                    value={formData.commTag}
                    onChange={handleChange}
                    maxLength={FIELD_MAX.social}
                    disabled={status === 'loading'}
                    className="w-full bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-surface px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-kmmr-green/50 focus:ring-1 focus:ring-kmmr-green/50 transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    placeholder="@username"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Посилання на соцмережі організації</label>
                  <input 
                    type="text" 
                    name="orgSocial"
                    value={formData.orgSocial}
                    onChange={handleChange}
                    maxLength={FIELD_MAX.url}
                    disabled={status === 'loading'}
                    className="w-full bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-surface px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-kmmr-green/50 focus:ring-1 focus:ring-kmmr-green/50 transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    placeholder="https://instagram.com/..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Дата початку події</label>
                  <input 
                    type="date" 
                    name="eventStartDate"
                    value={formData.eventStartDate}
                    onChange={handleChange}
                    disabled={status === 'loading'}
                    className="w-full bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-surface px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-kmmr-green/50 focus:ring-1 focus:ring-kmmr-green/50 transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">Дата завершення події</label>
                  <input 
                    type="date" 
                    name="eventEndDate"
                    value={formData.eventEndDate}
                    onChange={handleChange}
                    disabled={status === 'loading'}
                    className="w-full bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-surface px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-kmmr-green/50 focus:ring-1 focus:ring-kmmr-green/50 transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">{t('support.labels.projectTitle')}</label>
                  <input 
                    type="text"
                    name="projectTitle"
                    value={formData.projectTitle}
                    onChange={handleChange}
                    required
                    maxLength={FIELD_MAX.shortText}
                    disabled={status === 'loading'}
                    className="w-full bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-surface px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-kmmr-green/50 focus:ring-1 focus:ring-kmmr-green/50 transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm"
                    placeholder={t('support.placeholders.projectTitle')}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">{t('support.labels.supportType')}</label>
                  <div className="relative">
                    <select
                      name="supportType"
                      value={formData.supportType}
                      onChange={handleChange}
                      required
                      disabled={status === 'loading'}
                      className="w-full bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-surface px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-kmmr-green/50 focus:ring-1 focus:ring-kmmr-green/50 transition-all appearance-none cursor-pointer text-sm"
                    >
                      <option value="" className="text-gray-500 bg-white dark:bg-[#1E293B]">{t('support.placeholders.supportType')}</option>
                      {supportOptions.map(option => (
                        <option key={option.value} value={option.label} className="bg-white dark:bg-[#1E293B] text-gray-900 dark:text-white py-2">
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-gray-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" fillRule="evenodd"></path></svg>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 ml-1">{t('support.labels.description')}</label>
                <textarea 
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  required
                  maxLength={FIELD_MAX.longText}
                  disabled={status === 'loading'}
                  className="w-full bg-gray-50 dark:bg-[#1E293B] border border-gray-200 dark:border-white/10 rounded-surface px-5 py-4 text-gray-900 dark:text-white focus:outline-none focus:border-kmmr-green/50 focus:ring-1 focus:ring-kmmr-green/50 transition-all placeholder-gray-400 dark:placeholder-gray-500 text-sm resize-none"
                  placeholder={t('support.placeholders.description')}
                ></textarea>
              </div>

              {status === 'error' && (
                <div className="p-4 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/50 rounded-surface flex items-center gap-3 text-red-600 dark:text-red-400">
                  <AlertCircle size={20} />
                  <span>{errorMessage || t('contacts.error')}</span>
                </div>
              )}

              <div className="pt-4">
                <button 
                  type="submit"
                  disabled={status === 'loading'}
                  className={`w-full bg-kmmr-green text-white font-bold py-4 ${ui.btnPill} uppercase tracking-widest transition-all hover:bg-green-600 active:scale-[0.99] flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-kmmr-green/20`}
                >
                  {status === 'loading' ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      {t('contacts.loading')}
                    </>
                  ) : (
                    <>
                      {t('contacts.submit')} <Send size={18} className="ml-1" />
                    </>
                  )}
                </button>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-4 text-center">
                  {t('contacts.consent')}{' '}
                  <Link to="/privacy" className="text-kmmr-pink underline underline-offset-2 font-semibold">
                    {t('contacts.privacyLink')}
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
