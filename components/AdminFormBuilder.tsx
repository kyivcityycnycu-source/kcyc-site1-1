import React from 'react';
import { Plus, Trash2, GripVertical, Settings } from 'lucide-react';
import { FormQuestion, FormFieldType } from '../types';

interface AdminFormBuilderProps {
  questions: FormQuestion[];
  onChange: (questions: FormQuestion[]) => void;
}

export const AdminFormBuilder: React.FC<AdminFormBuilderProps> = ({ questions, onChange }) => {
  const addQuestion = () => {
    const newId = `q_${Date.now()}`;
    onChange([...questions, { id: newId, label: '', type: 'text', required: false }]);
  };

  const updateQuestion = (index: number, updates: Partial<FormQuestion>) => {
    const newQuestions = [...questions];
    newQuestions[index] = { ...newQuestions[index], ...updates };
    onChange(newQuestions);
  };

  const removeQuestion = (index: number) => {
    const newQuestions = [...questions];
    newQuestions.splice(index, 1);
    onChange(newQuestions);
  };

  const moveQuestion = (index: number, direction: 'up' | 'down') => {
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === questions.length - 1)) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const newQuestions = [...questions];
    [newQuestions[index], newQuestions[targetIndex]] = [newQuestions[targetIndex], newQuestions[index]];
    onChange(newQuestions);
  };

  return (
    <div className="space-y-4 mt-4 bg-gray-50 dark:bg-gray-800/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-2">
        <h5 className="font-bold text-gray-700 dark:text-gray-300">Кастомні поля анкети</h5>
        <button
          type="button"
          onClick={addQuestion}
          className="flex items-center gap-1 text-sm bg-kmmr-blue text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} /> Додати поле
        </button>
      </div>

      {questions.length === 0 ? (
        <div className="text-center p-6 text-sm text-gray-500 dark:text-gray-400 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl">
          Стандартна анкета (Ім'я, Email, Телефон) буде використана за замовчуванням.
          <br /> Додайте кастомні поля, якщо потрібно більше інформації.
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((q, index) => (
            <div key={q.id} className="flex flex-col sm:flex-row gap-3 bg-white dark:bg-gray-900 p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm relative group">
              <div className="flex-grow grid grid-cols-1 sm:grid-cols-12 gap-3 items-start">
                <div className="sm:col-span-5">
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Назва поля (Запитання)</label>
                  <input
                    type="text"
                    value={q.label}
                    onChange={(e) => updateQuestion(index, { label: e.target.value })}
                    className="w-full border dark:border-gray-700 p-2 rounded bg-gray-50 dark:bg-gray-800 text-sm focus:ring-1 focus:ring-kmmr-blue outline-none"
                    placeholder="Наприклад: Чому ви хочете долучитись?"
                  />
                </div>
                
                <div className="sm:col-span-3">
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Тип поля</label>
                  <select
                    value={q.type}
                    onChange={(e) => updateQuestion(index, { type: e.target.value as FormFieldType })}
                    className="w-full border dark:border-gray-700 p-2 rounded bg-gray-50 dark:bg-gray-800 text-sm focus:ring-1 focus:ring-kmmr-blue outline-none"
                  >
                    <option value="text">Короткий текст</option>
                    <option value="textarea">Довгий текст</option>
                    <option value="social">Соцмережі (Link/Handle)</option>
                    <option value="select">Випадаючий список</option>
                    <option value="checkbox">Чекбокс (Так/Ні)</option>
                  </select>
                </div>

                <div className="sm:col-span-4 flex items-center gap-4 h-full pt-6">
                  <label className="flex items-center gap-2 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={q.required}
                      onChange={(e) => updateQuestion(index, { required: e.target.checked })}
                      className="w-4 h-4 text-kmmr-blue rounded focus:ring-kmmr-blue"
                    />
                    <span className="font-semibold text-gray-700 dark:text-gray-300">Обов'язкове</span>
                  </label>
                  {q.type === 'select' && (
                    <label className="flex items-center gap-2 cursor-pointer text-sm">
                      <input
                        type="checkbox"
                        checked={q.allowMultiple || false}
                        onChange={(e) => updateQuestion(index, { allowMultiple: e.target.checked })}
                        className="w-4 h-4 text-kmmr-blue rounded focus:ring-kmmr-blue"
                      />
                      <span className="font-semibold text-gray-700 dark:text-gray-300">Множинний вибір</span>
                    </label>
                  )}
                </div>
              </div>
              
              {/* Options for select */}
              {q.type === 'select' && (
                <div className="w-full sm:w-auto sm:col-span-12 mt-2 sm:mt-0">
                  <label className="text-xs font-bold text-gray-500 uppercase block mb-1">Опції (через кому)</label>
                  <input
                    type="text"
                    value={q.options?.join(', ') || ''}
                    onChange={(e) => updateQuestion(index, { options: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                    className="w-full border dark:border-gray-700 p-2 rounded bg-gray-50 dark:bg-gray-800 text-sm focus:ring-1 focus:ring-kmmr-blue outline-none"
                    placeholder="Опція 1, Опція 2, Опція 3"
                  />
                </div>
              )}

              <div className="flex sm:flex-col items-center justify-center gap-1 sm:border-l sm:border-gray-100 dark:sm:border-gray-800 sm:pl-3 pt-2 sm:pt-0">
                <button type="button" onClick={() => moveQuestion(index, 'up')} className="p-1 text-gray-400 hover:text-kmmr-blue rounded"><GripVertical size={16} className="rotate-90 sm:rotate-0" /></button>
                <button type="button" onClick={() => removeQuestion(index)} className="p-1 text-gray-400 hover:text-red-500 rounded"><Trash2 size={16} /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
