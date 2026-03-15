import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CARS } from '../constants';
import { Calendar } from '../components/Calendar';

const FEAT_LABELS: Record<string, string> = { 
  ar: 'Ar Condicionado', 
  gnv: 'GNV Gen5', 
  multimidia: 'Multimídia', 
  automatico: 'Automático' 
};

const FEAT_ICONS_MAP: Record<string, string> = {
  ar: 'ac_unit',
  automatico: 'auto_transmission',
  gnv: 'local_gas_station',
  multimidia: 'settings_system_daydream'
};

export default function Book() {
  const [searchParams] = useSearchParams();
  const qLoc = (searchParams.get('loc') || 'fsa') as 'fsa' | 'ssa';
  const qPlan = (searchParams.get('plan') || 'motorista') as 'motorista' | 'pf';
  const qDateStart = searchParams.get('dateStart') || '';
  const qDateEnd = searchParams.get('dateEnd') || '';
  const qTimeStart = searchParams.get('timeStart') || '09:00';
  const qTimeEnd = searchParams.get('timeEnd') || '09:00';

  const [location, setLocation] = useState<'fsa' | 'ssa'>(qLoc);
  const [plan, setPlan] = useState<'motorista' | 'pf'>(qPlan);
  const [timeStart, setTimeStart] = useState(qTimeStart);
  const [timeEnd, setTimeEnd] = useState(qTimeEnd);
  const [insuranceRate, setInsuranceRate] = useState(45);
  const [mileageFranchise, setMileageFranchise] = useState<'k3' | 'k6' | 'free'>('k3');

  const [dateStart, setDateStart] = useState(qDateStart);
  const [dateEnd, setDateEnd] = useState(qDateEnd);
  const [selectedDateStart, setSelectedDateStart] = useState<Date | null>(qDateStart ? new Date(qDateStart + 'T12:00:00') : null);
  const [selectedDateEnd, setSelectedDateEnd] = useState<Date | null>(qDateEnd ? new Date(qDateEnd + 'T12:00:00') : null);

  const [viewDateStart, setViewDateStart] = useState(selectedDateStart || new Date());
  const [viewDateEnd, setViewDateEnd] = useState(selectedDateEnd || new Date());

  const [isCalendarStartOpen, setIsCalendarStartOpen] = useState(false);
  const [isCalendarEndOpen, setIsCalendarEndOpen] = useState(false);
  const [isTimeStartOpen, setIsTimeStartOpen] = useState(false);
  const [isTimeEndOpen, setIsTimeEndOpen] = useState(false);

  const calendarStartRef = useRef<HTMLDivElement>(null);
  const calendarEndRef = useRef<HTMLDivElement>(null);

  const [selectedCarId, setSelectedCarId] = useState<number>(1);
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<string[]>([]);
  const [features, setFeatures] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(1300);
  const [sort, setSort] = useState('price-asc');

  const currentCar = useMemo(() => CARS.find(c => c.id === selectedCarId) || CARS[0], [selectedCarId]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (calendarStartRef.current && !calendarStartRef.current.contains(event.target as Node)) {
        setIsCalendarStartOpen(false);
      }
      if (calendarEndRef.current && !calendarEndRef.current.contains(event.target as Node)) {
        setIsCalendarEndOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const totalDays = useMemo(() => {
    if (!selectedDateStart || !selectedDateEnd) return 0;
    const diff = selectedDateEnd.getTime() - selectedDateStart.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [selectedDateStart, selectedDateEnd]);

  const error = useMemo(() => {
    if (!selectedDateStart || !selectedDateEnd) return null;
    if (selectedDateEnd < selectedDateStart) return "A devolução não pode ser anterior à retirada.";
    return null;
  }, [selectedDateStart, selectedDateEnd]);

  const warning = useMemo(() => {
    if (plan === 'motorista' && totalDays > 0 && totalDays % 7 !== 0) {
      return "Para motoristas, o aluguel funciona em ciclos de 7 dias.";
    }
    return null;
  }, [plan, totalDays]);

  const filteredCars = useMemo(() => {
    let result = CARS.filter(car => {
      const matchesSearch = car.name.toLowerCase().includes(search.toLowerCase());
      const matchesCat = categories.length === 0 || categories.includes(car.category);
      const matchesFeat = features.every(f => car.feats?.includes(f));
      const price = plan === 'pf' ? car.priceDay : (car.pricingApp?.[location]?.[mileageFranchise] || 0);
      return matchesSearch && matchesCat && matchesFeat && price <= maxPrice;
    });

    if (sort === 'price-asc') {
      result.sort((a, b) => {
        const pA = plan === 'pf' ? a.priceDay : (a.pricingApp?.[location]?.[mileageFranchise] || 0);
        const pB = plan === 'pf' ? b.priceDay : (b.pricingApp?.[location]?.[mileageFranchise] || 0);
        return pA - pB;
      });
    } else if (sort === 'price-desc') {
      result.sort((a, b) => {
        const pA = plan === 'pf' ? a.priceDay : (a.pricingApp?.[location]?.[mileageFranchise] || 0);
        const pB = plan === 'pf' ? b.priceDay : (b.pricingApp?.[location]?.[mileageFranchise] || 0);
        return pB - pA;
      });
    } else {
      result.sort((a, b) => a.name.localeCompare(b.name));
    }

    return result;
  }, [search, categories, features, maxPrice, sort, plan, location, mileageFranchise]);

  const totals = useMemo(() => {
    let days = totalDays;
    let carTotal = 0;
    let weeks = 0;
    if (plan === 'pf') {
      carTotal = currentCar.priceDay * days;
    } else {
      const pricing = currentCar.pricingApp?.[location];
      const weeklyPrice = pricing?.[mileageFranchise] || 0;
      weeks = Math.max(1, Math.round(days / 7));
      carTotal = weeklyPrice * weeks;
    }
    const insRate = plan === 'pf' ? insuranceRate : 0;
    const insTotal = insRate * days;
    const finalCarTotal = isNaN(carTotal) ? 0 : carTotal;
    const total = finalCarTotal + insTotal;
    return { days, weeks, carTotal: finalCarTotal, insTotal, total };
  }, [totalDays, plan, currentCar, location, mileageFranchise, insuranceRate]);

  const handleSelectStart = (date: Date) => {
    setSelectedDateStart(date);
    setDateStart(date.toISOString().split('T')[0]);
    if (selectedDateEnd && date > selectedDateEnd) {
      setSelectedDateEnd(null);
      setDateEnd('');
    }
  };

  const handleSelectEnd = (date: Date) => {
    setSelectedDateEnd(date);
    setDateEnd(date.toISOString().split('T')[0]);
  };

  const isStartDateDisabled = useCallback((date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today || date.getDay() === 0;
  }, []);

  const isEndDateDisabled = useCallback((date: Date) => {
    if (!selectedDateStart) return date.getDay() === 0;
    const minDate = new Date(selectedDateStart);
    if (plan === 'motorista') {
      minDate.setDate(minDate.getDate() + 7);
    } else {
      minDate.setDate(minDate.getDate() + 1);
    }
    return date < minDate || date.getDay() === 0;
  }, [selectedDateStart, plan]);

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

  const handleConfirm = () => {
    if (error || !dateStart || !dateEnd) return;
    const msg = `Olá! Gostaria de confirmar uma reserva:
*Veículo:* ${currentCar.name}
*Local:* ${location === 'fsa' ? 'Feira de Santana' : 'Salvador'}
*Plano:* ${plan === 'pf' ? 'Pessoa Física' : 'Motorista de App'}
*Retirada:* ${selectedDateStart?.toLocaleDateString('pt-BR')} às ${timeStart}
*Devolução:* ${selectedDateEnd?.toLocaleDateString('pt-BR')} às ${timeEnd}
*Total Estimado:* R$ ${totals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}

Aguardo retorno!`;
    window.open(`https://wa.me/5575981333333?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const timeOptions = useMemo(() => {
    const times = [];
    for (let h = 9; h <= 18; h++) {
      times.push(`${String(h).padStart(2, '0')}:00`);
      if (h < 18) times.push(`${String(h).padStart(2, '0')}:30`);
    }
    return times;
  }, []);

  return (
    <div className="text-white min-h-screen flex flex-col bg-black selection:bg-primary selection:text-black">
      <style>{`
        #spotlight {
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 9999;
            background: radial-gradient(700px circle at var(--x, 50%) var(--y, 50%), rgba(230, 197, 25, 0.04) 0%, rgba(0, 0, 0, 0) 60%);
            mix-blend-mode: plus-lighter;
        }
        .bg-text-decoration {
            position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
            font-size: 12vw; font-weight: 900; color: rgba(255, 255, 255, 0.015);
            pointer-events: none; z-index: 0; white-space: nowrap; letter-spacing: -0.05em; user-select: none;
        }
        .glass-panel {
            background: rgba(255, 255, 255, 0.03); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
            border: 1px solid rgba(255, 255, 255, 0.07); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.3);
        }
        .card-glass {
            background: rgba(20, 20, 20, 0.55); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.07); box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
            transition: all 0.4s cubic-bezier(.2, .8, .2, 1);
        }
        .card-glass:hover { border-color: rgba(255, 217, 0, 0.4); transform: translateY(-8px); box-shadow: 0 30px 60px rgba(0, 0, 0, 0.8), 0 0 50px rgba(255, 217, 0, 0.1); }
        .card-glass.selected { border-color: rgba(255, 217, 0, 0.6); box-shadow: 0 0 0 2px rgba(255, 217, 0, 0.4), 0 24px 48px rgba(0, 0, 0, 0.7); }
        .car-img { transition: transform 0.5s cubic-bezier(.34, 1.56, .64, 1); filter: drop-shadow(0 20px 30px rgba(0, 0, 0, 0.8)); }
        .card-glass:hover .car-img { transform: scale(1.1) translateY(-8px); }
        .btn-select {
            width: 100%; padding: 12px; border-radius: 10px; font-size: 11px; font-weight: 700;
            letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; border: 1px solid rgba(255, 255, 255, 0.1);
            background: rgba(255, 255, 255, 0.06); color: #fff; transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .btn-select:hover { background: #ffd900; color: #0e0e0e; border-color: #ffd900; box-shadow: 0 0 24px rgba(255, 217, 0, 0.35); }
        .btn-select.active-btn { background: #ffd900; color: #0e0e0e; border-color: #ffd900; }
        .filter-check { display: flex; align-items: center; gap: 8px; cursor: pointer; padding: 6px 0; }
        .range-slider {
            -webkit-appearance: none; appearance: none; width: 100%; height: 3px; border-radius: 2px;
            background: linear-gradient(to right, #ffd900 var(--pct, 50%), rgba(255, 255, 255, 0.1) var(--pct, 50%)); outline: none;
        }
        .range-slider::-webkit-slider-thumb {
            -webkit-appearance: none; width: 16px; height: 16px; border-radius: 50%;
            background: #ffd900; cursor: pointer; box-shadow: 0 0 8px rgba(255, 217, 0, 0.5);
        }
        .text-gradient-animate {
            background-size: 200% auto; -webkit-background-clip: text; -webkit-text-fill-color: transparent;
            background-clip: text; text-fill-color: transparent;
            background-image: linear-gradient(to right, #ffffff, #e6c519, #ffffff);
            transition: background-position 0.5s ease-out;
        }
        .animate-gradient { animation: gradient-move 3s linear infinite; }
        @keyframes gradient-move { 0% { background-position: 0% center; } 100% { background-position: 200% center; } }
      `}</style>
      
      <div id="spotlight"></div>
      
      <header className="fixed top-0 left-0 right-0 z-50 glass-panel border-b-white/5">
        <div className="max-w-[1600px] mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="hover:opacity-80 transition-opacity">
            <img src="/images/logo.png" alt="FlexLoc" className="h-7 w-auto object-contain" />
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
        <div className="max-w-[1600px] mx-auto px-4 py-6 flex flex-col lg:flex-row gap-5 items-start pb-40 lg:pb-6 relative">
          
          {/* COLUNA 1: FILTROS */}
          <aside className="w-full lg:w-[240px] shrink-0 lg:sticky lg:top-24 flex flex-col gap-4 z-20">
            <div className="glass-panel rounded-2xl p-5 flex flex-col gap-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary text-base">filter_list</span>
                  <span className="text-sm font-semibold uppercase tracking-[0.2em] text-gray-400">Filtros</span>
                </div>
                <button onClick={resetFilters} className="text-[10px] text-primary/70 hover:text-primary transition-colors uppercase font-bold tracking-wide">Limpar</button>
              </div>

              <div>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-[16px] group-hover:text-primary transition-colors">search</span>
                  <input 
                    type="text" 
                    placeholder="Buscar modelo..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-white/[0.04] border border-white/5 rounded-lg text-xs text-white placeholder-gray-600 focus:outline-none focus:border-primary/40 transition-all font-medium" 
                  />
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Categoria</p>
                <div className="flex flex-col gap-1">
                  {[
                    { val: 'econômico', label: 'Econômicos', color: 'text-emerald-400' },
                    { val: 'sedan', label: 'Comfort', color: 'text-blue-400' },
                    { val: 'suv', label: 'Black', color: 'text-amber-400' },
                    { val: 'família', label: 'Família', color: 'text-purple-400' },
                    { val: 'premium', label: 'Utilitários', color: 'text-orange-400' }
                  ].map(cat => (
                    <label key={cat.val} className="filter-check group">
                      <input 
                        type="checkbox" 
                        checked={categories.includes(cat.val)} 
                        onChange={() => toggleCategory(cat.val)} 
                        className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="group-hover:text-white transition-colors">{cat.label}</span>
                      <span className={`ml-auto text-[10px] font-bold ${cat.color} opacity-0 group-hover:opacity-100`}>•</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2">Preço Máximo / {plan === 'pf' ? 'Dia' : 'Semana'}</p>
                <p className="text-primary font-bold text-base mb-3">R$ <span>{maxPrice}</span></p>
                <input 
                  type="range" 
                  min="50" 
                  max="1300" 
                  step="10" 
                  value={maxPrice} 
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="range-slider" 
                  style={{'--pct': `${((maxPrice - 50) / (1300 - 50)) * 100}%`} as any}
                />
                <div className="flex justify-between text-[10px] text-gray-600 mt-1 uppercase font-bold tracking-widest">
                  <span>R$50</span>
                  <span>R$1300</span>
                </div>
              </div>

              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-3">Características</p>
                <div className="flex flex-col gap-1">
                  {['ar', 'automatico', 'gnv', 'multimidia'].map(f => (
                    <label key={f} className="filter-check group">
                      <input 
                        type="checkbox" 
                        checked={features.includes(f)} 
                        onChange={() => toggleFeature(f)} 
                        className="rounded border-white/10 bg-white/5 text-primary focus:ring-primary h-4 w-4"
                      />
                      <span className="group-hover:text-white transition-colors uppercase text-[10px] tracking-widest font-bold text-gray-400 group-hover:text-gray-300">
                        {FEAT_LABELS[f]}
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-gray-600">
                  <span className="text-primary">{filteredCars.length}</span> veículos encontrados
                </p>
              </div>
            </div>
          </aside>

          {/* COLUNA 2: LISTAGEM DE FROTA */}
          <div className="flex-1 w-full min-w-0 relative">
            <div className="bg-text-decoration select-none">FLEXLOC</div>

            <div className="mb-10 relative z-10 text-center lg:text-left">
              <div className="flex items-center justify-center lg:justify-start gap-3 mb-6 text-[11px] font-bold tracking-[0.25em] uppercase text-gray-500">
                <span>01</span><span className="w-8 h-[1px] bg-gray-700"></span><span className="text-primary">Seleção de Frota</span>
              </div>
              <h1 className="text-white text-3xl md:text-4xl lg:text-5xl font-light mb-4 tracking-tighter leading-none">
                Selecione seu <br /><span className="font-semibold text-transparent text-gradient-animate animate-gradient">Veículo Ideal.</span>
              </h1>
              <p className="text-gray-500 text-sm font-light max-w-lg mx-auto lg:mx-0 leading-relaxed tracking-wide">
                Escolha entre carros econômicos, confortáveis, utilitários e SUVs. Todos revisados e preparados para oferecer economia, segurança e praticidade.
              </p>
            </div>

            <div className="flex items-center justify-center lg:justify-end mb-6 relative z-10">
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-gray-600 uppercase tracking-[0.15em] font-bold">Ordenar:</span>
                <select 
                  value={sort} 
                  onChange={(e) => setSort(e.target.value)}
                  className="bg-white/5 border border-white/10 text-[10px] font-bold uppercase tracking-widest text-white rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary/40 appearance-none cursor-pointer"
                >
                  <option value="price-asc">Menor Preço</option>
                  <option value="price-desc">Maior Preço</option>
                  <option value="name">Nome A-Z</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mt-2 relative z-10">
              {filteredCars.map(car => (
                <div 
                  key={car.id} 
                  onClick={() => setSelectedCarId(car.id)}
                  className={`group car-card card-glass rounded-2xl p-6 pt-0 flex flex-col relative transition-all duration-300 ${selectedCarId === car.id ? 'selected bg-white/[0.06]' : 'cursor-pointer hover:bg-white/[0.04]'}`}
                >
                  <div className="absolute -right-6 -top-6 w-32 h-32 bg-primary/8 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="relative h-44 w-full -mt-4 mb-2 flex items-center justify-center z-10">
                    <img src={car.img || car.image} alt={car.name} className="car-img object-contain w-full h-full"/>
                  </div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div>
                      <span className={`text-[10px] font-bold tracking-widest uppercase ${car.catColor} mb-1 block`}>{car.catLabel}</span>
                      <h3 className="text-white text-xl md:text-2xl font-semibold tracking-tight uppercase leading-tight">{car.name}</h3>
                    </div>
                    <div className="text-right">
                      <p className="text-gray-500 text-[10px] uppercase tracking-widest mb-0.5">{plan === 'pf' ? 'Diária' : 'Semana'}</p>
                      <p className="text-primary text-xl font-bold">
                        R$ {plan === 'pf' ? car.priceDay : car.pricingApp?.[location]?.[mileageFranchise] ?? '-'}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-5 border-t border-white/5 pt-4 relative z-10">
                    {car.feats.slice(0, 3).map(f => (
                      <div key={f} className="flex flex-col items-center gap-1.5 text-center">
                        <span className="material-symbols-outlined text-gray-400 text-base font-light">{FEAT_ICONS_MAP[f] || 'check_circle'}</span>
                        <span className="text-[10px] text-gray-500 uppercase tracking-wide font-bold">{FEAT_LABELS[f] || f}</span>
                      </div>
                    ))}
                  </div>
                  <button className={`btn-select ${selectedCarId === car.id ? 'active-btn' : ''}`}>
                    {selectedCarId === car.id ? (
                      <><span className="material-symbols-outlined text-base">check_circle</span> Selecionado</>
                    ) : (
                      <>Reservar Agora <span className="material-symbols-outlined text-base">arrow_forward</span></>
                    )}
                  </button>
                </div>
              ))}
            </div>

            {filteredCars.length === 0 && (
              <div className="py-20 text-center relative z-10">
                <span className="material-symbols-outlined text-5xl text-gray-700 block mb-4">directions_car</span>
                <p className="text-gray-500 font-bold uppercase tracking-[0.2em]">Nenhum veículo encontrado.</p>
                <button onClick={resetFilters} className="mt-4 text-primary text-xs underline uppercase tracking-widest font-black">Limpar filtros</button>
              </div>
            )}
          </div>

          {/* COLUNA 3: SUMMARY & CHECKOUT */}
          <aside className="w-full lg:w-[340px] shrink-0 lg:sticky lg:top-20 z-30">
            <div className="glass-panel rounded-[24px] p-4 flex flex-col gap-3 overflow-visible relative">
              <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary/10 blur-[60px] pointer-events-none rounded-full"></div>

              {/* Preview Carro Selecionado */}
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-transparent rounded-xl -m-0.5 pointer-events-none"></div>
                <div className="relative flex items-center gap-3 p-3 bg-white/[0.04] rounded-xl border border-white/10 overflow-hidden">
                  <div className="relative w-24 h-16 flex-shrink-0 flex items-center justify-center">
                    <img src={currentCar.img || currentCar.image} alt="car" className="h-full w-auto object-contain car-img" />
                    <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-16 h-1 bg-black/40 blur-sm rounded-full"></div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-primary/80 block mb-1">Veículo Selecionado</span>
                    <h3 className="text-xl font-black text-white tracking-tight truncate uppercase leading-none">{currentCar.name}</h3>
                    <div className="flex items-baseline gap-1 mt-1">
                      <p className="text-sm font-black text-white">
                        R$ {plan === 'pf' ? currentCar.priceDay : currentCar.pricingApp?.[location]?.[mileageFranchise] ?? '-'}
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

              {/* Localização */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Local de Retirada</label>
                <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
                  <button onClick={() => setLocation('fsa')} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${location === 'fsa' ? 'bg-primary text-black' : 'text-gray-500 hover:text-gray-300'}`}>FSA</button>
                  <button onClick={() => setLocation('ssa')} className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all ${location === 'ssa' ? 'bg-primary text-black' : 'text-gray-500 hover:text-gray-300'}`}>SSA</button>
                </div>
              </div>

              {/* Plano */}
              <div className="space-y-1.5">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Plano de Locação</label>
                <div className="pill-toggle flex bg-black/40 p-1 rounded-xl">
                  <button onClick={() => setPlan('pf')} className={`flex-1 py-1.5 text-[10px] uppercase font-black tracking-widest ${plan === 'pf' ? 'active' : 'text-gray-500'}`}>Pessoa Física</button>
                  <button onClick={() => setPlan('motorista')} className={`flex-1 py-1.5 text-[10px] uppercase font-black tracking-widest ${plan === 'motorista' ? 'active' : 'text-gray-500'}`}>Motorista App</button>
                </div>
              </div>

              {/* Datas e Horas */}
              <div className="grid grid-cols-2 gap-x-3 gap-y-2">
                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Início</label>
                  <div className="relative group" ref={calendarStartRef}>
                    <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-500 z-10 transition-colors group-hover:text-primary">
                      <span className="material-symbols-outlined text-[14px]">calendar_today</span>
                    </div>
                    <button 
                      onClick={() => { setIsCalendarStartOpen(!isCalendarStartOpen); setIsCalendarEndOpen(false); }}
                      className={`w-full text-left pl-8 pr-2 py-2.5 bg-white/[0.03] border rounded-xl text-[11px] text-white font-bold transition-all ${isCalendarStartOpen ? 'border-primary/50 ring-1 ring-primary/50' : 'border-white/10'}`}
                    >
                      {selectedDateStart ? selectedDateStart.toLocaleDateString('pt-BR') : 'Data'}
                    </button>
                    {isCalendarStartOpen && (
                      <div className="absolute z-[100] right-0 mt-2 w-64 shadow-2xl">
                         <Calendar currentMonth={viewDateStart.getMonth()} currentYear={viewDateStart.getFullYear()} startDate={selectedDateStart} endDate={selectedDateEnd} onSelectDate={(d) => { handleSelectStart(d); setIsCalendarStartOpen(false); }} onNavigate={(y, m) => setViewDateStart(new Date(y, m, 1))} isDateDisabled={isStartDateDisabled} label="Início" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Hora</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-500 z-10 transition-colors group-hover:text-primary"><span className="material-symbols-outlined text-[14px]">schedule</span></div>
                    <button onClick={() => setIsTimeStartOpen(!isTimeStartOpen)} className="w-full text-left pl-8 pr-6 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-[11px] text-white font-bold transition-all hover:bg-white/[0.05] focus:outline-none focus:border-primary/40"><span>{timeStart}</span></button>
                    {isTimeStartOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl max-h-40 overflow-y-auto shadow-2xl">
                        <ul className="p-1 space-y-0.5">
                          {timeOptions.map(t => (<li key={t}><button onClick={() => { setTimeStart(t); setIsTimeStartOpen(false); }} className="w-full py-2 text-[10px] font-bold hover:bg-white/5 rounded-lg text-gray-400 hover:text-primary transition-colors">{t}</button></li>))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Fim</label>
                  <div className="relative group" ref={calendarEndRef}>
                    <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-500 z-10 transition-colors group-hover:text-primary"><span className="material-symbols-outlined text-[14px]">event_repeat</span></div>
                    <button 
                      onClick={() => { setIsCalendarEndOpen(!isCalendarEndOpen); setIsCalendarStartOpen(false); }}
                      className={`w-full text-left pl-8 pr-2 py-2.5 bg-white/[0.03] border rounded-xl text-[11px] text-white font-bold transition-all ${isCalendarEndOpen ? 'border-primary/50 ring-1 ring-primary/50' : 'border-white/10'}`}
                    >
                      {selectedDateEnd ? selectedDateEnd.toLocaleDateString('pt-BR') : 'Data'}
                    </button>
                    {isCalendarEndOpen && (
                      <div className="absolute z-[100] right-0 mt-2 w-64 shadow-2xl">
                         <Calendar currentMonth={viewDateEnd.getMonth()} currentYear={viewDateEnd.getFullYear()} startDate={selectedDateStart} endDate={selectedDateEnd} onSelectDate={(d) => { handleSelectEnd(d); setIsCalendarEndOpen(false); }} onNavigate={(y, m) => setViewDateEnd(new Date(y, m, 1))} isDateDisabled={isEndDateDisabled} label="Fim" />
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">Hora</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none text-gray-500 z-10 transition-colors group-hover:text-primary"><span className="material-symbols-outlined text-[14px]">schedule</span></div>
                    <button onClick={() => setIsTimeEndOpen(!isTimeEndOpen)} className="w-full text-left pl-8 pr-6 py-2.5 bg-white/[0.03] border border-white/10 rounded-xl text-[11px] text-white font-bold transition-all hover:bg-white/[0.05] focus:outline-none focus:border-primary/40"><span>{timeEnd}</span></button>
                    {isTimeEndOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-[#0a0a0a] border border-white/10 rounded-xl max-h-40 overflow-y-auto shadow-2xl">
                        <ul className="p-1 space-y-0.5">
                          {timeOptions.map(t => (<li key={t}><button onClick={() => { setTimeEnd(t); setIsTimeEndOpen(false); }} className="w-full py-2 text-[10px] font-bold hover:bg-white/5 rounded-lg text-gray-400 hover:text-primary transition-colors">{t}</button></li>))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Franquia / Proteção */}
              <div className="space-y-2">
                <label className="text-[9px] font-bold text-gray-500 uppercase tracking-[0.2em] ml-1">
                  {plan === 'pf' ? 'Proteção Adicional' : 'Franquia KM'}
                </label>
                <div className="space-y-2">
                  {plan === 'pf' ? (
                    <>
                      <label 
                        className={`insurance-card flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${insuranceRate === 45 ? 'active border-primary bg-primary/5' : 'border-white/10 bg-white/[0.03]'}`}
                        onClick={() => setInsuranceRate(45)}
                      >
                        <div className={`check-circle scale-90 ${insuranceRate === 45 ? 'bg-primary border-primary' : ''}`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center"><span className="text-[10px] font-black text-white uppercase tracking-wider">Proteção Total</span><span className="text-[10px] font-black text-primary">+R$45<span className="text-[8px] font-normal text-gray-500">/dia</span></span></div>
                          <p className="text-[9px] text-gray-500 leading-tight">Roubo, colisão e terceiros.</p>
                        </div>
                      </label>
                      <label 
                        className={`insurance-card flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all ${insuranceRate === 25 ? 'active border-primary bg-primary/5' : 'border-white/10 bg-white/[0.03]'}`}
                        onClick={() => setInsuranceRate(25)}
                      >
                        <div className={`check-circle scale-90 ${insuranceRate === 25 ? 'bg-primary border-primary' : ''}`}></div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-center"><span className="text-[10px] font-black text-white uppercase tracking-wider">Proteção Parcial</span><span className="text-[10px] font-black text-gray-400">+R$25<span className="text-[8px] font-normal text-gray-500">/dia</span></span></div>
                          <p className="text-[9px] text-gray-500 leading-tight">Apenas danos estruturais.</p>
                        </div>
                      </label>
                    </>
                  ) : (
                    <div className="grid grid-cols-3 gap-1">
                      {['k3', 'k6', 'free'].map(fk => (
                        <button key={fk} onClick={() => setMileageFranchise(fk as any)} className={`py-2 rounded-lg border text-[8px] font-black uppercase tracking-widest transition-all ${mileageFranchise === fk ? 'bg-primary border-primary text-black' : 'bg-white/5 border-white/10 text-gray-500 hover:text-white hover:border-white/20'}`}>
                          {fk === 'k3' ? '3k' : fk === 'k6' ? '6k' : 'Livre'}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Footer Checkout */}
              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[10px] font-semibold tracking-wide"><span className="text-gray-500 uppercase">Aluguel do Veículo</span><span className="text-white">R$ {totals.carTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between text-[10px] font-semibold tracking-wide"><span className="text-gray-500 uppercase">Proteção / Taxas</span><span className="text-white">R$ {totals.insTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</span></div>
                  <div className="flex justify-between items-center bg-white/[0.03] px-2 py-1.5 rounded-lg border border-white/5"><span className="text-[9px] font-black uppercase text-gray-500 tracking-wider">Período Total</span><span className="summary-badge text-[9px] px-1.5 py-0.5">{plan === 'pf' ? `${totals.days} dias` : `${totals.weeks} sem.`}</span></div>
                </div>

                <div className="flex justify-between items-end">
                  <span className="text-[9px] font-black text-gray-500 uppercase tracking-[0.2em]">Total Estimado</span>
                  <span className="text-2xl font-black text-white tracking-tighter">
                    R$ {totals.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>

                <button 
                  onClick={handleConfirm} 
                  disabled={!!error || !dateStart || !dateEnd}
                  className="btn-confirm w-full py-4 rounded-xl flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.15em] shadow-xl disabled:opacity-50 disabled:grayscale transition-all hover:scale-[1.02] active:scale-98"
                >
                  <span>Confirmar Reserva</span>
                  <span className="material-symbols-outlined text-[18px]">whatsapp</span>
                </button>
                
                {error && <p className="text-[9px] font-bold text-red-500 text-center animate-pulse">{error}</p>}
                {warning && !error && <p className="text-[9px] font-bold text-yellow-500 text-center">{warning}</p>}
              </div>

            </div>
          </aside>

        </div>
      </main>

      <footer className="bg-black border-t border-white/5 py-12">
        <div className="max-w-[1600px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
            <img src="/images/logo.png" alt="FlexLoc" className="h-6 opacity-40 grayscale" />
            <p className="text-xs text-gray-600 font-medium font-sans">© 2026 FlexLoc S.A. Todos os direitos reservados.</p>
            <div className="flex gap-6">
                <a href="#" className="text-gray-600 hover:text-primary transition-colors"><span className="material-symbols-outlined">share</span></a>
                <a href="#" className="text-gray-600 hover:text-primary transition-colors"><span className="material-symbols-outlined">mail</span></a>
            </div>
        </div>
      </footer>
    </div>
  );
}