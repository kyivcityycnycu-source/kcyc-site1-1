import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Send, GraduationCap, User, Mail, Phone, Building2, BookOpen, MessageSquare, CheckCircle, Instagram } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useLanguage } from '../context/LanguageContext';

interface InternshipModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InternshipModal: React.FC<InternshipModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();

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

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    socialTag: '',
    university: '',
    specialization: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'submissions'), {
        ...formData,
        formType: 'internship_registration',
        status: 'new',
        createdAt: serverTimestamp()
      });
      setIsSuccess(true);
      setTimeout(() => {
        setIsSuccess(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          socialTag: '',
          university: '',
          specialization: '',
          message: ''
        });
        onClose();
      }, 3000);
    } catch (error) {
      console.error('Error submitting internship registration:', error);
      alert(language === 'uk' ? 'Помилка при відправці. Спробуйте пізніше.' : 'Error submitting. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] overflow-y-auto bg-black/70 backdrop-blur-md overscroll-behavior-y-contain">
      <div className="flex min-h-full items-start sm:items-center justify-center p-4 sm:p-6 md:p-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white dark:bg-gray-900 rounded-[2.5rem] w-full max-w-5xl overflow-hidden shadow-2xl relative my-8"
        >
          <button 
            onClick={onClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 hover:text-kmmr-pink dark:hover:text-kmmr-pink transition-colors z-10"
          >
            <X size={24} />
          </button>

          <div className="p-8 md:p-10 pb-4 md:pb-5">
            <div className="text-center mb-10">
              <div className="w-20 h-20 bg-kmmr-blue/10 dark:bg-blue-500/30 rounded-3xl flex items-center justify-center mx-auto mb-4">
                <GraduationCap className="text-kmmr-blue dark:text-blue-400 w-10 h-10" />
              </div>
              <h3 className="text-3xl font-black text-kmmr-blue dark:text-white uppercase tracking-tight">
                {language === 'uk' ? 'База практики' : 'Internship Base'}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">
                {language === 'uk' ? 'Долучайтеся до нашої команди як інтерн' : 'Join our team as an intern'}
              </p>
            </div>

          <AnimatePresence mode="wait">
            {isSuccess ? (
              <motion.div 
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="text-green-500 w-12 h-12" />
                </div>
                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {language === 'uk' ? 'Дякуємо за заявку!' : 'Thank you for your application!'}
                </h4>
                <p className="text-gray-600 dark:text-gray-400">
                  {language === 'uk' ? 'Ми зв\'яжемося з вами найближчим часом.' : 'We will contact you shortly.'}
                </p>
              </motion.div>
            ) : (
              <motion.form 
                key="form"
                onSubmit={handleSubmit}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="relative">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                      {language === 'uk' ? 'ПІБ' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-blue-400/70" size={18} />
                      <input
                        required
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder={language === 'uk' ? 'Іван Іванов' : 'John Doe'}
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-kmmr-blue dark:focus:border-blue-500/50 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 dark:text-white transition-all outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                      Email
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-blue-400/70" size={18} />
                      <input
                        required
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="example@mail.com"
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-kmmr-blue dark:focus:border-blue-500/50 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 dark:text-white transition-all outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                      {language === 'uk' ? 'Телефон' : 'Phone'}
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-blue-400/70" size={18} />
                      <input
                        required
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+380..."
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-kmmr-blue dark:focus:border-blue-500/50 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 dark:text-white transition-all outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                      {language === 'uk' ? 'Telegram / Instagram' : 'Telegram / Instagram'}
                    </label>
                    <div className="relative">
                      <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-blue-400/70" size={18} />
                      <input
                        required
                        type="text"
                        name="socialTag"
                        value={formData.socialTag}
                        onChange={handleChange}
                        placeholder="@username"
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-kmmr-blue dark:focus:border-blue-500/50 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 dark:text-white transition-all outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="relative md:col-span-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                      {language === 'uk' ? 'Спеціальність' : 'Specialization'}
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-blue-400/70" size={18} />
                      <input
                        required
                        type="text"
                        name="specialization"
                        value={formData.specialization}
                        onChange={handleChange}
                        placeholder={language === 'uk' ? 'Журналістика, PR...' : 'Journalism, PR...'}
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-kmmr-blue dark:focus:border-blue-500/50 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 dark:text-white transition-all outline-none font-medium"
                      />
                    </div>
                  </div>

                  <div className="relative md:col-span-2">
                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                      {language === 'uk' ? 'Університет' : 'University'}
                    </label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 dark:text-blue-400/70" size={18} />
                      <input
                        required
                        type="text"
                        name="university"
                        value={formData.university}
                        onChange={handleChange}
                        placeholder={language === 'uk' ? 'Назва ВНЗ' : 'University name'}
                        className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-kmmr-blue dark:focus:border-blue-500/50 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 dark:text-white transition-all outline-none font-medium"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2 ml-1">
                    {language === 'uk' ? 'Повідомлення (опціонально)' : 'Message (optional)'}
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 text-gray-400 dark:text-blue-400/70" size={18} />
                    <textarea
                      name="message"
                      value={formData.message}
                      onChange={handleChange}
                      rows={3}
                      placeholder={language === 'uk' ? 'Розкажіть трохи про себе...' : 'Tell us a bit about yourself...'}
                      className="w-full bg-gray-50 dark:bg-gray-800/50 border-2 border-transparent focus:border-kmmr-blue dark:focus:border-blue-500/50 rounded-2xl py-3.5 pl-12 pr-4 text-gray-900 dark:text-white transition-all outline-none font-medium resize-none"
                    />
                  </div>
                </div>

                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="w-full bg-kmmr-blue hover:bg-kmmr-blue/90 text-white font-black py-4 rounded-2xl shadow-xl shadow-kmmr-blue/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-widest text-sm disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="animate-pulse">{language === 'uk' ? 'Відправка...' : 'Sending...'}</span>
                  ) : (
                    <>
                      <span>{language === 'uk' ? 'Відправити заявку' : 'Submit Application'}</span>
                      <Send size={18} />
                    </>
                  )}
                </button>

                <p className="text-xs md:text-sm text-gray-400 dark:text-gray-500 text-center mt-4 px-4 leading-relaxed font-medium">
                  {language === 'uk' 
                    ? 'Натискаючи кнопку "Відправити заявку", ви даєте згоду на обробку персональних даних.' 
                    : 'By clicking "Submit Application", you consent to the processing of personal data.'}
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/80 p-6 text-center border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            {language === 'uk' ? 'Ми переглянемо вашу анкету протягом 2-3 робочих днів.' : 'We will review your application within 2-3 business days.'}
          </p>
        </div>
      </motion.div>
    </div>
  </div>,
  document.body);
};
