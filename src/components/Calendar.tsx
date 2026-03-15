import React, { useMemo } from 'react';

// Funções puras (Idealmente movidas para um arquivo dateUtils.ts)
const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => {
  const day = new Date(year, month, 1).getDay();
  // Ajuste para começar na Segunda-feira (0=Dom, 1=Seg...) -> (Seg=0, ..., Dom=6)
  return day === 0 ? 6 : day - 1; 
};

// Contrato estrito de propriedades
interface CalendarProps {
  currentYear: number;
  currentMonth: number;
  selectedDate?: Date | null;
  onSelectDate?: (date: Date) => void;
  onNavigate?: (year: number, month: number) => void;
  disablePastDates?: boolean;
  label?: string;
}

export function Calendar({ 
  currentYear, 
  currentMonth, 
  selectedDate, 
  onSelectDate,
  onNavigate,
  disablePastDates = true,
  label
}: CalendarProps) {
  
  const months = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ];

  const handlePrevMonth = () => {
    let newMonth = currentMonth - 1;
    let newYear = currentYear;
    if (newMonth < 0) {
      newMonth = 11;
      newYear--;
    }
    onNavigate?.(newYear, newMonth);
  };

  const handleNextMonth = () => {
    let newMonth = currentMonth + 1;
    let newYear = currentYear;
    if (newMonth > 11) {
      newMonth = 0;
      newYear++;
    }
    onNavigate?.(newYear, newMonth);
  };
  // 1. Memoização: Arrays só são recriados se o usuário trocar de mês/ano
  const { blanks, days } = useMemo(() => {
    const totalDays = getDaysInMonth(currentYear, currentMonth);
    const startingBlankDays = getFirstDayOfMonth(currentYear, currentMonth);
    
    return {
      blanks: Array.from({ length: startingBlankDays }, (_, i) => i),
      days: Array.from({ length: totalDays }, (_, i) => i + 1)
    };
  }, [currentYear, currentMonth]);

  // Memoização do dia atual (zerando horas) para comparação de bloqueio
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  return (
    <div className="w-full bg-[#121214]/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-fade-in overflow-hidden">
      
      {/* Cabeçalho de Navegação */}
      <div className="flex items-center justify-between mb-6 px-1">
        <button 
          type="button"
          onClick={handlePrevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          <span className="material-symbols-outlined text-lg">chevron_left</span>
        </button>
        
        <div className="text-center">
          {label && <p className="text-[9px] uppercase tracking-widest text-primary font-bold mb-1">{label}</p>}
          <h3 className="text-white font-bold text-sm tracking-wide">
            {months[currentMonth]} <span className="text-white/40">{currentYear}</span>
          </h3>
        </div>

        <button 
          type="button"
          onClick={handleNextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>

      {/* Cabeçalho de dias escondido de leitores de tela para evitar ruído */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center text-slate-400 text-[10px] sm:text-xs font-bold uppercase tracking-widest" aria-hidden="true">
        {weekDays.map(day => <div key={day} className="py-2">{day}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1 text-center" role="grid">
        
        {/* Células de offset silenciadas */}
        {blanks.map((blank) => (
          <div key={`blank-${blank}`} className="p-2 aspect-square" aria-hidden="true"></div>
        ))}

        {days.map((day) => {
          const dateObj = new Date(currentYear, currentMonth, day);
          const isPast = disablePastDates && dateObj < today;
          // Verifica se este botão corresponde à data selecionada no estado global
          const isSelected = selectedDate ? (
            selectedDate.getFullYear() === dateObj.getFullYear() &&
            selectedDate.getMonth() === dateObj.getMonth() &&
            selectedDate.getDate() === dateObj.getDate()
          ) : false;

          return (
            <button
              key={`day-${day}`}
              type="button"
              onClick={() => !isPast && onSelectDate?.(dateObj)}
              disabled={isPast}
              aria-label={`Dia ${day}`}
              aria-pressed={isSelected ? "true" : "false"}
              className={`
                p-2 aspect-square flex items-center justify-center rounded-md text-sm font-bold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50
                ${isPast 
                  ? 'text-slate-700 cursor-not-allowed bg-transparent opacity-30 font-light' // Estilo de bloqueio visual
                  : isSelected
                    ? 'bg-primary text-black shadow-lg shadow-primary/20 scale-105' // Estilo de conversão/ativo
                    : 'text-slate-200 hover:bg-white/[0.08] hover:text-white' // Estilo de interação padrão
                }
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
