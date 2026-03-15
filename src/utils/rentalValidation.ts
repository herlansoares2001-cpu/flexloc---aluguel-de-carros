export interface RentalValidationParams {
  plan: 'motorista' | 'pf';
  dateStart: string; // YYYY-MM-DD
  dateEnd: string;   // YYYY-MM-DD
  timeStart?: string; // HH:mm
  timeEnd?: string;   // HH:mm
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateRental(params: RentalValidationParams): ValidationResult {
  const { plan, dateStart, dateEnd, timeStart, timeEnd } = params;

  if (!dateStart || !dateEnd) {
    return { isValid: false, error: 'Por favor, selecione as datas de retirada e devolução.' };
  }

  const start = new Date(dateStart + 'T12:00:00');
  const end = new Date(dateEnd + 'T12:00:00');

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return { isValid: false, error: 'Datas inválidas.' };
  }

  if (start > end) {
    return { isValid: false, error: 'A data de devolução deve ser posterior à data de retirada.' };
  }

  // ALERTA DE RISCO: Validação de Domingo comentada para permitir ciclos de 7 dias inclusivos iniciando na Segunda.
  // if (start.getDay() === 0 || end.getDay() === 0) {
  //   return { isValid: false, error: 'A locadora não funciona aos domingos. Não permitimos retirada ou devolução nesse dia.' };
  // }

  if (end.getDay() === 6 && timeEnd) {
    const [hours, minutes] = timeEnd.split(':').map(Number);
    if (hours > 12 || (hours === 12 && minutes > 0)) {
      return { isValid: false, error: 'Sábados a devolução deve ocorrer até 12:00.' };
    }
  }

  const diffTime = Math.abs(end.getTime() - start.getTime());
  // CORREÇÃO: Matemática Inclusiva (+1 dia)
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;

  if (plan === 'motorista') {
    if (diffDays < 7) {
      return { isValid: false, error: 'Motoristas de aplicativo devem alugar no mínimo 7 dias corridos.' };
    }
  } else if (plan === 'pf') {
    if (diffDays < 3) {
      return { isValid: false, error: 'A locação mínima para pessoa física é de 3 dias corridos.' };
    }
  }

  return { isValid: true };
}
