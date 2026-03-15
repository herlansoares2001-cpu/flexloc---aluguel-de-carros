import { useState, useMemo, useCallback } from 'react';
import { validateRental } from '../utils/rentalValidation';

// Substitui o parse problemático com 'T12:00:00' por este padrão local seguro
const parseLocalDate = (dateString: string) => {
  if (!dateString) return null;
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day); // Ano, Mês (0-11), Dia - sempre meia noite local
};

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

  const selectedDateStart = useMemo(() => parseLocalDate(dateStart), [dateStart]);
  const selectedDateEnd = useMemo(() => parseLocalDate(dateEnd), [dateEnd]);

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

  // Regras para o calendário de Retirada
  const isStartDateDisabled = useCallback((date: Date) => {
    return date.getDay() === 0; // Bloqueia apenas domingos
  }, []);

  // Regras para o calendário de Devolução
  const isEndDateDisabled = useCallback((date: Date) => {
    if (date.getDay() === 0) return true; // Bloqueia domingos
    
    // Bloqueia qualquer data anterior à data de retirada selecionada
    if (selectedDateStart) {
      const startZeroed = new Date(selectedDateStart).setHours(0,0,0,0);
      const currentZeroed = new Date(date).setHours(0,0,0,0);
      if (currentZeroed < startZeroed) return true;
    }
    return false;
  }, [selectedDateStart]);

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
    if (!selectedDateStart || !selectedDateEnd) return 0;
    return Math.round((selectedDateEnd.getTime() - selectedDateStart.getTime()) / 86400000);
  }, [selectedDateStart, selectedDateEnd]);

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
    isStartDateDisabled,
    isEndDateDisabled,
    error,
    setError,
    warning,
    validateDates,
    totalDays
  };
}
