import { useEffect, useRef, useState } from 'react';
import flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import { validateRental } from '../utils/rentalValidation';

// Interface auxiliar para evitar o uso de 'any' no target do evento flatpickr
interface FlatpickrDayElement extends HTMLElement {
  dateObj?: Date;
}

export function useRentalCalendar(plan: 'motorista' | 'pf', defaultStart = '', defaultEnd = '', disableFp = false) {
  const dateStartRef = useRef<HTMLInputElement>(null);
  const dateEndRef = useRef<HTMLInputElement>(null);
  const fpStart = useRef<flatpickr.Instance | null>(null);
  const fpEnd = useRef<flatpickr.Instance | null>(null);

  const [dateStart, setDateStart] = useState(defaultStart);
  const [dateEnd, setDateEnd] = useState(defaultEnd);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  const dateStartValue = useRef(dateStart);
  const dateEndValue = useRef(dateEnd);
  const planRef = useRef(plan);

  useEffect(() => {
    planRef.current = plan;
  }, [plan]);

  useEffect(() => {
    dateStartValue.current = dateStart;
    dateEndValue.current = dateEnd;
    if (fpStart.current) fpStart.current.redraw();
    if (fpEnd.current) fpEnd.current.redraw();
  }, [dateStart, dateEnd]);

  const updateEndDateConstraints = (start: Date | undefined, currentPlan: 'motorista' | 'pf') => {
    const startMidnight = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate()) : null;
    const now = new Date();
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const minDays = currentPlan === 'motorista' ? 90 : 3;
    const minEnd = startMidnight 
      ? new Date(startMidnight.getTime() + minDays * 86400000) 
      : new Date(nowMidnight.getTime() + minDays * 86400000);
    
    if (fpEnd.current) {
      try {
        if (typeof fpEnd.current.set === 'function') {
          fpEnd.current.set('minDate', minEnd);
          
          const disableFunctions: Array<(date: Date) => boolean> = [
            function(date: Date) { return date.getDay() === 0; }
          ];

          if (currentPlan === 'motorista' && startMidnight) {
             disableFunctions.push(function(date: Date) {
               const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
               const diffDays = Math.round((dateMidnight.getTime() - startMidnight.getTime()) / 86400000);
               return diffDays < 90;
             });
          }

          fpEnd.current.set('disable', disableFunctions);
        }
      } catch (e) {
        console.error('Error setting constraints', e);
      }
    }

    const currentEnd = fpEnd.current ? fpEnd.current.selectedDates[0] : (dateEndValue.current ? new Date(dateEndValue.current + 'T12:00:00') : null);
    const currentEndMidnight = currentEnd ? new Date(currentEnd.getFullYear(), currentEnd.getMonth(), currentEnd.getDate()) : null;

    if (startMidnight && currentPlan !== 'motorista') {
      let isInvalid = !currentEndMidnight;
      let suggestedDays = minDays;

      if (currentEndMidnight) {
        const diffDays = Math.round((currentEndMidnight.getTime() - startMidnight.getTime()) / 86400000) + 1;
        
        if (diffDays < 3) {
          isInvalid = true;
          suggestedDays = 3;
        }
      }

      if (isInvalid) {
        let suggestedEnd = new Date(startMidnight.getTime() + (suggestedDays - 1) * 86400000);
        
        // Se a sugestão cair no domingo, avançar para segunda
        if (suggestedEnd.getDay() === 0) {
            suggestedEnd = new Date(suggestedEnd.getTime() + 86400000);
        }

        if (fpEnd.current) {
          try {
            if (typeof fpEnd.current.setDate === 'function') {
              fpEnd.current.setDate(suggestedEnd, true);
            }
          } catch (e) {
            console.error('Error setting date', e);
          }
        } else {
          // Fallback manual se o flatpickr não estiver montado
          const formatted = `${suggestedEnd.getFullYear()}-${String(suggestedEnd.getMonth() + 1).padStart(2, '0')}-${String(suggestedEnd.getDate()).padStart(2, '0')}`;
          setDateEnd(formatted);
        }
      }
    }
  };

  useEffect(() => {
    if (disableFp) return;
    let maxBoundary = new Date();
    maxBoundary.setMonth(maxBoundary.getMonth() + 6);

    if (dateStartRef.current && !fpStart.current) {
      fpStart.current = flatpickr(dateStartRef.current, {
        dateFormat: "d/m/Y",
        minDate: "today",
        maxDate: maxBoundary,
        locale: Portuguese,
        disableMobile: true,
        disable: [
          function(date: Date) {
            return date.getDay() === 0;
          }
        ],
        defaultDate: dateStartValue.current ? new Date(dateStartValue.current + 'T12:00:00') : (defaultStart ? new Date(defaultStart + 'T12:00:00') : undefined),
        onChange: (selectedDates) => {
          if (selectedDates.length > 0) {
            const d = selectedDates[0];
            const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            setDateStart(formatted);
            setError('');
            updateEndDateConstraints(selectedDates[0], planRef.current);
          }
        },
        onDayCreate: (dObj, dStr, fp, dayElem: FlatpickrDayElement) => {
          dayElem.classList.add('transition-all', 'duration-300');
          const start = dateStartValue.current ? new Date(dateStartValue.current + 'T12:00:00') : null;
          const end = dateEndValue.current ? new Date(dateEndValue.current + 'T12:00:00') : null;
          
          if (start && end && dayElem.dateObj) {
            const currentTime = dayElem.dateObj.getTime();
            const startTime = start.getTime();
            const endTime = end.getTime();
            
            if (currentTime > startTime && currentTime < endTime) {
              dayElem.classList.add('inRange');
              dayElem.style.background = 'rgba(255, 217, 0, 0.1)';
              dayElem.style.borderColor = 'transparent';
            } else if (currentTime === startTime) {
              dayElem.classList.add('startRange');
            } else if (currentTime === endTime) {
              dayElem.classList.add('endRange');
            }
          }
        }
      }) as flatpickr.Instance;
    }

    if (dateEndRef.current && !fpEnd.current) {
      fpEnd.current = flatpickr(dateEndRef.current, {
        dateFormat: "d/m/Y",
        minDate: "today",
        maxDate: maxBoundary,
        locale: Portuguese,
        disableMobile: true,
        disable: [
          function(date: Date) {
            return date.getDay() === 0;
          }
        ],
        defaultDate: dateEndValue.current ? new Date(dateEndValue.current + 'T12:00:00') : (defaultEnd ? new Date(defaultEnd + 'T12:00:00') : undefined),
        onChange: (selectedDates) => {
          if (selectedDates.length > 0) {
            const d = selectedDates[0];
            const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            setDateEnd(formatted);
            setError('');
            
            if (d.getDay() === 6) {
              setWarning('Sábados a devolução deve ocorrer até 12:00.');
            } else {
              setWarning('');
            }
          }
        },
        onDayCreate: (dObj, dStr, fp, dayElem: FlatpickrDayElement) => {
          dayElem.classList.add('transition-all', 'duration-300');
          const start = dateStartValue.current ? new Date(dateStartValue.current + 'T12:00:00') : null;
          const end = dateEndValue.current ? new Date(dateEndValue.current + 'T12:00:00') : null;
          
          if (start && end && dayElem.dateObj) {
            const currentTime = dayElem.dateObj.getTime();
            const startTime = start.getTime();
            const endTime = end.getTime();
            
            if (currentTime > startTime && currentTime < endTime) {
              dayElem.classList.add('inRange');
              dayElem.style.background = 'rgba(255, 217, 0, 0.1)';
              dayElem.style.borderColor = 'transparent';
            } else if (currentTime === startTime) {
              dayElem.classList.add('startRange');
            } else if (currentTime === endTime) {
              dayElem.classList.add('endRange');
            }
          }
        }
      }) as flatpickr.Instance;
      updateEndDateConstraints(fpStart.current?.selectedDates[0], plan);
    }

    return () => {
      if (fpStart.current) {
        fpStart.current.destroy();
        fpStart.current = null;
      }
      if (fpEnd.current) {
        fpEnd.current.destroy();
        fpEnd.current = null;
      }
    };
  }, [plan]); // Adicionado plan como dependência para reinicializar quando campos surgirem/sumirem

  useEffect(() => {
    const start = fpStart.current?.selectedDates[0];
    updateEndDateConstraints(start, plan);
  }, [plan]);

  const validateDates = (timeStart?: string, timeEnd?: string) => {
    // Para motorista de app, a validação não precisa de dateEnd
    const result = validateRental({
      plan: planRef.current,
      dateStart,
      dateEnd: planRef.current === 'motorista' ? '' : dateEnd,
      timeStart,
      timeEnd: planRef.current === 'motorista' ? undefined : timeEnd
    });

    if (!result.isValid) {
      setError(result.error || 'Erro na validação das datas.');
      return false;
    }

    setError('');
    return true;
  };

  const totalDays = dateStart && dateEnd 
    ? Math.round((new Date(dateEnd + 'T12:00:00').getTime() - new Date(dateStart + 'T12:00:00').getTime()) / 86400000)
    : 0;

  return {
    dateStartRef,
    dateEndRef,
    dateStart,
    dateEnd,
    setDateStart,
    setDateEnd,
    error,
    setError,
    warning,
    validateDates,
    totalDays
  };
}
