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

      <main className="flex-grow pt-20 min-h-screen bg-booking-radial">
        <div className="max-w-[1600px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-5 items-start">
          
          {/* LEFT: FILTER SIDEBAR */}
          <aside className="w-full lg:w-[240px] shrink-0 lg:sticky lg:top-24 flex flex-col gap-4">
            <div className="glass-panel rounded-2xl p-5 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">filter_list</span>
                  <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Filtros</span>
                </div>
                <button onClick={resetFilters} className="text-sm text-primary/70 hover:text-primary transition-colors uppercase tracking-wide">Limpar</button>
              </div>

              <div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[16px]">search</span>
                  <input type="text" placeholder="Buscar modelo..." value={search} onChange={e => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/5 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/40 transition-colors" />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Categoria</p>
                <div className="flex flex-col gap-1">
                  {['econômico', 'sedan', 'suv', 'família', 'premium'].map(cat => (
                    <label key={cat} className="filter-check">
                      <input type="checkbox" checked={categories.includes(cat)} onChange={() => toggleCategory(cat)} />
                      <span className="capitalize">{cat}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Preço Máximo / Dia</p>
                <p className="text-primary font-bold text-base mb-3">R$ <span>{maxPrice}</span></p>
                <input type="range" className="range-slider" min="50" max="1300" step="10" value={maxPrice} onChange={e => setMaxPrice(Number(e.target.value))}
                   aria-label="Preço máximo por dia"
                  style={{ '--pct': `${((maxPrice - 50) / (1300 - 50)) * 100}%` } as any} />
                <div className="flex justify-between text-sm text-gray-600 mt-1">
                  <span>R$50</span><span>R$1300</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Características</p>
                <div className="flex flex-col gap-1">
                  {Object.entries(FEAT_LABELS).map(([key, label]) => (
                    <label key={key} className="filter-check">
                      <input type="checkbox" checked={features.includes(key)} onChange={() => toggleFeature(key)} />
                      <span>{label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <p className="text-xs text-gray-600 border-t border-white/5 pt-4"><span>{filteredCars.length}</span> veículos encontrados</p>
            </div>
          </aside>

          {/* CENTER: CAR GRID */}
          <div className="flex-1 min-w-0 relative">
            <div className="bg-text-decoration">FLEXLOC</div>

            <div className="mb-10 relative z-10">
              <div className="flex items-center gap-3 mb-6 text-[11px] font-bold tracking-[0.25em] uppercase text-gray-500">
                <span>01</span>
                <span className="w-8 h-[1px] bg-gray-700"></span>
                <span className="text-primary">Seleção de Frota</span>
              </div>
              <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-light mb-4 tracking-tighter leading-none">
                Selecione seu <br /><span className="font-semibold text-transparent text-gradient-animate">Veículo Ideal.</span>
              </h1>
              <p className="text-gray-500 text-base font-light max-w-lg leading-relaxed tracking-wide font-sans">
                Escolha entre carros econômicos, confortáveis, utilitários e SUVs. Todos revisados e preparados para oferecer economia, segurança e praticidade no seu dia a dia.
              </p>
            </div>

            <div className="flex items-center justify-end mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600 uppercase tracking-[0.15em]">Ordenar:</span>
                <select value={sort} onChange={e => setSort(e.target.value)}
                  aria-label="Ordenar veículos"
                  className="bg-white/5 border border-white/10 text-xs text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary/40">
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                  <option value="name">Nome A-Z</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mt-2">
              {filteredCars.map(c => {
                let displayPrice: number | string = '-';
                let priceLabel = 'Por semana';
                let unavailable = false;

                if (plan === 'pf') {
                  displayPrice = c.priceDay;
                  priceLabel = 'Por dia';
                  unavailable = !c.availablePF;
                } else {
                  const pricing = c.pricingApp?.[location as 'fsa' | 'ssa'];
                  const price = pricing?.[mileageFranchise];
                  displayPrice = price ?? '-';
                  
                  // Only mark as totally unavailable if it has NO pricing for this city at all
                  const hasAnyPricing = pricing && (pricing.k3 !== null || pricing.k6 !== null || pricing.free !== null);
                  unavailable = !hasAnyPricing;
                  
                  // If it has pricing but not for THIS franchise, we'll handle it in the display
                  const isFranchiseUnavailable = pricing && pricing[mileageFranchise] === null;
                  if (isFranchiseUnavailable && !unavailable) {
                    displayPrice = 'Troque a franquia';
                  } else if (pricing && !isFranchiseUnavailable) {
                    displayPrice = pricing[mileageFranchise]!;
                  }
                }

                const isSelected = selectedCarId === c.id;

                return (
                  <div key={c.id} onClick={() => !unavailable && setSelectedCarId(c.id)}
                    className={`group car-card rounded-3xl p-6 flex flex-col relative transition-all duration-300 ${unavailable ? 'opacity-40 pointer-events-none' : 'cursor-pointer hover:shadow-2xl hover:shadow-primary/10'} ${isSelected ? 'bg-white/[0.06] border border-primary/30' : 'bg-white/[0.03] border border-white/5'}`}>
                    <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none transition-opacity group-hover:opacity-100 opacity-0"></div>
                    <div className="relative h-48 w-full -mt-4 mb-4 flex items-center justify-center z-10">
                      <img src={c.img || c.image} decoding="async" loading="lazy" alt={c.name} className="car-img object-contain w-full h-full transition-transform duration-500 group-hover:scale-105" />
                    </div>
                    <div className="flex justify-between items-start mb-6 relative z-10">
                      <div>
                        <span className={`text-[10px] font-black tracking-[0.2em] uppercase ${c.catColor} mb-1 block`}>{c.catLabel}</span>
                        <h3 className="text-white text-2xl font-bold tracking-tight">{c.name}</h3>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-0.5">{priceLabel}</p>
                        <p className={`text-primary font-black ${typeof displayPrice === 'string' && displayPrice.length > 10 ? 'text-sm' : 'text-xl'}`}>
                          {typeof displayPrice === 'number' ? `R$ ${displayPrice}` : displayPrice}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-6 border-t border-white/5 pt-5 relative z-10">
                      {c.feats.slice(0, 3).map(f => (
                        <div key={f} className="flex flex-col items-center gap-2 text-center">
                          <span className="material-symbols-outlined text-gray-400 text-lg font-light">{FEAT_ICONS[f] || 'check_circle'}</span>
                          <span className="text-[9px] text-gray-500 uppercase tracking-widest font-bold">{FEAT_LABELS[f] || f}</span>
                        </div>
                      ))}
                    </div>
                    <button className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${isSelected ? 'bg-primary text-black' : 'bg-white/5 text-white hover:bg-white/10'}`}>
                      {isSelected ? 'Selecionado' : 'Reservar Agora'}
                    </button>
                  </div>
                );
              })}
            </div>

            {filteredCars.length === 0 && (
              <div className="no-results show">
                <span className="material-symbols-outlined text-5xl text-gray-700 block mb-4">directions_car</span>
                <p className="text-gray-500">Nenhum veículo encontrado com esses filtros.</p>
                <button onClick={resetFilters} className="mt-4 text-primary text-sm underline">Limpar filtros</button>
              </div>
            )}
          </div>

          {/* RIGHT: BOOKING PANEL */}
          <aside className="w-full lg:w-[340px] shrink-0 lg:sticky lg:top-20">
            <div className="glass-panel rounded-[24px] p-4 flex flex-col gap-3 overflow-visible relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-[60px] pointer-events-none rounded-full"></div>

              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent rounded-xl -m-0.5 pointer-events-none"></div>
                <div className="relative flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl border border-white/10 overflow-hidden">
                  <div className="relative w-20 h-16 flex-shrink-0 flex items-center justify-center">
                    <img src={currentCar.img || currentCar.image} decoding="async" loading="lazy" alt="car" className="h-full w-auto object-contain car-img" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-black/40 blur-sm rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/80 block mb-0.5">Veículo</span>
                    <h3 className="text-lg font-black text-white tracking-tight truncate">{currentCar.name}</h3>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-500">Taxa:</span>
                      <p className="text-sm font-black text-white">
                        {(() => {
                          if (plan === 'pf') return `R$ ${currentCar.priceDay}`;
                          const pricing = currentCar.pricingApp?.[location as 'fsa' | 'ssa'];
                          const price = pricing?.[mileageFranchise];
                          return price ? `R$ ${price}` : 'Indisponível';
                        })()}
                        <span className="text-[10px] font-normal text-gray-500">/{plan === 'pf' ? 'dia' : 'sem'}</span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="h-px flex-1 bg-white/5"></span>
                <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-white/90">Configurar <span className="text-primary">Reserva</span></h2>
                <span className="h-px flex-1 bg-white/5"></span>
              </div>

              <div className="space-y-4">
                <label htmlFor="location-btn" className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Local de Retirada</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10 text-primary/70">
                    <span className="material-symbols-outlined text-[18px]">location_on</span>
                  </div>
                  <button id="location-btn" onClick={() => setIsLocationOpen(!isLocationOpen)}
                    className="w-full text-left pl-10 pr-9 py-3.5 bg-white/[0.03] border border-white/10 rounded-2xl text-sm text-white font-medium transition-all hover:bg-white/[0.06] focus:border-primary/50">
                    <span>{location === 'fsa' ? 'Feira de Santana, BA' : 'Salvador, BA'}</span>
                  </button>
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none z-10 text-gray-500">
                    <span className="material-symbols-outlined text-[20px]">expand_more</span>
                  </div>
                  
                  {isLocationOpen && (
                    <div className="absolute z-50 w-full mt-2 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl p-2 backdrop-blur-3xl">
                      <ul className="space-y-1">
                        <li>
                          <button onClick={() => { setLocation('fsa'); setIsLocationOpen(false); }}
                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 hover:text-primary text-gray-300 transition-all flex items-center justify-between font-medium">
                            <span>Feira de Santana, BA</span>
                            <span className="text-[10px] uppercase font-bold text-gray-600">FSA</span>
                          </button>
                        </li>
                        <li>
                          <button onClick={() => { setLocation('ssa'); setIsLocationOpen(false); }}
                            className="w-full text-left px-4 py-3 rounded-xl hover:bg-white/5 hover:text-primary text-gray-300 transition-all flex items-center justify-between font-medium">
                            <span>Salvador, BA</span>
                            <span className="text-[10px] uppercase font-bold text-gray-600">SSA</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Plano de Locação</label>
                <div className="pill-toggle flex bg-black/40 p-1.5 rounded-2xl border border-white/5">
                  <button onClick={() => setPlan('motorista')} className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${plan === 'motorista' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>Motorista de App</button>
                  <button onClick={() => setPlan('pf')} className={`flex-1 py-2.5 text-xs font-semibold rounded-xl transition-all ${plan === 'pf' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>Pessoa Física</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label htmlFor="date-start" className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 flex justify-between">
                    Início
                    {plan === 'motorista' ? (
                      <span className="text-[9px] font-black text-primary animate-pulse">Min. 7d</span>
                    ) : (
                      <span className="text-[9px] font-black text-primary animate-pulse">Min. 3d</span>
                    )}
                  </label>
                  <div className={`relative group ${isCalendarStartOpen ? 'z-[60]' : 'z-10'}`} ref={calendarStartRef}>
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 transition-colors group-hover:text-primary z-10">
                      <span className="material-symbols-outlined text-[16px]">calendar_today</span>
                    </div>
                    <button
                      id="date-start-btn"
                      type="button"
                      onClick={() => {
                        setIsCalendarStartOpen(!isCalendarStartOpen);
                        setIsCalendarEndOpen(false);
                      }}
                      className={`w-full text-left pl-9 pr-2 py-3 bg-white/[0.03] border rounded-xl text-xs text-white cursor-pointer font-bold focus:border-primary/50 transition-all relative z-0 ${isCalendarStartOpen ? 'border-primary/50 ring-1 ring-primary/50' : 'border-white/10'}`}
                    >
                      {selectedDateStart ? selectedDateStart.toLocaleDateString('pt-BR') : "dd/mm/aa"}
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
                </div>
                <div className="space-y-2 relative">
                  <label htmlFor="time-start-btn" className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Hora</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 transition-colors group-hover:text-primary">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                    </div>
                    <button id="time-start-btn" aria-label="Hora de Início" onClick={() => setIsTimeStartOpen(!isTimeStartOpen)}
                      className="w-full text-left pl-9 pr-8 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white font-bold transition-all focus:border-primary/50">
                      <span>{timeStart}</span>
                    </button>
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-500">
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </div>
                    {isTimeStartOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                        <ul className="p-2 text-sm font-medium text-gray-400 flex flex-col gap-1">
                          {timeOptions.map(t => (
                            <li key={t}>
                              <button type="button" onClick={() => { setTimeStart(t); setIsTimeStartOpen(false); }}
                                className="w-full text-center px-2 py-2 hover:text-primary hover:bg-white/5 rounded-lg transition-all duration-150 cursor-pointer">
                                {t}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                  <label htmlFor="date-end" className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1 flex justify-between">
                    Fim
                    {plan === 'motorista' && <span className="text-[9px] font-black text-primary">Ciclo Semanal</span>}
                  </label>
                  <div className={`relative group ${isCalendarEndOpen ? 'z-[60]' : 'z-10'}`} ref={calendarEndRef}>
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 transition-colors group-hover:text-primary z-10">
                      <span className="material-symbols-outlined text-[16px]">event_repeat</span>
                    </div>
                    <button
                      id="date-end-btn"
                      type="button"
                      onClick={() => {
                        setIsCalendarEndOpen(!isCalendarEndOpen);
                        setIsCalendarStartOpen(false);
                      }}
                      className={`w-full text-left pl-9 pr-2 py-3 bg-white/[0.03] border rounded-xl text-xs text-white cursor-pointer font-bold focus:border-primary/50 transition-all relative z-0 ${isCalendarEndOpen ? 'border-primary/50 ring-1 ring-primary/50' : 'border-white/10'}`}
                    >
                      {selectedDateEnd ? selectedDateEnd.toLocaleDateString('pt-BR') : "dd/mm/aa"}
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
                </div>
                <div className="space-y-2 relative">
                  <label htmlFor="time-end-btn" className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em] ml-1">Hora</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none text-gray-500 transition-colors group-hover:text-primary">
                      <span className="material-symbols-outlined text-[16px]">schedule</span>
                    </div>
                    <button id="time-end-btn" aria-label="Hora de Fim" onClick={() => setIsTimeEndOpen(!isTimeEndOpen)}
                      className="w-full text-left pl-9 pr-8 py-3 bg-white/[0.03] border border-white/10 rounded-xl text-xs text-white font-bold transition-all focus:border-primary/50">
                      <span>{timeEnd}</span>
                    </button>
                    <div className="absolute inset-y-0 right-2 flex items-center pointer-events-none text-gray-500">
                      <span className="material-symbols-outlined text-[18px]">expand_more</span>
                    </div>
                    {isTimeEndOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-[#0A0A0A] border border-white/10 rounded-2xl shadow-2xl max-h-48 overflow-y-auto custom-scrollbar">
                        <ul className="p-2 text-sm font-medium text-gray-400 flex flex-col gap-1">
                          {timeOptions.map(t => (
                            <li key={t}>
                              <button type="button" onClick={() => { setTimeEnd(t); setIsTimeEndOpen(false); }}
                                className="w-full text-center px-2 py-2 hover:text-primary hover:bg-white/5 rounded-lg transition-all duration-150 cursor-pointer">
                                {t}
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {plan === 'pf' ? (
                <div className="space-y-4">
                  <div className="p-4 bg-primary/10 border border-primary/20 rounded-2xl">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="material-symbols-outlined text-primary">shield</span>
                      <span className="text-xs font-black text-white uppercase tracking-wider">Proteção Inclusa</span>
                    </div>
                    <p className="text-[10px] text-gray-400 leading-relaxed">
                      Para sua tranquilidade, a proteção total (roubo, colisão e terceiros) já está inclusa no valor da diária.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                      <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">Limite de KM</p>
                      <p className="text-xs font-black text-white">600km/período</p>
                    </div>
                    <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl">
                      <p className="text-[8px] font-bold text-gray-500 uppercase mb-1">KM Excedente</p>
                      <p className="text-xs font-black text-white">R$ 0,50/km</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                    Franquia de Kilometragem
                    <span className="material-symbols-outlined text-[12px] text-primary/60">speed</span>
                  </label>
                  <div className="space-y-2">
                    {[
                      { id: 'k3', label: '3.000km/mês', desc: 'Ideal para rodar pouco.' },
                      { id: 'k6', label: '6.000km/mês', desc: 'Para quem roda bastante.' },
                      { id: 'free', label: 'KM Livre/mês', desc: 'Sem limites de rodagem.' }
                    ].map(f => {
                      const pricing = currentCar.pricingApp?.[location as 'fsa' | 'ssa'];
                      const price = pricing?.[f.id as 'k3' | 'k6' | 'free'];
                      const isAvailable = price != null;
                      
                      return (
                        <label key={f.id} className={`insurance-card flex items-center gap-3 p-2.5 rounded-xl border border-white/10 bg-white/[0.03] cursor-pointer group ${mileageFranchise === f.id ? 'active' : ''} ${!isAvailable ? 'opacity-30 pointer-events-none' : ''}`}>
                          <input type="radio" name="franchise" value={f.id} checked={mileageFranchise === f.id} onChange={() => setMileageFranchise(f.id as any)} disabled={!isAvailable} />
                          <div className="check-circle scale-90"></div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-black text-white uppercase tracking-wider">{f.label}</span>
                              <span className="text-[10px] font-black text-primary">R$ {price}<span className="text-[8px] font-normal text-gray-500">/sem</span></span>
                            </div>
                            <p className="text-[9px] text-gray-500 leading-tight group-hover:text-gray-400 transition-colors">{f.desc}</p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                  <p className="text-[9px] text-primary/80 font-bold text-center mt-2">* Desconto de R$100,00 de pontualidade na semana</p>
                </div>
              )}

              <div className="mt-1 pt-3 border-t border-white/5 space-y-2">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-semibold tracking-wide">
                    <span className="text-gray-500 uppercase">Locação ({plan === 'pf' ? `${totals.days} dias` : `${totals.weeks} sem.`})</span>
                    <span className="text-white">R$ {totals.carTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-[10px] font-semibold tracking-wide">
                    <span className="text-gray-500 uppercase">Proteção</span>
                    <span className="text-emerald-400 font-black uppercase">Inclusa</span>
                  </div>
                  <div className="flex justify-between items-center bg-white/[0.03] px-2 py-1.5 rounded-lg border border-white/5">
                    <span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Período Total</span>
                    <span className="summary-badge text-[9px] px-1.5 py-0.5">{plan === 'pf' ? `${totals.days} dia(s)` : `${totals.weeks} semana(s) (${totals.days} dias)`}</span>
                  </div>
                </div>

                <div className="flex justify-between items-baseline pt-1">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Total Estimado</span>
                    <span className="text-[8px] text-primary/60 font-medium">Impostos inclusos</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-white tracking-tighter transition-all duration-300">R$ {totals.total.toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-xs font-bold text-center mt-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20">{error}</p>
                )}

                {warning && (
                  <p className="text-yellow-500 text-xs font-bold text-center mt-2 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">{warning}</p>
                )}

                <button onClick={handleConfirm} className="btn-confirm w-full py-3 rounded-xl flex items-center justify-center gap-2 active:scale-95 text-xs">
                  <span>Confirmar Reserva</span>
                  <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
