import { useEffect, useRef, useState } from 'react';
import flatpickr from 'flatpickr';
import { Portuguese } from 'flatpickr/dist/l10n/pt.js';
import { validateRental } from '../utils/rentalValidation';
import { toLocalMidnight } from '../utils/dateUtils';

export function useRentalCalendar(plan: 'motorista' | 'pf', defaultStart = '', defaultEnd = '') {
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
    
    // Ensure flatpickr is in sync with state (e.g. from URL params or programmatic changes)
    if (fpStart.current && dateStart) {
      const currentSelected = fpStart.current.selectedDates[0];
      const stateDate = toLocalMidnight(dateStart);
      if (stateDate && (!currentSelected || currentSelected.getTime() !== stateDate.getTime())) {
        fpStart.current.setDate(stateDate, false);
      }
    }
    
    if (fpEnd.current && dateEnd) {
      const currentSelected = fpEnd.current.selectedDates[0];
      const stateDate = toLocalMidnight(dateEnd);
      if (stateDate && (!currentSelected || currentSelected.getTime() !== stateDate.getTime())) {
        fpEnd.current.setDate(stateDate, false);
      }
    }
    
    if (fpStart.current) fpStart.current.redraw();
    if (fpEnd.current) fpEnd.current.redraw();
  }, [dateStart, dateEnd]);

  const updateEndDateConstraints = (start: Date | undefined, currentPlan: 'motorista' | 'pf') => {
    if (!fpEnd.current) return;

    // Normalize start to midnight for consistent calculations
    const startMidnight = start ? new Date(start.getFullYear(), start.getMonth(), start.getDate()) : null;
    const now = new Date();
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    // Rule 1: Minimum days
    const minDays = currentPlan === 'motorista' ? 7 : 3;
    const minEnd = startMidnight 
      ? new Date(startMidnight.getTime() + minDays * 86400000) 
      : new Date(nowMidnight.getTime() + minDays * 86400000);
    
    try {
      if (typeof fpEnd.current.set === 'function') {
        // Set minDate based on the plan's minimum days
        fpEnd.current.set('minDate', minEnd);
        
        // Rule 2: Multiples and specific disabled dates
        const disableFunctions: any[] = [
          // Sunday is closed
          function(date: Date) {
            return date.getDay() === 0;
          }
        ];

        if (currentPlan === 'motorista') {
          // Motorista: Must be multiples of 7 starting from the start date
          if (startMidnight) {
            disableFunctions.push(function(date: Date) {
              const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              const diffDays = Math.round((dateMidnight.getTime() - startMidnight.getTime()) / 86400000);
              // Disable if less than 7 days OR not a multiple of 7
              return diffDays < 7 || diffDays % 7 !== 0;
            });
          } else {
            // No start date selected yet, just enforce min 7 days from today
            disableFunctions.push(function(date: Date) {
              const dateMidnight = new Date(date.getFullYear(), date.getMonth(), date.getDate());
              const diffDays = Math.round((dateMidnight.getTime() - nowMidnight.getTime()) / 86400000);
              return diffDays < 7;
            });
          }
        }

        fpEnd.current.set('disable', disableFunctions);
      }
    } catch (e) {
      console.error('Error setting constraints', e);
    }

    // Rule 3: Automatic Date Adjustment (Only if current selection is invalid)
    const currentEnd = fpEnd.current.selectedDates[0];
    const currentEndMidnight = currentEnd ? new Date(currentEnd.getFullYear(), currentEnd.getMonth(), currentEnd.getDate()) : null;

    if (startMidnight) {
      let isInvalid = !currentEndMidnight;
      let suggestedDays = minDays;

      if (currentEndMidnight) {
        const diffDays = Math.round((currentEndMidnight.getTime() - startMidnight.getTime()) / 86400000);
        
        if (currentPlan === 'motorista') {
          // For motorista, invalid if < 7 or not multiple of 7
          if (diffDays < 7 || diffDays % 7 !== 0) {
            isInvalid = true;
            suggestedDays = 7;
          }
        } else {
          // For PF, only invalid if < 3
          if (diffDays < 3) {
            isInvalid = true;
            suggestedDays = 3;
          }
        }

        // Also invalid if Sunday
        if (currentEndMidnight.getDay() === 0) {
          isInvalid = true;
        }
      }

      if (isInvalid) {
        let suggestedEnd = new Date(startMidnight.getTime() + suggestedDays * 86400000);
        // If suggested end is Sunday, move to Monday
        if (suggestedEnd.getDay() === 0) {
          suggestedEnd = new Date(suggestedEnd.getTime() + 86400000);
        }

        try {
          if (typeof fpEnd.current.setDate === 'function') {
            fpEnd.current.setDate(suggestedEnd, true);
          }
        } catch (e) {
          console.error('Error setting date', e);
        }
      }
    }
  };

  useEffect(() => {
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
          function(date) {
            // Sunday is closed
            return date.getDay() === 0;
          }
        ],
        defaultDate: toLocalMidnight(defaultStart) || undefined,
        onChange: (selectedDates) => {
          if (selectedDates.length > 0) {
            const d = selectedDates[0];
            const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            setDateStart(formatted);
            setError('');
            updateEndDateConstraints(selectedDates[0], planRef.current);
          }
        },
        onDayCreate: (dObj, dStr, fp, dayElem: any) => {
          dayElem.classList.add('transition-all', 'duration-300');
          const start = toLocalMidnight(dateStartValue.current);
          const end = toLocalMidnight(dateEndValue.current);
          
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
          function(date) {
            // Sunday is closed
            return date.getDay() === 0;
          }
        ],
        defaultDate: toLocalMidnight(defaultEnd) || undefined,
        onChange: (selectedDates) => {
          if (selectedDates.length > 0) {
            const d = selectedDates[0];
            const formatted = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
            setDateEnd(formatted);
            setError('');
            
            // Saturday warning
            if (d.getDay() === 6) {
              setWarning('Sábados a devolução deve ocorrer até 12:00.');
            } else {
              setWarning('');
            }
          }
        },
        onDayCreate: (dObj, dStr, fp, dayElem: any) => {
          dayElem.classList.add('transition-all', 'duration-300');
          const start = toLocalMidnight(dateStartValue.current);
          const end = toLocalMidnight(dateEndValue.current);
          
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
  }, []); // Run once on mount

  // Update constraints when plan changes
  useEffect(() => {
    const start = fpStart.current?.selectedDates[0];
    updateEndDateConstraints(start, plan);
  }, [plan]);

  const validateDates = (timeStart?: string, timeEnd?: string) => {
    const result = validateRental({
      plan: planRef.current,
      dateStart,
      dateEnd,
      timeStart,
      timeEnd
    });

    if (!result.isValid) {
      setError(result.error || 'Erro na validação das datas.');
      return false;
    }

    setError('');
    return true;
  };

  const totalDays = dateStart && dateEnd 
    ? Math.round(((toLocalMidnight(dateEnd)?.getTime() || 0) - (toLocalMidnight(dateStart)?.getTime() || 0)) / 86400000)
    : 0;


  return {
    dateStartRef,
    dateEndRef,
    dateStart,
    dateEnd,
    error,
    setError,
    warning,
    validateDates,
    totalDays
  };
}
