import React from 'react';
import { Plus, Trash2, GripVertical, Settings, X, Circle, ChevronUp, ChevronDown } from 'lucide-react';
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

  const addOption = (qIndex: number) => {
    const q = questions[qIndex];
    const options = q.options ? [...q.options, `Варіант ${q.options.length + 1}`] : ['Варіант 1'];
    updateQuestion(qIndex, { options });
  };

  const updateOption = (qIndex: number, optIndex: number, value: string) => {
    const q = questions[qIndex];
    if (!q.options) return;
    const options = [...q.options];
    options[optIndex] = value;
    updateQuestion(qIndex, { options });
  };

  const removeOption = (qIndex: number, optIndex: number) => {
    const q = questions[qIndex];
    if (!q.options) return;
    const options = [...q.options];
    options.splice(optIndex, 1);
    updateQuestion(qIndex, { options });
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
        <div className="space-y-4">
          {questions.map((q, index) => (
            <div key={q.id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden flex flex-col group">
              {/* Drag Handle & Quick Actions bar */}
              <div className="bg-gray-50/50 dark:bg-gray-800/30 px-4 py-1.5 flex items-center justify-between border-b border-gray-100 dark:border-gray-700/50">
                <div className="flex items-center gap-2">
                  <GripVertical size={14} className="text-gray-400 rotate-90" />
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{index + 1}. ПИТАННЯ</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    type="button" 
                    onClick={() => moveQuestion(index, 'up')} 
                    disabled={index === 0}
                    className="p-1 text-gray-400 hover:text-kmmr-blue disabled:opacity-20 transition-colors"
                    title="Перемістити вгору"
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button 
                    type="button" 
                    onClick={() => moveQuestion(index, 'down')} 
                    disabled={index === questions.length - 1}
                    className="p-1 text-gray-400 hover:text-kmmr-blue disabled:opacity-20 transition-colors"
                    title="Перемістити вниз"
                  >
                    <ChevronDown size={16} />
                  </button>
                  <div className="w-px h-3 bg-gray-200 dark:bg-gray-700 mx-1" />
                  <button 
                    type="button" 
                    onClick={() => removeQuestion(index)} 
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                    title="Видалити"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="p-4 flex flex-col lg:flex-row gap-6 lg:gap-8">
                {/* Left Side: Basic Info (Flexible width, expands to fill space) */}
                <div className="flex-grow space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                    <div className="md:col-span-8">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Назва поля (Запитання)</label>
                      <input
                        type="text"
                        value={q.label}
                        onChange={(e) => updateQuestion(index, { label: e.target.value })}
                        className="w-full border dark:border-gray-700 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-sm font-medium focus:ring-1 focus:ring-kmmr-blue outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        placeholder="Наприклад: Чому ви хочете долучитись?"
                      />
                    </div>
                    <div className="md:col-span-4">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Тип поля</label>
                      <div className="relative">
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion(index, { type: e.target.value as FormFieldType })}
                          className="w-full border dark:border-gray-700 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-sm font-semibold focus:ring-1 focus:ring-kmmr-blue outline-none appearance-none cursor-pointer pr-10"
                        >
                          <option value="text">Короткий текст</option>
                          <option value="textarea">Довгий текст</option>
                          <option value="social">Соцмережі (Link/Handle)</option>
                          <option value="select">Випадаючий список</option>
                          <option value="checkbox">Чекбокс (Так/Ні)</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                      </div>
                    </div>
                  </div>

                  {(q.type === 'text' || q.type === 'textarea' || q.type === 'social') && (
                    <div className="animate-fade-in group/field">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 ml-1">Текст-підказка (Placeholder)</label>
                      <input
                        type="text"
                        value={q.placeholder || ''}
                        onChange={(e) => updateQuestion(index, { placeholder: e.target.value })}
                        className="w-full border dark:border-gray-700 p-3 rounded-xl bg-gray-50/50 dark:bg-gray-800/50 text-sm focus:ring-1 focus:ring-kmmr-blue outline-none italic transition-all placeholder:text-gray-300 dark:placeholder:text-gray-600"
                        placeholder="Опишіть, що саме очікуєте в цьому полі..."
                      />
                    </div>
                  )}

                  {/* Options for select */}
                  {q.type === 'select' && (
                    <div className="animate-fade-in pt-2 bg-gray-50/30 dark:bg-gray-800/20 p-4 rounded-xl border border-gray-100 dark:border-gray-800">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4 ml-1">Варіанти відповіді</label>
                      <div className="space-y-2 ml-1 max-w-2xl">
                        {(q.options || []).map((opt, optIdx) => (
                          <div key={optIdx} className="flex items-center gap-3 group/opt">
                            <div className="w-5 h-5 rounded-full border-2 border-gray-200 dark:border-gray-700 flex-shrink-0 flex items-center justify-center">
                              <div className="w-2.5 h-2.5 rounded-full bg-transparent group-hover/opt:bg-gray-100 dark:group-hover/opt:bg-gray-800 transition-colors" />
                            </div>
                            <input
                              type="text"
                              value={opt}
                              onChange={(e) => updateOption(index, optIdx, e.target.value)}
                              className="flex-grow border-b border-transparent hover:border-gray-200 dark:hover:border-gray-700 focus:border-kmmr-blue p-1.5 bg-transparent text-sm outline-none transition-all placeholder:text-gray-300 dark:placeholder:text-gray-700"
                              placeholder={`Варіант ${optIdx + 1}`}
                            />
                            <button 
                              type="button" 
                              onClick={() => removeOption(index, optIdx)}
                              className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover/opt:opacity-100 transition-opacity"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        ))}
                        
                        <button
                          type="button"
                          onClick={() => addOption(index)}
                          className="flex items-center gap-3 text-[10px] text-gray-400 hover:text-kmmr-blue font-black pl-1.5 py-2 transition-colors group/add uppercase tracking-widest"
                        >
                          <div className="w-5 h-5 rounded-full border-2 border-dashed border-gray-200 dark:border-gray-700 flex items-center justify-center group-hover/add:border-kmmr-blue transition-colors">
                            <Plus size={8} />
                          </div>
                          <span>Додати варіант</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Right Side: Settings (Fixed width for all questions) */}
                <div className="w-full lg:w-64 flex-shrink-0 border-t lg:border-t-0 lg:border-l border-gray-100 dark:border-gray-800 pt-5 lg:pt-0 lg:pl-8">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-4">Параметри поля</label>
                  
                  <div className="space-y-5">
                    <label className="flex items-center gap-3 cursor-pointer group/check">
                      <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${q.required ? 'bg-kmmr-blue border-kmmr-blue shadow-md shadow-blue-500/20' : 'border-gray-200 dark:border-gray-700 group-hover/check:border-kmmr-blue'}`}>
                        <input
                          type="checkbox"
                          checked={q.required}
                          onChange={(e) => updateQuestion(index, { required: e.target.checked })}
                          className="hidden"
                        />
                        {q.required && <Plus size={12} className="text-white rotate-45" />}
                      </div>
                      <span className="text-sm font-bold text-gray-600 dark:text-gray-300 select-none">Обов'язкове</span>
                    </label>

                    {q.type === 'select' && (
                      <label className="flex items-center gap-3 cursor-pointer group/check animate-fade-in">
                        <div className={`w-5 h-5 rounded-lg border-2 flex items-center justify-center transition-all ${q.allowMultiple ? 'bg-kmmr-pink border-kmmr-pink shadow-md shadow-pink-500/20' : 'border-gray-200 dark:border-gray-700 group-hover/check:border-kmmr-pink'}`}>
                          <input
                            type="checkbox"
                            checked={q.allowMultiple || false}
                            onChange={(e) => updateQuestion(index, { allowMultiple: e.target.checked })}
                            className="hidden"
                          />
                          {q.allowMultiple && <Plus size={12} className="text-white rotate-45" />}
                        </div>
                        <span className="text-sm font-bold text-gray-600 dark:text-gray-300 select-none">Множинний вибір</span>
                      </label>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
