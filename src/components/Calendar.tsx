import React, { useMemo, useState } from 'react';

type ISODate = string; // "YYYY-MM-DD"

interface CalendarProps {
  initialMonth?: Date; // mês inicial mostrado
  weekStartsOn?: 0 | 1; // 0 = Sunday, 1 = Monday (padrão 1)
  selectedStart?: ISODate | null;
  selectedEnd?: ISODate | null;
  minDays?: number; // opcional (validação externa)
  closeOnSelect?: boolean;
  onRangeSelect?: (start: ISODate, end: ISODate) => void;
}

const pad2 = (n:number) => String(n).padStart(2,'0');
const toISO = (d: Date) => `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;

function dateOnly(d: Date){ return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }

export default function Calendar({
  initialMonth = new Date(),
  weekStartsOn = 1,
  selectedStart = null,
  selectedEnd = null,
  closeOnSelect = false,
  onRangeSelect
}: CalendarProps) {

  const [currentMonth, setCurrentMonth] = useState(() => new Date(initialMonth.getFullYear(), initialMonth.getMonth(), 1));
  const [selStart, setSelStart] = useState<ISODate | null>(selectedStart);
  const [selEnd, setSelEnd] = useState<ISODate | null>(selectedEnd);

  // build matrix 6x7 (42 cells)
  const matrix = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    // first day of month
    const firstOfMonth = new Date(year, month, 1);
    // get weekday 0..6
    const fd = firstOfMonth.getDay(); // 0 Sun ... 6 Sat

    // normalize according to weekStartsOn
    const offset = (fd - weekStartsOn + 7) % 7;
    // calendar start = firstOfMonth - offset days
    const startDate = dateOnly(new Date(year, month, 1 - offset));

    const days: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      days.push(dateOnly(d));
    }

    // chunk into weeks
    const weeks: Date[][] = [];
    for (let w = 0; w < 6; w++) {
      weeks.push(days.slice(w*7, w*7 + 7));
    }
    return weeks;
  }, [currentMonth, weekStartsOn]);

  const weekdays = weekStartsOn === 1
    ? ['Seg','Ter','Qua','Qui','Sex','Sáb','Dom']
    : ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb'];

  const isBetween = (dISO: ISODate | null, startISO: ISODate | null, endISO: ISODate | null) => {
    if (!dISO || !startISO || !endISO) return false;
    return (dISO >= startISO && dISO <= endISO);
  };

  const handleClick = (d: Date) => {
    const iso = toISO(d);

    // seleção simples de intervalo:
    if (!selStart || (selStart && selEnd)) {
      setSelStart(iso);
      setSelEnd(null);
      return;
    }

    // selStart exists and selEnd is null
    if (selStart && !selEnd) {
      if (iso < selStart) {
        // se clicou antes do start, troca start
        setSelStart(iso);
        setSelEnd(null);
        return;
      } else if (iso === selStart) {
        // clique no mesmo dia: considerar single-day range
        setSelEnd(iso);
      } else {
        setSelEnd(iso);
      }

      // informar callback
      const startFinal = selStart;
      const endFinal = iso >= selStart ? iso : selStart;
      if (onRangeSelect) onRangeSelect(startFinal!, endFinal);
      return;
    }
  };

  const prevMonth = () => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth()-1, 1));
  const nextMonth = () => setCurrentMonth(m => new Date(m.getFullYear(), m.getMonth()+1, 1));

  const monthLabel = `${currentMonth.toLocaleString('pt-BR', { month: 'long' })} ${currentMonth.getFullYear()}`;

  return (
    <div className="w-full max-w-md bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <button onClick={prevMonth} aria-label="Mês anterior" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-sm">arrow_back_ios</span>
        </button>
        <div className="font-bold text-base capitalize">{monthLabel}</div>
        <button onClick={nextMonth} aria-label="Próximo mês" className="p-2 rounded-lg hover:bg-white/10 transition-colors">
          <span className="material-symbols-outlined text-sm">arrow_forward_ios</span>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 text-[10px] font-black uppercase tracking-widest mb-3 text-gray-500">
        {weekdays.map(w => <div key={w} className="text-center">{w}</div>)}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {matrix.flat().map((d) => {
          const iso = toISO(d);
          const inMonth = d.getMonth() === currentMonth.getMonth();
          const isStart = selStart === iso;
          const isEnd = selEnd === iso;
          const inRange = isBetween(iso, selStart, selEnd);
          const isToday = toISO(new Date()) === iso;

          return (
            <button
              key={iso}
              onClick={() => handleClick(d)}
              className={`
                relative aspect-square flex items-center justify-center text-sm rounded-xl transition-all duration-300
                ${inMonth ? 'text-white' : 'text-gray-600'}
                ${isStart || isEnd ? 'bg-primary text-background-dark font-black shadow-lg shadow-primary/20 scale-105 z-10' : ''}
                ${inRange && !isStart && !isEnd ? 'bg-primary/10 text-primary' : ''}
                ${!isStart && !isEnd ? 'hover:bg-white/10' : ''}
                ${isToday && !isStart && !isEnd ? 'border border-primary/30' : ''}
              `}
              aria-pressed={isStart || isEnd}
            >
              <span className="relative z-10">{d.getDate()}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px] uppercase tracking-wider font-bold">
        <div className="flex gap-4">
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-500 text-[9px]">Retirada</span>
            <span className={selStart ? 'text-white' : 'text-gray-600'}>{selStart ? new Date(selStart + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</span>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-gray-500 text-[9px]">Devolução</span>
            <span className={selEnd ? 'text-white' : 'text-gray-600'}>{selEnd ? new Date(selEnd + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</span>
          </div>
        </div>
        <button 
          onClick={() => { setSelStart(null); setSelEnd(null); if (onRangeSelect) onRangeSelect('', ''); }} 
          className="text-primary hover:text-white transition-colors uppercase tracking-[0.2em]"
        >
          Limpar
        </button>
      </div>
    </div>
  );
}
