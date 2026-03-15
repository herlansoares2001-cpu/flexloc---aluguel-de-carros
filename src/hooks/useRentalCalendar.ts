import { useState, useMemo, useCallback } from 'react';
import { validateRental } from '../utils/rentalValidation';

export function useRentalCalendar(plan: 'motorista' | 'pf', defaultStart = '', defaultEnd = '') {
  const [dateStart, setDateStart] = useState(defaultStart);
  const [dateEnd, setDateEnd] = useState(defaultEnd);
  const [error, setError] = useState('');
  const [warning, setWarning] = useState('');

  // Estados para navegação do calendário (mês/ano atual sendo visualizado)
  const [viewDateStart, setViewDateStart] = useState(new Date());
  const [viewDateEnd, setViewDateEnd] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 1);
    return d;
  });

  const selectedDateStart = useMemo(() => dateStart ? new Date(dateStart + 'T12:00:00') : null, [dateStart]);
  const selectedDateEnd = useMemo(() => dateEnd ? new Date(dateEnd + 'T12:00:00') : null, [dateEnd]);

  const handleSelectStart = useCallback((date: Date) => {
    // Regra: Domingo fechado
    if (date.getDay() === 0) {
      setError('A locadora não abre aos domingos para retirada.');
      return;
    }

    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setDateStart(formatted);
    setError('');

    // Ajuste automático da data de devolução se necessário
    const minDays = plan === 'motorista' ? 7 : 3;
    const minEnd = new Date(date.getTime() + minDays * 86400000);
    
    // Se a data de devolução atual for menor que a mínima, ou se não estiver selecionada
    if (!selectedDateEnd || selectedDateEnd < minEnd) {
      let suggestedEnd = new Date(minEnd);
      if (suggestedEnd.getDay() === 0) suggestedEnd.setDate(suggestedEnd.getDate() + 1);
      
      const formattedEnd = `${suggestedEnd.getFullYear()}-${String(suggestedEnd.getMonth() + 1).padStart(2, '0')}-${String(suggestedEnd.getDate()).padStart(2, '0')}`;
      setDateEnd(formattedEnd);
    }
  }, [plan, selectedDateEnd]);

  const handleSelectEnd = useCallback((date: Date) => {
    // Regra: Domingo fechado
    if (date.getDay() === 0) {
      setError('A locadora não abre aos domingos para devolução.');
      return;
    }
    
    // Regra Motorista: Múltiplos de 7
    if (plan === 'motorista' && selectedDateStart) {
      const diffDays = Math.round((date.getTime() - selectedDateStart.getTime()) / 86400000);
      if (diffDays % 7 !== 0) {
        setError('Para motoristas de app, a locação deve ser em períodos semanais (7, 14, 21... dias).');
        return;
      }
    }

    const formatted = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    setDateEnd(formatted);
    setError('');

    if (date.getDay() === 6) {
      setWarning('Sábados a devolução deve ocorrer até 12:00.');
    } else {
      setWarning('');
    }
  }, [plan, selectedDateStart]);

  const validateDates = (timeStart?: string, timeEnd?: string) => {
    const result = validateRental({
      plan,
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

  const totalDays = useMemo(() => {
    if (!dateStart || !dateEnd) return 0;
    return Math.round((new Date(dateEnd + 'T12:00:00').getTime() - new Date(dateStart + 'T12:00:00').getTime()) / 86400000);
  }, [dateStart, dateEnd]);

  return {
    dateStart,
    dateEnd,
    selectedDateStart,
    selectedDateEnd,
    viewDateStart,
    setViewDateStart,
    viewDateEnd,
    setViewDateEnd,
    handleSelectStart,
    handleSelectEnd,
    error,
    setError,
    warning,
    validateDates,
    totalDays
  };
}
