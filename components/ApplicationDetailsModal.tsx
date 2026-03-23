import React from 'react';
import { X, User, Phone, Mail, MessageSquare } from 'lucide-react';
import { Modal } from './ui/Modal';

interface ApplicationDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  application: any;
}

export const ApplicationDetailsModal: React.FC<ApplicationDetailsModalProps> = ({ isOpen, onClose, application }) => {
  if (!application) return null;

  const fieldLabels: Record<string, string> = {
    orgName: 'Назва організації',
    orgSocial: 'Соцмережі організації',
    eventStartDate: 'Дата початку',
    eventEndDate: 'Дата завершення',
    description: 'Опис ініціативи',
    supportType: 'Тип підтримки',
    department: 'Департамент',
    motivation: 'Мотивація',
    socialLink: 'Посилання на соцмережі',
    commTag: 'Тег для зв\'язку',
    repName: 'ПІБ представника',
    projectTitle: 'Назва проєкту',
  };

  const getMainDetails = () => {
    if (application.formType === 'initiative_support') {
      return {
        displayName: application.repName || application.name || 'Не вказано',
        displayEmail: application.email,
        displayPhone: application.phone,
        displaySocial: application.commTag || application.socialTag || application.orgSocial,
        displayTitle: application.projectTitle || 'Підтримка ініціативи'
      };
    }
    return {
      displayName: application.name || 'Не вказано',
      displayEmail: application.email,
      displayPhone: application.phone,
      displaySocial: application.socialTag,
      displayTitle: application.opportunityTitle || (application.formType === 'general_contact' ? 'Загальний запит' : 'Заявка')
    };
  };

  const { displayName, displayEmail, displayPhone, displaySocial, displayTitle } = getMainDetails();

  const getExtraDetails = () => {
    const extra: [string, any][] = [];
    const skipKeys = ['id', 'name', 'email', 'phone', 'socialTag', 'opportunityTitle', 'opportunityId', 'type', 'formType', 'status', 'createdAt', 'repName', 'commTag', 'projectTitle', 'answers'];
    
    Object.entries(application).forEach(([key, value]) => {
      if (!skipKeys.includes(key) && value) {
        extra.push([fieldLabels[key] || key, value]);
      }
    });

    if (application.answers) {
      Object.entries(application.answers).forEach(([key, value]) => {
        extra.push([key, value]);
      });
    }

    return extra;
  };

  const extraDetails = getExtraDetails();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-white dark:bg-gray-800 w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl transform transition-all">
        {/* Header */}
        <div className="bg-gray-900 p-6 flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white font-montserrat">Деталі Заявки</h3>
            <p className="text-kmmr-pink text-sm font-bold mt-1 uppercase tracking-wider">{displayTitle}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-8">
          {/* User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-kmmr-blue dark:text-blue-400 flex-shrink-0">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Ім'я / Представник</p>
                    <p className="text-gray-900 dark:text-white font-bold font-montserrat">{displayName}</p>
                  </div>
               </div>
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-kmmr-blue dark:text-blue-400 flex-shrink-0">
                    <Mail size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Email</p>
                    <p className="text-gray-900 dark:text-white font-bold font-montserrat">{displayEmail}</p>
                  </div>
               </div>
            </div>
             <div className="space-y-4">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-kmmr-blue dark:text-blue-400 flex-shrink-0">
                    <Phone size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Телефон</p>
                    <p className="text-gray-900 dark:text-white font-bold font-montserrat">{displayPhone}</p>
                  </div>
               </div>
               {displaySocial && (
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-kmmr-blue dark:text-blue-400 flex-shrink-0">
                      <MessageSquare size={20} />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold">Соціальні мережі / Тег</p>
                      <p className="text-gray-900 dark:text-white font-bold font-montserrat">{displaySocial}</p>
                    </div>
                 </div>
               )}
            </div>
          </div>

          {/* Answers / Extra Details */}
          {extraDetails.length > 0 && (
            <div className="border-t border-gray-100 dark:border-gray-700 pt-6">
              <h4 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2 font-montserrat">
                <MessageSquare size={20} className="text-kmmr-pink" />
                Додаткова інформація
              </h4>
              <div className="space-y-4 bg-gray-50 dark:bg-gray-700/50 p-6 rounded-xl">
                {extraDetails.map(([key, value]) => (
                  <div key={key} className="pb-4 border-b border-gray-200 dark:border-gray-600 last:border-0 last:pb-0">
                    <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase mb-1">{key}</p>
                    <p className="text-gray-800 dark:text-gray-200 font-medium whitespace-pre-wrap">{String(value)}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-gray-50 dark:bg-gray-900 p-4 flex justify-end">
           <button 
             onClick={onClose}
             className="px-6 py-2 bg-kmmr-pink text-white font-bold rounded-lg hover:bg-pink-600 transition-colors font-montserrat"
           >
             Закрити
           </button>
        </div>
      </div>
    </Modal>
  );
};
