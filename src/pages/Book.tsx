import { useEffect, useState, useMemo, useRef } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CARS } from '../constants';
import { useRentalCalendar } from '../hooks/useRentalCalendar';
import { Calendar } from '../components/Calendar';

const ALL_CARS = CARS;

const FEAT_LABELS: Record<string, string> = { ar: 'Ar Cond.', gnv: 'GNV Gen5', multimidia: 'Multimídia', automatico: 'Automático' };
const FEAT_ICONS: Record<string, string> = { ar: 'ac_unit', gnv: 'local_gas_station', multimidia: 'settings_system_daydream', automatico: 'auto_transmission' };

export default function Book() {
  const [searchParams] = useSearchParams();
  const qLoc = searchParams.get('loc') || 'fsa';
  const qPlan = searchParams.get('plan') || 'motorista';
  const qDateStart = searchParams.get('dateStart') || '';
  const qDateEnd = searchParams.get('dateEnd') || '';
  const qTimeStart = searchParams.get('timeStart') || '09:00';
  const qTimeEnd = searchParams.get('timeEnd') || '09:00';
  const qCarId = Number(searchParams.get('carId')) || 1;

  const [location, setLocation] = useState(qLoc);
  const [plan, setPlan] = useState<'motorista' | 'pf'>(qPlan === 'pf' ? 'pf' : 'motorista');
  const [timeStart, setTimeStart] = useState(qTimeStart);
  const [timeEnd, setTimeEnd] = useState(qTimeEnd);
  const [insurance, setInsurance] = useState(45);
  const [mileageFranchise, setMileageFranchise] = useState<'k3' | 'k6' | 'free'>('k3');
  
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(1300);
  const [sort, setSort] = useState('price-asc');
  
  const [selectedCarId, setSelectedCarId] = useState(qCarId);
  
  const [isCalendarStartOpen, setIsCalendarStartOpen] = useState(false);
  const [isCalendarEndOpen, setIsCalendarEndOpen] = useState(false);

  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isTimeStartOpen, setIsTimeStartOpen] = useState(false);
  const [isTimeEndOpen, setIsTimeEndOpen] = useState(false);

  const {
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
  } = useRentalCalendar(plan, qDateStart, qDateEnd);

  const calendarStartRef = useRef<HTMLDivElement>(null);
  const calendarEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (calendarStartRef.current && !calendarStartRef.current.contains(event.target as Node)) {
        setIsCalendarStartOpen(false);
      }
      if (calendarEndRef.current && !calendarEndRef.current.contains(event.target as Node)) {
        setIsCalendarEndOpen(false);
      }
    }
    
    if (isCalendarStartOpen || isCalendarEndOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCalendarStartOpen, isCalendarEndOpen]);

  const currentCar = useMemo(() => ALL_CARS.find(c => c.id === selectedCarId) || ALL_CARS[0], [selectedCarId]);

  const filteredCars = useMemo(() => {
    let filtered = ALL_CARS.filter(c => {
      if (plan === 'pf' && !c.availablePF) return false;
      if (search && !c.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (categories.length && !categories.includes(c.category)) return false;
      if (features.length && !features.every(f => c.feats?.includes(f))) return false;
      
      let p = 0;
      if (plan === 'pf') {
        p = c.priceDay;
      } else {
        const pricing = c.pricingApp?.[location as 'fsa' | 'ssa'];
        p = pricing?.[mileageFranchise] || 0;
      }
      
      if (p > maxPrice && p !== 0) return false;
      return true;
    });

    if (sort === 'price-asc') {
      filtered.sort((a, b) => {
        let pa = 0;
        let pb = 0;
        if (plan === 'pf') {
          pa = a.priceDay;
          pb = b.priceDay;
        } else {
          pa = a.pricingApp?.[location as 'fsa' | 'ssa']?.[mileageFranchise] || 0;
          pb = b.pricingApp?.[location as 'fsa' | 'ssa']?.[mileageFranchise] || 0;
        }
        return pa - pb;
      });
    } else if (sort === 'price-desc') {
      filtered.sort((a, b) => {
        let pa = 0;
        let pb = 0;
        if (plan === 'pf') {
          pa = a.priceDay;
          pb = b.priceDay;
        } else {
          pa = a.pricingApp?.[location as 'fsa' | 'ssa']?.[mileageFranchise] || 0;
          pb = b.pricingApp?.[location as 'fsa' | 'ssa']?.[mileageFranchise] || 0;
        }
        return pb - pa;
      });
    } else {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    }

    return filtered;
  }, [search, categories, features, maxPrice, sort, plan, location]);

  const toggleCategory = (cat: string) => {
    setCategories(prev => prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]);
  };

  const toggleFeature = (feat: string) => {
    setFeatures(prev => prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]);
  };

  const resetFilters = () => {
    setSearch('');
    setCategories([]);
    setFeatures([]);
    setMaxPrice(1300);
    setSort('price-asc');
  };

  useEffect(() => {
    document.title = "FlexLoc — Reservar Veículo";
  }, []);

  const timeOptions = [];
  for (let h = 9; h <= 17; h++) {
    timeOptions.push(`${String(h).padStart(2, '0')}:00`);
    if (h < 17) timeOptions.push(`${String(h).padStart(2, '0')}:30`);
  }

  const calculateTotals = () => {
    let days = totalDays;

    let carTotal = 0;
    let weeks = 0;
    if (plan === 'pf') {
      carTotal = currentCar.priceDay * days;
    } else {
      // Motorista de App
      const pricing = currentCar.pricingApp?.[location as 'fsa' | 'ssa'];
      const weeklyPrice = pricing?.[mileageFranchise] || 0;
      weeks = Math.round(days / 7);
      carTotal = weeklyPrice * weeks;
    }

    const insTotal = 0;
    
    // Safety check for display
    const finalCarTotal = isNaN(carTotal) ? 0 : carTotal;
    const total = finalCarTotal + insTotal;

    return { days, weeks, carTotal: finalCarTotal, insTotal, total };
  };

  const totals = calculateTotals();

  const handleConfirm = async () => {
    if (!validateDates(timeStart, timeEnd)) {
      return;
    }

    // Backend validation
    try {
      const response = await fetch('/api/validate-reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          dateStart,
          dateEnd,
          timeStart,
          timeEnd
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data.error || 'Erro na validação do servidor.');
        return;
      }
    } catch (err) {
      console.error('Backend validation error:', err);
      // If backend is down, we still have frontend validation, but let's be safe
    }

    const locName = location === 'fsa' ? 'Feira de Santana, BA' : 'Salvador, BA';
    const planName = plan === 'motorista' ? 'Motorista de App' : 'Pessoa Física';
    const franchiseName = mileageFranchise === 'k3' ? '3.000km/mês' : mileageFranchise === 'k6' ? '6.000km/mês' : 'KM Livre/mês';
    
    const formattedStart = dateStart ? new Date(dateStart + 'T12:00:00').toLocaleDateString('pt-BR') : '';
    const formattedEnd = dateEnd ? new Date(dateEnd + 'T12:00:00').toLocaleDateString('pt-BR') : '';

    const message = `Olá! Gostaria de confirmar uma reserva:

*Veículo:* ${currentCar.name}
*Local:* ${locName}
*Plano:* ${planName}
${plan === 'motorista' ? `*Franquia:* ${franchiseName}\n` : ''}*Retirada:* ${formattedStart} às ${timeStart}
*Devolução:* ${formattedEnd} às ${timeEnd}
*Proteção:* Inclusa
*Período:* ${totals.days} dias ${totals.weeks > 0 ? `(${totals.weeks} sem.)` : ''}
*Total Estimado:* R$ ${totals.total}

Aguardo retorno para finalizar!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/557581333333?text=${encodedMessage}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="text-white min-h-screen flex flex-col selection:bg-primary selection:text-black bg-black">
      <div id="spotlight"></div>
      
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-white/5">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src="/images/logo.png" decoding="async" alt="FlexLoc" className="h-7 w-auto object-contain" />
          </Link>
          <nav className="hidden md:flex items-center gap-8">
            <Link className="text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-primary transition-colors" to="/#fleet">Frota</Link>
            <Link className="text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-primary transition-colors" to="/">Contato</Link>
          </nav>
          <Link to="/" className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors">
            <span className="material-symbols-outlined text-[18px]">arrow_back</span> Voltar
          </Link>
        </div>
      </header>

      <main className="flex-grow min-h-screen bg-booking-radial pb-32">
        <div className="max-w-6xl mx-auto px-4 pt-24 pb-32 lg:pb-12 min-h-screen">
          {/* Título da Página */}
          <h1 className="text-3xl font-bold mb-8 text-white">Finalize sua Reserva</h1>

          {/* Início do Grid: 1 coluna no mobile, 2 colunas no Desktop */}
          <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 items-start">
            
            {/* COLUNA ESQUERDA: Resumo do Carro (Fixo no scroll) */}
            <div className="lg:col-span-5 w-full lg:sticky lg:top-24 space-y-6">
              <div className="glass-panel rounded-3xl p-6 border border-white/10 bg-white/[0.03]">
                <div className="relative h-48 w-full mb-6 flex items-center justify-center">
                  <img src={currentCar.img || currentCar.image} decoding="async" alt={currentCar.name} className="car-img object-contain w-full h-full" />
                </div>
                <div className="mb-6">
                  <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${currentCar.catColor} mb-1 block`}>{currentCar.catLabel}</span>
                  <h2 className="text-white text-3xl font-bold tracking-tight">{currentCar.name}</h2>
                  <p className="text-primary font-black text-xl mt-2">
                    {plan === 'pf' ? `R$ ${currentCar.priceDay}` : `R$ ${currentCar.pricingApp?.[location as 'fsa' | 'ssa']?.[mileageFranchise] ?? '-'}`}
                    <span className="text-gray-500 text-sm font-normal">/{plan === 'pf' ? 'dia' : 'sem'}</span>
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-3 mb-8 border-t border-white/5 pt-6">
                  {currentCar.feats.slice(0, 3).map(f => (
                    <div key={f} className="flex flex-col items-center gap-2 text-center">
                      <span className="material-symbols-outlined text-gray-400 text-lg font-light">{FEAT_ICONS[f] || 'check_circle'}</span>
                      <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{FEAT_LABELS[f] || f}</span>
                    </div>
                  ))}
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Plano de Locação</label>
                  <div className="pill-toggle flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                    <button onClick={() => setPlan('motorista')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${plan === 'motorista' ? 'bg-primary text-background-dark shadow-sm shadow-primary/20' : 'text-gray-500 hover:text-gray-300'}`}>Motorista de App</button>
                    <button onClick={() => setPlan('pf')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${plan === 'pf' ? 'bg-primary text-background-dark shadow-sm shadow-primary/20' : 'text-gray-500 hover:text-gray-300'}`}>Pessoa Física</button>
                  </div>
                </div>
              </div>
            </div>

            {/* COLUNA DIREITA: Formulário de Reserva */}
            <div className="lg:col-span-7 w-full bg-[#121214]/95 border border-white/10 rounded-2xl p-6 lg:p-8 space-y-8 relative overflow-visible">
              
              {/* Localização */}
              <div className="space-y-3">
                <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Local de Retirada</label>
                <div className="flex p-1 bg-black/40 rounded-2xl border border-white/5 shadow-inner">
                  <button type="button" onClick={() => setLocation('fsa')}
                    className={`flex-1 py-4 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${location === 'fsa' ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}>
                    Feira de Santana
                  </button>
                  <button type="button" onClick={() => setLocation('ssa')}
                    className={`flex-1 py-4 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${location === 'ssa' ? 'bg-primary text-background-dark shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}>
                    Salvador
                  </button>
                </div>
              </div>

              {/* AGRUPAMENTO HORIZONTAL DAS DATAS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                {/* Retirada */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Retirada</h3>
                  
                  <div className="space-y-4">
                    <div className={`relative group ${isCalendarStartOpen ? 'z-[60]' : 'z-10'}`} ref={calendarStartRef}>
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 transition-colors group-hover:text-primary z-10">
                        <span className="material-symbols-outlined text-[20px]">calendar_today</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setIsCalendarStartOpen(!isCalendarStartOpen); setIsCalendarEndOpen(false); }}
                        className={`w-full text-left pl-10 pr-2 py-4 bg-white/[0.03] border rounded-xl text-sm text-white font-bold focus:border-primary/50 transition-all ${isCalendarStartOpen ? 'border-primary/50 ring-1 ring-primary/50' : 'border-white/10'}`}
                      >
                        {selectedDateStart ? selectedDateStart.toLocaleDateString('pt-BR') : "Data"}
                      </button>

                      {isCalendarStartOpen && (
                        <div className="absolute z-[100] left-0 right-0 sm:right-auto mt-2 sm:w-80">
                          <Calendar 
                            currentMonth={viewDateStart.getMonth()}
                            currentYear={viewDateStart.getFullYear()}
                            startDate={selectedDateStart}
                            endDate={selectedDateEnd}
                            onSelectDate={(date) => {
                              handleSelectStart(date);
                              setIsCalendarStartOpen(false);
                            }}
                            onNavigate={(year, month) => setViewDateStart(new Date(year, month, 1))}
                            isDateDisabled={isStartDateDisabled}
                            label="Data de Retirada"
                          />
                        </div>
                      )}
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                        <span className="material-symbols-outlined text-[20px]">schedule</span>
                      </div>
                      <button type="button" onClick={() => setIsTimeStartOpen(!isTimeStartOpen)}
                        className="w-full text-left pl-10 pr-8 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white font-bold transition-all focus:border-primary/50">
                        <span>{timeStart}</span>
                      </button>
                      {isTimeStartOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-black border border-white/10 rounded-2xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                          <ul className="p-2 text-sm font-medium text-gray-400 flex flex-col gap-1">
                            {timeOptions.map(t => (
                              <li key={t}>
                                <button type="button" onClick={() => { setTimeStart(t); setIsTimeStartOpen(false); }}
                                  className="w-full text-center px-2 py-3 hover:text-primary hover:bg-white/5 rounded-lg transition-all duration-150 cursor-pointer">
                                  {t}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {error && error.includes('retirada') && <p className="text-[10px] text-red-500 font-bold ml-1">{error}</p>}
                  </div>
                </div>

                {/* Devolução */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Devolução</h3>
                  
                  <div className="space-y-4">
                    <div className={`relative group ${isCalendarEndOpen ? 'z-[60]' : 'z-10'}`} ref={calendarEndRef}>
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 transition-colors group-hover:text-primary z-10">
                        <span className="material-symbols-outlined text-[20px]">event_repeat</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => { setIsCalendarEndOpen(!isCalendarEndOpen); setIsCalendarStartOpen(false); }}
                        className={`w-full text-left pl-10 pr-2 py-4 bg-white/[0.03] border rounded-xl text-sm text-white font-bold focus:border-primary/50 transition-all ${isCalendarEndOpen ? 'border-primary/50 ring-1 ring-primary/50' : 'border-white/10'}`}
                      >
                        {selectedDateEnd ? selectedDateEnd.toLocaleDateString('pt-BR') : "Data"}
                      </button>

                      {isCalendarEndOpen && (
                        <div className="absolute z-[100] left-0 right-0 sm:right-auto mt-2 sm:w-80">
                          <Calendar 
                            currentMonth={viewDateEnd.getMonth()}
                            currentYear={viewDateEnd.getFullYear()}
                            startDate={selectedDateStart}
                            endDate={selectedDateEnd}
                            onSelectDate={(date) => {
                              handleSelectEnd(date);
                              setIsCalendarEndOpen(false);
                            }}
                            onNavigate={(year, month) => setViewDateEnd(new Date(year, month, 1))}
                            isDateDisabled={isEndDateDisabled}
                            label="Data de Devolução"
                          />
                        </div>
                      )}
                    </div>

                    <div className="relative group">
                      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500">
                        <span className="material-symbols-outlined text-[20px]">schedule</span>
                      </div>
                      <button type="button" onClick={() => setIsTimeEndOpen(!isTimeEndOpen)}
                        className="w-full text-left pl-10 pr-8 py-4 bg-white/[0.03] border border-white/10 rounded-xl text-sm text-white font-bold transition-all focus:border-primary/50">
                        <span>{timeEnd}</span>
                      </button>
                      {isTimeEndOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-black border border-white/10 rounded-2xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                          <ul className="p-2 text-sm font-medium text-gray-400 flex flex-col gap-1">
                            {timeOptions.map(t => (
                              <li key={t}>
                                <button type="button" onClick={() => { setTimeEnd(t); setIsTimeEndOpen(false); }}
                                  className="w-full text-center px-2 py-3 hover:text-primary hover:bg-white/5 rounded-lg transition-all duration-150 cursor-pointer">
                                  {t}
                                </button>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    {((error && !error.includes('retirada')) || warning) && (
                      <p className={`text-[10px] font-bold ml-1 mt-1 ${error ? 'text-red-500' : 'text-yellow-500'}`}>
                        {error || warning}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Seleção de Franquia */}
              {plan === 'motorista' ? (
                <div className="space-y-4">
                  <label className="text-sm font-bold text-slate-400 uppercase tracking-widest ml-1">Franquia de Kilometragem</label>
                  <div className="grid gap-3">
                    {[
                      { id: 'k3', label: '3.000km/mês', desc: 'Ideal para rodar pouco.' },
                      { id: 'k6', label: '6.000km/mês', desc: 'Para quem roda bastante.' },
                      { id: 'free', label: 'KM Livre/mês', desc: 'Sem limites de rodagem.' }
                    ].map(f => {
                      const pricing = currentCar.pricingApp?.[location as 'fsa' | 'ssa'];
                      const price = pricing?.[f.id as 'k3' | 'k6' | 'free'];
                      const isAvailable = price != null;
                      
                      return (
                        <label key={f.id} className={`insurance-card flex items-center gap-4 p-4 rounded-xl border border-white/10 bg-white/[0.03] cursor-pointer group ${mileageFranchise === f.id ? 'active' : ''} ${!isAvailable ? 'opacity-30 pointer-events-none' : ''}`}>
                          <input type="radio" name="franchise" value={f.id} checked={mileageFranchise === f.id} onChange={() => setMileageFranchise(f.id as any)} disabled={!isAvailable} className="hidden" />
                          <div className="check-circle"></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-black text-white uppercase tracking-wider">{f.label}</span>
                              <span className="text-sm font-black text-primary">R$ {price}<span className="text-[10px] font-normal text-gray-500">/sem</span></span>
                            </div>
                            <p className="text-[10px] text-gray-500 leading-tight group-hover:text-gray-400 transition-colors">{f.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-primary/80 font-bold text-center mt-2">* Desconto de R$100,00 de pontualidade na semana incluso</p>
                </div>
              ) : (
                <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="material-symbols-outlined text-primary">shield</span>
                    <span className="text-xs font-black text-white uppercase tracking-wider">Proteção Inclusa</span>
                  </div>
                  <p className="text-[10px] text-gray-400 leading-relaxed">
                    Para sua tranquilidade, a proteção total (roubo, colisão e terceiros) já está inclusa no valor da diária. Limite de 600km por período (R$ 0,50/km excedente).
                  </p>
                </div>
              )}

              {/* FOOTER FIXO (STICKY ML) */}
              <div className="fixed bottom-0 left-0 right-0 z-50 bg-black/95 sm:bg-[#121214] border-t border-white/10 sm:border-none p-4 sm:p-0 sm:static sm:mt-12 backdrop-blur-xl sm:backdrop-blur-none">
                <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">
                  
                  {/* Resumo do Preço */}
                  <div className="flex justify-between sm:flex-col w-full sm:w-auto items-center sm:items-start">
                    <span className="text-slate-400 text-sm font-medium">Total estimado ({plan === 'pf' ? `${totals.days} dias` : `${totals.weeks} sem.`})</span>
                    <div className="text-3xl font-bold text-primary">
                      R$ {totals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  {/* Botão de Confirmação */}
                  <button
                    onClick={handleConfirm}
                    disabled={!!error || !dateStart || !dateEnd}
                    className="w-full sm:w-auto px-10 py-4 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-xl transition-all disabled:opacity-30 disabled:grayscale disabled:cursor-not-allowed hover:bg-white hover:scale-[1.02] active:scale-95 flex items-center justify-center shadow-2xl shadow-primary/20"
                  >
                    <span className="material-symbols-outlined mr-2">check_circle</span>
                    Confirmar Reserva
                  </button>
                </div>
                
                {/* Mensagem de Erro Global */}
                {error && (
                  <div className="text-red-400 text-[10px] font-bold mt-3 text-center sm:text-left animate-pulse flex items-center justify-center sm:justify-start gap-2">
                    <span className="material-symbols-outlined text-sm">warning</span>
                    {error}
                  </div>
                )}
              </div>

            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
