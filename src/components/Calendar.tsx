import React, { useMemo } from 'react';

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => {
  const day = new Date(year, month, 1).getDay();
  // Ajuste para começar na Segunda-feira (0=Dom, 1=Seg...) -> (Seg=0, ..., Dom=6)
  return day === 0 ? 6 : day - 1; 
};

interface CalendarProps {
  currentYear: number;
  currentMonth: number;
  startDate?: Date | null;
  endDate?: Date | null;
  onSelectDate?: (date: Date) => void;
  onNavigate?: (year: number, month: number) => void;
  disablePastDates?: boolean;
  isDateDisabled?: (date: Date) => boolean; // Nova prop para regras de negócio (ex: Domingos)
  label?: string;
}

export function Calendar({ 
  currentYear, 
  currentMonth, 
  startDate, 
  endDate,
  onSelectDate,
  onNavigate,
  disablePastDates = true,
  isDateDisabled,
  label
}: CalendarProps) {
  
  const months = [
    "Janeiro","Fevereiro","Março","Abril","Maio","Junho",
    "Julho","Agosto","Setembro","Outubro","Novembro","Dezembro"
  ];
  const weekDays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];

  const { blanks, days } = useMemo(() => {
    const totalDays = getDaysInMonth(currentYear, currentMonth);
    const startingBlankDays = getFirstDayOfMonth(currentYear, currentMonth);
    
    return {
      blanks: Array.from({ length: startingBlankDays }, (_, i) => i),
      days: Array.from({ length: totalDays }, (_, i) => i + 1)
    };
  }, [currentYear, currentMonth]);

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);

  // Normaliza as datas de start/end para comparar de forma segura (sem horas)
  const normStart = useMemo(() => startDate ? new Date(startDate).setHours(0,0,0,0) : null, [startDate]);
  const normEnd = useMemo(() => endDate ? new Date(endDate).setHours(0,0,0,0) : null, [endDate]);

  return (
    <div className="w-full bg-[#121214]/95 backdrop-blur-3xl border border-white/10 rounded-2xl p-4 shadow-2xl animate-fade-in overflow-hidden">
      
      {/* Cabeçalho de Navegação */}
      <div className="flex items-center justify-between mb-6 px-1">
        <button 
          type="button"
          onClick={() => onNavigate?.(currentMonth === 0 ? currentYear - 1 : currentYear, currentMonth === 0 ? 11 : currentMonth - 1)}
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
          onClick={() => onNavigate?.(currentMonth === 11 ? currentYear + 1 : currentYear, currentMonth === 11 ? 0 : currentMonth + 1)}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"
        >
          <span className="material-symbols-outlined text-lg">chevron_right</span>
        </button>
      </div>

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
          const time = dateObj.getTime();
          
          const isPast = disablePastDates && time < today.getTime();
          const isBusinessDisabled = isDateDisabled ? isDateDisabled(dateObj) : false;
          const isDisabled = isPast || isBusinessDisabled;
          
          const isStart = normStart === time;
          const isEnd = normEnd === time;
          const isBetween = normStart && normEnd && time > normStart && time < normEnd;

          return (
            <button
              key={`day-${day}`}
              type="button"
              onClick={() => !isDisabled && onSelectDate?.(dateObj)}
              disabled={isDisabled}
              aria-label={`Dia ${day}`}
              aria-pressed={(isStart || isEnd) ? "true" : "false"}
              className={`
                p-2 aspect-square flex items-center justify-center text-sm transition-all duration-200 focus:outline-none relative
                ${isDisabled 
                  ? 'text-slate-700 cursor-not-allowed opacity-30 font-light' 
                  : 'font-bold cursor-pointer'
                }
                ${!isDisabled && !isStart && !isEnd && !isBetween ? 'text-slate-200 hover:bg-white/[0.08] hover:text-white rounded-md' : ''}
                ${(isStart || isEnd) 
                  ? 'bg-primary text-black rounded-md shadow-lg shadow-primary/20 scale-105 z-10' 
                  : ''
                }
                ${isBetween ? 'bg-primary/10 text-primary rounded-none' : ''}
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
