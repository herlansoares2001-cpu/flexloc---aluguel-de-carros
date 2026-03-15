import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CARS, TESTIMONIALS } from '../constants';
import { useRentalCalendar } from '../hooks/useRentalCalendar';
import Navbar from '../components/Navbar';

export default function Home() {
  const navigate = useNavigate();
  const [tipo, setTipo] = useState('app');
  const [plan, setPlan] = useState<'motorista' | 'pf'>('motorista');
  const [location, setLocation] = useState('fsa');
  const [locationText, setLocationText] = useState('Feira de Santana, BA');
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [isTimeStartOpen, setIsTimeStartOpen] = useState(false);
  const [isTimeEndOpen, setIsTimeEndOpen] = useState(false);

  const [timeStart, setTimeStart] = useState('10:00');
  const [timeEnd, setTimeEnd] = useState('10:00');
  const [isVideoPlaying, setIsVideoPlaying] = useState(true);

  const {
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
  } = useRentalCalendar(plan, '', '', false);

  const getTimeOptions = (dateStr: string) => {
    const options = [];
    if (!dateStr) {
      for (let h = 9; h <= 17; h++) {
        options.push(`${String(h).padStart(2, '0')}:00`);
        if (h < 17) options.push(`${String(h).padStart(2, '0')}:30`);
      }
      return options;
    }
    
    const date = new Date(dateStr + 'T12:00:00');
    const isSaturday = !isNaN(date.getTime()) && date.getDay() === 6;
    const maxHour = isSaturday ? 12 : 17;

    for (let h = 9; h <= maxHour; h++) {
      options.push(`${String(h).padStart(2, '0')}:00`);
      if (h < maxHour) options.push(`${String(h).padStart(2, '0')}:30`);
    }
    return options;
  };

  const startTimeOptions = getTimeOptions(dateStart);
  const endTimeOptions = getTimeOptions(dateEnd);

  useEffect(() => {
    if (dateStart && timeStart) {
      const d = new Date(dateStart + 'T12:00:00');
      const [h, m] = timeStart.split(':').map(Number);
      if (d.getDay() === 6 && (h > 12 || (h === 12 && m > 0))) {
        setTimeStart('12:00');
      }
    }
  }, [dateStart, timeStart]);

  useEffect(() => {
    if (dateEnd && timeEnd) {
      const d = new Date(dateEnd + 'T12:00:00');
      const [h, m] = timeEnd.split(':').map(Number);
      if (d.getDay() === 6 && (h > 12 || (h === 12 && m > 0))) {
        setTimeEnd('12:00');
      }
    }
  }, [dateEnd, timeEnd]);

  useEffect(() => {
    document.title = "FlexLoc — Aluguel de Carros Inteligente e Sem Burocracia";
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px"
    });

    const animateElements = document.querySelectorAll('.animate-on-scroll, .animate-fade-left, .animate-fade-right, .animate-fade-in');
    animateElements.forEach((el) => observer.observe(el));

    const spotlight = document.getElementById('spotlight');
    const handleMouseMove = (e: MouseEvent) => {
      if (spotlight) {
        spotlight.style.setProperty('--x', `${e.clientX}px`);
        spotlight.style.setProperty('--y', `${e.clientY}px`);
      }
    };
    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      observer.disconnect();
    };
  }, []);

  const handleTipoChange = (newTipo: string) => {
    setTipo(newTipo);
    setPlan(newTipo === 'normal' ? 'pf' : 'motorista');
  };

  const goToBook = async () => {
    if (!validateDates(timeStart, timeEnd)) {
      return;
    }

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
      console.warn('Backend indisponível, seguindo com fallback da validação do frontend.', err);
    }

    const params = new URLSearchParams({ loc: location, tipo, plan, dateStart, dateEnd, timeStart, timeEnd });
    navigate(`/book?${params.toString()}`);
  };

  return (
    <>
      <div id="spotlight"></div>
      <Navbar transparent />

      <main className="relative flex-grow flex items-center justify-center min-h-[90vh] lg:min-h-[95vh] overflow-hidden bg-black">
        <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
          <img src="/images/hero.png" decoding="async" fetchPriority="high" className="absolute inset-0 w-full h-full object-cover" alt="Hero Final Frame" />
          <video 
            id="hero-video" 
            autoPlay 
            muted 
            playsInline 
            preload="auto" 
            poster="/images/hero.png"
            disableRemotePlayback 
            onEnded={() => setIsVideoPlaying(false)}
            style={{ transform: 'translate3d(0, 0, 0) scale(1.01)', willChange: 'transform', backfaceVisibility: 'hidden', imageRendering: '-webkit-optimize-contrast', WebkitFontSmoothing: 'antialiased' } as React.CSSProperties} 
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${isVideoPlaying ? 'opacity-100' : 'opacity-0'}`}
          >
            <source src="/images/videos/Vídeo background.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-background-dark/40"></div>
          <div className="absolute inset-0 hero-gradient"></div>
        </div>
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-10 lg:px-12 pt-28 sm:pt-24 pb-16 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center min-h-[90vh]">
          <div className="flex flex-col gap-5 lg:gap-6 max-w-2xl items-center text-center lg:items-start lg:text-left w-full mx-auto lg:mx-0">
            
            {/* Label Superior */}
            <div className="flex items-center justify-center lg:justify-start gap-3 mb-1 animate-fade-in opacity-80">
              <span className="h-[2px] w-6 lg:w-12 bg-primary/80 rounded-full"></span>
              <span className="text-primary/90 text-[10px] sm:text-xs lg:text-sm font-bold uppercase tracking-[0.25em] lg:tracking-[0.3em]">Mobilidade inteligente</span>
              <span className="h-[2px] w-6 bg-primary/80 rounded-full lg:hidden"></span>
            </div>

            {/* Título Principal */}
            <h1 className="text-[2.5rem] leading-[1.05] sm:text-5xl lg:text-7xl font-normal text-white tracking-tight mb-2 lg:mb-6 w-full">
              <span className="block font-light text-white/90 mb-1 lg:mb-2">Sua jornada</span>
              <span className="inline-block font-medium bg-clip-text text-transparent italic text-gradient-animate pb-2 pr-4 lg:pr-12">começa aqui</span>
            </h1>

            {/* Parágrafo */}
            <p className="text-sm sm:text-base lg:text-lg text-gray-400 font-light max-w-md lg:max-w-xl leading-relaxed tracking-wide font-sans lg:border-l lg:border-white/10 lg:pl-6">
              Na Flexloc você aluga veículos revisados, econômicos e prontos para rodar — seja para trabalhar com aplicativos, fazer entregas ou ter um carro disponível.
              <span className="block mt-3 lg:mt-4 text-white/70 font-medium">Sem burocracia, com economia e aprovação rápida.</span>
            </p>

            {/* Benefícios (Premium Pills no Mobile, Clean no Desktop) */}
            <div className="mt-4 lg:mt-2 flex flex-wrap gap-2.5 lg:gap-x-8 lg:gap-y-4 justify-center lg:justify-start w-full max-w-md lg:max-w-none">
              
              <div className="flex items-center gap-1.5 px-3.5 py-2 lg:px-0 lg:py-0 rounded-full bg-white/5 lg:bg-transparent border border-white/10 lg:border-transparent backdrop-blur-sm lg:backdrop-blur-none group">
                <span className="material-symbols-outlined text-primary/80 text-[16px] lg:text-base font-light group-hover:scale-110 transition-transform">verified</span>
                <span className="text-white/80 lg:text-white/50 text-[10px] lg:text-sm font-bold lg:font-medium uppercase tracking-wider group-hover:text-white transition-colors">Aprovação rápida</span>
              </div>
              
              <div className="flex items-center gap-1.5 px-3.5 py-2 lg:px-0 lg:py-0 rounded-full bg-white/5 lg:bg-transparent border border-white/10 lg:border-transparent backdrop-blur-sm lg:backdrop-blur-none group">
                <span className="material-symbols-outlined text-primary/80 text-[16px] lg:text-base font-light group-hover:scale-110 transition-transform">local_gas_station</span>
                <span className="text-white/80 lg:text-white/50 text-[10px] lg:text-sm font-bold lg:font-medium uppercase tracking-wider group-hover:text-white transition-colors">Veículos com GNV</span>
              </div>
              
              <div className="flex items-center gap-1.5 px-3.5 py-2 lg:px-0 lg:py-0 rounded-full bg-white/5 lg:bg-transparent border border-white/10 lg:border-transparent backdrop-blur-sm lg:backdrop-blur-none group">
                <span className="material-symbols-outlined text-primary/80 text-[16px] lg:text-base font-light group-hover:scale-110 transition-transform">stars</span>
                <span className="text-white/80 lg:text-white/50 text-[10px] lg:text-sm font-bold lg:font-medium uppercase tracking-wider group-hover:text-white transition-colors">Uso flexível</span>
              </div>

            </div>
          </div>

          <div className="flex justify-center items-center w-full">
            <div className="w-full max-w-[440px] relative group">
              <div className="absolute -inset-20 bg-primary/10 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>
              <div className="absolute -inset-1 bg-primary/20 rounded-[2.5rem] blur-2xl opacity-30 group-hover:opacity-60 transition duration-1000"></div>
              
              <div className="glass-panel p-5 sm:p-6 pb-6 sm:pb-8 rounded-[2rem] shadow-2xl animate-fade-in-up relative border border-white/10 backdrop-blur-3xl h-fit">
                <div className="flex flex-col gap-6">
                  <div className="space-y-3">
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4 opacity-70" id="tipo-contrato-label">Tipo de Contrato</label>
                    <div className="flex p-1.5 bg-black/40 rounded-2xl border border-white/5 backdrop-blur-md shadow-inner" role="group" aria-labelledby="tipo-contrato-label">
                      <button type="button" onClick={() => handleTipoChange('app')}
                        aria-pressed={tipo === 'app' ? "true" : "false"}
                        className={`flex-1 py-3 px-2 sm:px-4 rounded-xl text-[10px] sm:text-[11px] uppercase tracking-wider sm:tracking-widest transition-all duration-500 ${tipo === 'app' ? 'font-black bg-primary text-background-dark shadow-xl shadow-primary/20' : 'font-bold text-gray-500 hover:text-white'}`}>
                        Motorista de App
                      </button>
                      <button type="button" onClick={() => handleTipoChange('normal')}
                        aria-pressed={tipo === 'normal' ? "true" : "false"}
                        className={`flex-1 py-3 px-2 sm:px-4 rounded-xl text-[10px] sm:text-[11px] uppercase tracking-wider sm:tracking-widest transition-all duration-500 ${tipo === 'normal' ? 'font-black bg-primary text-background-dark shadow-xl shadow-primary/20' : 'font-bold text-gray-500 hover:text-white'}`}>
                        Pessoa Física
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-col gap-5 relative">
                    <div className="space-y-2 relative">
                      <label htmlFor="location-btn" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4 opacity-70">Local de Retirada</label>
                      <div className="relative w-full">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <span className={`material-symbols-outlined font-light text-xl ${isLocationOpen ? 'text-primary' : 'text-gray-500'}`}>location_on</span>
                        </div>
                        <button type="button" id="location-btn" onClick={() => setIsLocationOpen(!isLocationOpen)}
                          className={`block w-full text-left pl-12 pr-10 py-4 bg-white/[0.05] border hover:border-primary/50 hover:bg-white/[0.08] rounded-2xl text-white focus:outline-none transition-all text-sm font-medium tracking-wide cursor-pointer relative z-0 ${isLocationOpen ? 'border-primary/50 ring-1 ring-primary/50' : 'border-white/10'}`}>
                          <span>{locationText}</span>
                        </button>
                        <div className={`absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none z-10 text-gray-500 transition-transform duration-300 ${isLocationOpen ? 'rotate-180' : ''}`}>
                          <span className="material-symbols-outlined font-light text-2xl">expand_more</span>
                        </div>

                        {isLocationOpen && (
                          <div className="absolute z-50 w-full mt-2 bg-black/80 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl">
                            <ul className="p-2 text-sm font-medium text-gray-400 flex flex-col gap-1">
                              <li>
                                <button type="button" onClick={() => { setLocation('fsa'); setLocationText('Feira de Santana, BA'); setIsLocationOpen(false); }}
                                  className="w-full text-left px-4 py-3.5 hover:bg-primary hover:text-background-dark rounded-xl transition-all duration-300 cursor-pointer font-bold flex items-center justify-between group">
                                  <span>Feira de Santana, BA</span>
                                </button>
                              </li>
                              <li>
                                <button type="button" onClick={() => { setLocation('ssa'); setLocationText('Salvador, BA'); setIsLocationOpen(false); }}
                                  className="w-full text-left px-4 py-3.5 hover:bg-primary hover:text-background-dark rounded-xl transition-all duration-300 cursor-pointer font-bold flex items-center justify-between group">
                                  <span>Salvador, BA</span>
                                </button>
                              </li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid gap-4">
                      {/* Retirada */}
                      <div className="flex flex-col sm:grid sm:grid-cols-5 gap-4 sm:gap-2 sm:items-end">
                        <div className="w-full sm:col-span-3 space-y-2">
                          <label htmlFor="date-start" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4 opacity-70 flex justify-between pr-2">
                            Retirada
                            {tipo === 'app' ? (
                              <span className="text-primary animate-pulse">Min. 7d</span>
                            ) : (
                              <span className="text-primary animate-pulse">Min. 3d</span>
                            )}
                          </label>
                          <div className="relative group/field">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <span className="material-symbols-outlined text-primary text-lg font-light">calendar_today</span>
                            </div>
                            <input ref={dateStartRef}
                              id="date-start"
                              readOnly
                              className="block w-full pl-11 pr-2 py-4 bg-white/[0.05] border border-white/10 hover:border-primary/50 hover:bg-white/[0.08] rounded-2xl text-white placeholder-gray-500 focus:outline-none transition-all text-sm sm:text-xs font-bold tracking-wide cursor-pointer"
                              type="text" placeholder="Escolha a data" />
                          </div>
                        </div>
                        <div className="w-full sm:col-span-2 space-y-2 relative">
                          <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <span className={`material-symbols-outlined text-lg font-light ${isTimeStartOpen ? 'text-primary' : 'text-gray-500'}`}>schedule</span>
                            </div>
                            <button type="button" id="time-start-btn" aria-label="Hora de Retirada" onClick={() => setIsTimeStartOpen(!isTimeStartOpen)}
                              className={`block w-full text-left pl-10 pr-8 py-4 bg-white/[0.03] border hover:border-primary/50 hover:bg-white/[0.08] rounded-2xl text-white focus:outline-none transition-all text-sm sm:text-xs font-bold tracking-wide cursor-pointer relative z-0 ${isTimeStartOpen ? 'border-primary/50 ring-1 ring-primary/50' : 'border-white/5'}`}>
                              <span>{timeStart}</span>
                            </button>
                            <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10 text-gray-500 transition-transform duration-300 ${isTimeStartOpen ? 'rotate-180' : ''}`}>
                              <span className="material-symbols-outlined font-light text-xl">expand_more</span>
                            </div>
                            {isTimeStartOpen && (
                              <div className="absolute z-50 w-full mt-2 bg-black/80 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl max-h-48 overflow-y-auto custom-scrollbar">
                                <ul className="p-2 text-sm font-medium text-gray-400 flex flex-col gap-1">
                                  {startTimeOptions.map(t => (
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
                      </div>

                      {/* Devolução */}
                      <div className="flex flex-col sm:grid sm:grid-cols-5 gap-4 sm:gap-2 sm:items-end">
                        <div className="w-full sm:col-span-3 space-y-2">
                          <label htmlFor="date-end" className="text-[10px] font-bold text-gray-500 uppercase tracking-widest ml-4 opacity-70 flex justify-between pr-2">
                            Devolução
                            {tipo === 'app' && <span className="text-primary">Ciclo Semanal</span>}
                          </label>
                          <div className="relative group/field">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                              <span className="material-symbols-outlined text-primary text-lg font-light">event_repeat</span>
                            </div>
                            <input ref={dateEndRef}
                              id="date-end"
                              readOnly
                              className="block w-full pl-11 pr-2 py-4 bg-white/[0.05] border border-white/10 hover:border-primary/50 hover:bg-white/[0.08] rounded-2xl text-white placeholder-gray-500 focus:outline-none transition-all text-sm sm:text-xs font-bold tracking-wide cursor-pointer"
                              type="text" placeholder="Escolha a data" />
                          </div>
                        </div>
                        <div className="w-full sm:col-span-2 space-y-2 relative">
                          <div className="relative w-full">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                              <span className={`material-symbols-outlined text-lg font-light ${isTimeEndOpen ? 'text-primary' : 'text-gray-500'}`}>schedule</span>
                            </div>
                            <button type="button" id="time-end-btn" aria-label="Hora de Devolução" onClick={() => setIsTimeEndOpen(!isTimeEndOpen)}
                              className={`block w-full text-left pl-10 pr-8 py-4 bg-white/[0.03] border hover:border-primary/50 hover:bg-white/[0.08] rounded-2xl text-white focus:outline-none transition-all text-sm sm:text-xs font-bold tracking-wide cursor-pointer relative z-0 ${isTimeEndOpen ? 'border-primary/50 ring-1 ring-primary/50' : 'border-white/5'}`}>
                              <span>{timeEnd}</span>
                            </button>
                            <div className={`absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10 text-gray-500 transition-transform duration-300 ${isTimeEndOpen ? 'rotate-180' : ''}`}>
                              <span className="material-symbols-outlined font-light text-xl">expand_more</span>
                            </div>
                            {isTimeEndOpen && (
                              <div className="absolute z-50 w-full mt-2 bg-black/80 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl max-h-48 overflow-y-auto custom-scrollbar">
                                <ul className="p-2 text-sm font-medium text-gray-400 flex flex-col gap-1">
                                  {endTimeOptions.map(t => (
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
                    </div>

                    <button onClick={goToBook}
                      className="w-full mt-4 py-5 bg-primary text-background-dark text-sm font-black uppercase tracking-[0.25em] rounded-2xl hover:bg-white hover:text-black transition-all duration-500 shadow-[0_20px_40px_rgba(255,217,0,0.3)] flex items-center justify-center gap-3 group active:scale-[0.97]">
                      <span>Alugar Agora</span>
                      <span className="material-symbols-outlined text-xl group-hover:translate-x-2 transition-transform">arrow_right_alt</span>
                    </button>
                    
                    {error && (
                      <p className="text-red-500 text-xs font-bold text-center mt-2 p-3 bg-red-500/10 rounded-xl border border-red-500/20">{error}</p>
                    )}
                    
                    {warning && (
                      <p className="text-yellow-500 text-xs font-bold text-center mt-2 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">{warning}</p>
                    )}
                    
                    <p className="text-xs text-center text-gray-500 mt-2">
                      {tipo === 'app' 
                        ? "Motoristas de aplicativo alugam por períodos semanais (mínimo 7 dias)."
                        : "Locação mínima de 3 dias."}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Fleet Section */}
      <section className="flex-1 w-full max-w-[1400px] mx-auto px-6 md:px-12 py-16 md:py-24 relative z-10" id="fleet">
        <div className="bg-text-decoration">FLEXLOC</div>

        <div className="mb-24 max-w-4xl animate-on-scroll">
          <div className="flex items-center gap-3 mb-8 text-sm font-semibold tracking-[0.2em] uppercase text-gray-500">
            <span>01</span>
            <span className="w-8 h-[1px] bg-gray-800"></span>
            <span className="text-primary">Seleção de Frota</span>
          </div>
          <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-light mb-8 tracking-tighter leading-none hover-scale">
            Uma frota pensada para <br /> <span className="font-semibold text-transparent text-gradient-animate">diferentes necessidades</span>
          </h2>
          <p className="text-gray-500 text-base md:text-base font-light max-w-xl leading-relaxed tracking-wide font-sans">
            Escolha entre carros econômicos, confortáveis, utilitários e SUVs. Todos revisados e preparados para oferecer economia, segurança e praticidade no seu dia a dia.<br /><br />
            Seja para trabalhar, viajar ou usar no cotidiano, temos o veículo ideal para você.
          </p>
        </div>

        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mt-4 pt-12 pb-12 -mx-6 px-6 lg:mx-0 lg:px-0">
          {CARS.filter(c => [2, 13, 15].includes(Number(c.id))).map((car, idx) => (
            <div key={car.id} className={`group card-glass rounded-xl p-8 pt-0 flex flex-col relative transition-all duration-500 hover:border-white/20 animate-on-scroll snap-center shrink-0 w-[85vw] sm:w-[380px] md:w-auto ${idx > 0 ? `delay-${idx * 100}` : ''}`}>
              <div className="relative h-56 w-full -mt-12 mb-2 flex items-center justify-center z-20">
                <img alt={car.name} decoding="async" loading="lazy" className="object-contain w-full h-full relative z-10 car-overlap drop-shadow-2xl" src={car.img || car.image} />
              </div>
              <div className="flex flex-col flex-1 relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className={`text-sm font-bold tracking-widest uppercase ${car.catColor || 'text-emerald-400 glow-text-green'} mb-2 block`}>{car.catLabel || 'Econômicos'}</span>
                    <h3 className="text-white text-xl md:text-2xl font-medium tracking-tight uppercase">{car.name}</h3>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-base uppercase tracking-widest mb-1">{plan === 'pf' ? 'Por dia' : 'Por semana'}</p>
                    <p className="text-primary text-xl font-bold">
                      R$ {(() => {
                        if (plan === 'pf') return car.priceDay;
                        const pricing = car.pricingApp?.[location as 'fsa' | 'ssa'];
                        if (!pricing) return '-';
                        const prices = [pricing.k3, pricing.k6, pricing.free].filter(p => p !== null) as number[];
                        return prices.length > 0 ? Math.min(...prices) : '-';
                      })()}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-4 border-t border-white/5 pt-4">
                  <div className="flex flex-col items-center gap-1 text-center">
                    <span className="material-symbols-outlined text-gray-400 text-sm font-light">schedule</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">Mín. {plan === 'pf' ? '3' : '7'} Dias</span>
                  </div>
                  <div className="flex flex-col items-center gap-1 text-center">
                    <span className="material-symbols-outlined text-gray-400 text-sm font-light">payments</span>
                    <span className="text-[10px] text-gray-400 uppercase tracking-wide">
                      Caução R$ {(() => {
                        if (plan === 'pf') return '1.500';
                        if (car.catLabel === 'Black') return '2.500';
                        if (car.catLabel === 'Comfort' || car.catLabel === 'Família') return '2.000';
                        return '1.800';
                      })()}
                    </span>
                  </div>
                </div>
                <p className="text-gray-500 text-xs leading-relaxed mb-6 font-sans">
                  {car.category === 'SUV' ? 'Força, robustez e amplo espaço interno. O veículo perfeito para quem não abre mão de conforto e segurança.' : 
                   car.category === 'Sedan' ? 'Mais espaço, tecnologia e performance para suas viagens ou trabalho em categorias superiores.' :
                   'Ideal para quem busca baixo consumo e agilidade no trânsito urbano. Limite de 600km/semana.'}
                </p>
                <Link to={`/book?carId=${car.id}&plan=${plan}&loc=${location}&dateStart=${dateStart}&dateEnd=${dateEnd}&timeStart=${timeStart}&timeEnd=${timeEnd}`} className="w-full bg-white text-black py-4 rounded-lg text-sm font-bold text-center uppercase tracking-widest transition-all duration-300 btn-glow hover:bg-primary inline-block">
                  Reservar Agora
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Lifestyle Section */}
      <section className="relative w-full min-h-0 lg:min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 section-fade-top z-10"></div>
        <div className="absolute bottom-0 left-0 right-0 h-32 section-fade-bottom z-10"></div>
        
        <div className="absolute inset-0 z-0 overflow-hidden">
            <img src="/images/bg3.png" decoding="async" loading="lazy" className="absolute inset-0 w-full h-full object-cover opacity-20" alt="Background Section" />
            <div className="absolute inset-0 bg-gradient-to-r from-background-dark via-background-dark/80 to-transparent"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
        </div>
        <div className="relative z-10 w-full max-w-[1400px] px-6 lg:px-20 py-16 lg:py-20 grid lg:grid-cols-2 gap-12 items-center">
            <div className="flex flex-col gap-6 max-w-2xl animate-fade-left">
                <div className="flex items-center gap-2 text-primary">
                    <span className="h-px w-8 bg-primary"></span>
                    <span className="text-sm font-semibold tracking-widest uppercase">A Jornada Além da Estrada</span>
                </div>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-light text-white leading-[1.1] tracking-tight hover-scale">
                    Pronto para dirigir com <br />
                    <span className="font-bold text-transparent text-gradient-animate">mais liberdade?</span>
                </h2>
                <p className="text-base text-slate-300 font-light max-w-lg leading-relaxed font-sans">
                    Entre em contato com a Flexloc e encontre o veículo ideal para sua necessidade. Seja para trabalhar, viajar ou ter mais mobilidade no dia a dia.
                </p>
                <div className="pt-8 flex flex-wrap gap-4">
                    <a href="https://wa.me/5575981333333" target="_blank" rel="noopener noreferrer"
                        className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 bg-primary text-background-dark text-base font-bold transition-transform hover:scale-105">
                        Falar no WhatsApp
                    </a>
                    <a href="#fleet"
                        className="flex min-w-[160px] cursor-pointer items-center justify-center rounded-xl h-14 px-8 border border-white/20 text-white hover:bg-white/10 text-base font-medium transition-colors">
                        Ver Frota
                    </a>
                </div>
            </div>
            <div className="hidden lg:flex justify-end items-center h-full animate-fade-right">
                <div className="relative w-full max-w-xl aspect-[3/4]">
                    <div className="absolute right-0 top-0 w-full h-full rounded-2xl overflow-hidden shadow-2xl border border-white/10 z-10">
                        <img alt="Motorista Flexloc" decoding="async" loading="lazy" className="w-full h-full object-cover" src="/images/motorista.png" />
                    </div>
                    <div id="testimonial-container" className="absolute -bottom-8 -left-8 w-[320px] z-20">
                        <div className="bg-white/5 backdrop-blur-md border border-white/10 p-6 rounded-2xl shadow-xl transition-all duration-500 testimonial-active">
                            <div className="flex gap-1 mb-3 text-primary">
                                <span className="material-symbols-outlined text-[20px] fill-current">star</span>
                                <span className="material-symbols-outlined text-[20px] fill-current">star</span>
                                <span className="material-symbols-outlined text-[20px] fill-current">star</span>
                                <span className="material-symbols-outlined text-[20px] fill-current">star</span>
                                <span className="material-symbols-outlined text-[20px] fill-current">star</span>
                            </div>
                            <p id="testimonial-text" className="text-white text-base font-medium leading-snug mb-4 font-sans">
                                "{TESTIMONIALS[0].content}"
                            </p>
                            <div className="flex items-center gap-3">
                                <img src={TESTIMONIALS[0].avatar} decoding="async" loading="lazy" alt={TESTIMONIALS[0].name} className="w-10 h-10 rounded-full object-cover" />
                                <div>
                                    <p id="testimonial-name" className="text-white font-bold text-base">{TESTIMONIALS[0].name}</p>
                                    <p className="text-slate-400 text-base">{TESTIMONIALS[0].role}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <section className="border-t border-white/5 pt-24 pb-8 max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-12 animate-fade-in">
            <p className="text-primary text-[11px] font-bold tracking-[0.25em] uppercase mb-2">Vantagens</p>
            <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-light">
                Por que escolher a <span className="font-semibold text-transparent text-gradient-animate">Flexloc</span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed font-light font-sans max-w-2xl mt-4">
                Criamos um modelo de locação simples, acessível e eficiente para quem precisa de mobilidade com economia.
            </p>
        </div>
        <div className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 pb-4 -mx-6 px-6 lg:mx-0 lg:px-0">
            <div className="group flex flex-col gap-6 animate-on-scroll snap-center shrink-0 w-[80vw] sm:w-[300px] md:w-auto">
                <div className="w-12 h-12 flex items-center justify-center rounded-full border border-white/5 bg-white/5 group-hover:border-primary/50 transition-colors duration-300">
                    <span className="material-symbols-outlined text-primary font-light text-2xl">assignment_turned_in</span>
                </div>
                <div>
                    <h3 className="text-white text-xl md:text-2xl font-medium mb-3 tracking-wide font-sans text-gradient-animate">Sem Burocracia</h3>
                    <p className="text-gray-400 text-base leading-relaxed font-light font-sans">
                        Nosso processo é rápido e simples. Nada de filas ou processos complicados para conseguir seu veículo.
                    </p>
                </div>
            </div>
            <div className="group flex flex-col gap-6 animate-on-scroll delay-100 snap-center shrink-0 w-[80vw] sm:w-[300px] md:w-auto">
                <div className="w-12 h-12 flex items-center justify-center rounded-full border border-white/5 bg-white/5 group-hover:border-primary/50 transition-colors duration-300">
                    <span className="material-symbols-outlined text-primary font-light text-2xl">local_gas_station</span>
                </div>
                <div>
                    <h3 className="text-white text-xl md:text-2xl font-medium mb-3 tracking-wide font-sans text-gradient-animate">Economia com GNV</h3>
                    <p className="text-gray-400 text-base leading-relaxed font-light font-sans">
                        Todos os carros possuem GNV de 5ª geração, permitindo economia de até 40% no combustível para seu lucro ser maior.
                    </p>
                </div>
            </div>
            <div className="group flex flex-col gap-6 animate-on-scroll delay-200 snap-center shrink-0 w-[80vw] sm:w-[300px] md:w-auto">
                <div className="w-12 h-12 flex items-center justify-center rounded-full border border-white/5 bg-white/5 group-hover:border-primary/50 transition-colors duration-300">
                    <span className="material-symbols-outlined text-primary font-light text-2xl">build</span>
                </div>
                <div>
                    <h3 className="text-white text-xl md:text-2xl font-medium mb-3 tracking-wide font-sans text-gradient-animate">Carros Revisados</h3>
                    <p className="text-gray-400 text-base leading-relaxed font-light font-sans">
                        Todos os veículos passam por manutenção preventiva constante para garantir segurança e confiabilidade.
                    </p>
                </div>
            </div>
            <div className="group flex flex-col gap-6 animate-on-scroll delay-300 snap-center shrink-0 w-[80vw] sm:w-[300px] md:w-auto">
                <div className="w-12 h-12 flex items-center justify-center rounded-full border border-white/5 bg-white/5 group-hover:border-primary/50 transition-colors duration-300">
                    <span className="material-symbols-outlined text-primary font-light text-2xl">trending_up</span>
                </div>
                <div>
                    <h3 className="text-white text-xl md:text-2xl font-medium mb-3 tracking-wide font-sans text-gradient-animate">Trabalho ou Uso Pessoal</h3>
                    <p className="text-gray-400 text-base leading-relaxed font-light font-sans">
                        Você pode usar seu carro Flexloc para trabalhar com aplicativos, fazer entregas, viajar ou usar no dia a dia. Liberdade total para dirigir.
                    </p>
                </div>
            </div>
        </div>
      </section>

      <section className="border-t border-white/5 pt-24 pb-8 relative overflow-hidden max-w-7xl mx-auto px-6 lg:px-8">
        <div className="mb-20 text-center animate-on-scroll">
            <p className="text-primary text-[11px] font-bold tracking-[0.25em] uppercase mb-2">Processo</p>
            <h2 className="text-white text-3xl md:text-4xl lg:text-5xl font-light">
                Comece em <span className="font-semibold text-transparent text-gradient-animate">poucos passos</span>
            </h2>
            <p className="text-gray-400 text-base leading-relaxed font-light font-sans max-w-2xl mx-auto mt-4">
                Alugar um veículo com a Flexloc é simples e rápido.
            </p>
        </div>
        <div className="relative flex overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mt-4 pt-12 pb-4 -mx-6 px-6 lg:mx-0 lg:px-0">
            <div className="hidden md:block absolute top-[60px] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/10 to-transparent z-0"></div>
            <div className="relative group z-10 flex flex-col items-center text-center animate-on-scroll snap-center shrink-0 w-[80vw] sm:w-[300px] md:w-auto">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[120px] font-bold text-white opacity-[0.03] select-none pointer-events-none leading-none">01</div>
                <div className="w-4 h-4 rounded-full bg-background-dark border-2 border-primary mb-8 relative z-20 shadow-[0_0_15px_rgba(230,197,25,0.3)]"></div>
                <div className="w-full h-48 bg-white/[0.02] rounded-lg mb-8 flex items-center justify-center border border-white/5 backdrop-blur-sm group-hover:border-white/10 transition-colors duration-500">
                    <span className="material-symbols-outlined text-white/30 leading-none group-hover:text-primary transition-all duration-500" 
                          style={{ fontSize: '56px', fontVariationSettings: "'wght' 300, 'opsz' 48" }}>
                      smartphone
                    </span>
                </div>
                <h3 className="text-white text-xl md:text-2xl font-medium mb-3 tracking-tight">Escolha seu veículo</h3>
                <p className="text-gray-400 text-base leading-relaxed font-light font-sans max-w-xs mx-auto">
                    Fale com um de nossos consultores e descubra qual modelo atende melhor sua necessidade.
                </p>
            </div>
            <div className="relative group z-10 flex flex-col items-center text-center animate-on-scroll delay-100 snap-center shrink-0 w-[80vw] sm:w-[300px] md:w-auto">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[120px] font-bold text-white opacity-[0.03] select-none pointer-events-none leading-none">02</div>
                <div className="w-4 h-4 rounded-full bg-background-dark border-2 border-primary mb-8 relative z-20 shadow-[0_0_15px_rgba(230,197,25,0.3)]"></div>
                <div className="w-full h-48 bg-white/[0.02] rounded-lg mb-8 flex items-center justify-center border border-white/5 backdrop-blur-sm group-hover:border-white/10 transition-colors duration-500">
                    <div className="relative">
                        <span className="material-symbols-outlined text-white/30 leading-none group-hover:text-primary transition-all duration-500" 
                              style={{ fontSize: '56px', fontVariationSettings: "'wght' 300, 'opsz' 48" }}>
                          fingerprint
                        </span>
                        <span className="material-symbols-outlined text-primary absolute -top-4 -right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 bg-background-dark rounded-full" 
                              style={{ fontSize: '22px' }}>
                          verified_user
                        </span>
                    </div>
                </div>
                <h3 className="text-white text-xl md:text-2xl font-medium mb-3 tracking-tight">Envie seus documentos</h3>
                <p className="text-gray-400 text-base leading-relaxed font-light font-sans max-w-xs mx-auto">
                    Basta enviar CNH digital, comprovante de endereço e print do tempo no app (caso seja motorista).
                </p>
            </div>
            <div className="relative group z-10 flex flex-col items-center text-center animate-on-scroll delay-200 snap-center shrink-0 w-[80vw] sm:w-[300px] md:w-auto">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[120px] font-bold text-white opacity-[0.03] select-none pointer-events-none leading-none">03</div>
                <div className="w-4 h-4 rounded-full bg-background-dark border-2 border-primary mb-8 relative z-20 shadow-[0_0_15px_rgba(230,197,25,0.3)]"></div>
                <div className="w-full h-48 bg-white/[0.02] rounded-lg mb-8 flex items-center justify-center border border-white/5 backdrop-blur-sm group-hover:border-white/10 transition-colors duration-500">
                    <span className="material-symbols-outlined text-white/30 leading-none group-hover:text-primary transition-all duration-500" 
                          style={{ fontSize: '56px', fontVariationSettings: "'wght' 300, 'opsz' 48" }}>
                      key
                    </span>
                </div>
                <h3 className="text-white text-xl md:text-2xl font-medium mb-3 tracking-tight">Aprovação rápida</h3>
                <p className="text-gray-400 text-base leading-relaxed font-light font-sans max-w-xs mx-auto">
                    Nossa equipe analisa seus dados rapidamente e a aprovação pode acontecer em até 30 minutos.
                </p>
            </div>
            <div className="relative group z-10 flex flex-col items-center text-center animate-on-scroll delay-300 snap-center shrink-0 w-[80vw] sm:w-[300px] md:w-auto">
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-[120px] font-bold text-white opacity-[0.03] select-none pointer-events-none leading-none">04</div>
                <div className="w-4 h-4 rounded-full bg-background-dark border-2 border-primary mb-8 relative z-20 shadow-[0_0_15px_rgba(230,197,25,0.3)]"></div>
                <div className="w-full h-48 bg-white/[0.02] rounded-lg mb-8 flex items-center justify-center border border-white/5 backdrop-blur-sm group-hover:border-white/10 transition-colors duration-500">
                    <span className="material-symbols-outlined text-white/30 leading-none group-hover:text-primary transition-all duration-500" 
                          style={{ fontSize: '56px', fontVariationSettings: "'wght' 300, 'opsz' 48" }}>
                      car_rental
                    </span>
                </div>
                <h3 className="text-white text-xl md:text-2xl font-medium mb-3 tracking-tight">Retire seu carro</h3>
                <p className="text-gray-400 text-base leading-relaxed font-light font-sans max-w-xs mx-auto">
                    Com o cadastro aprovado e veículo disponível, é só retirar e começar a dirigir.
                </p>
            </div>
        </div>
      </section>

      <section className="relative py-24 px-6 lg:px-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src="/images/bg3.png" className="w-full h-full object-cover opacity-30" alt="Background Metrics" />
          <div className="absolute inset-0 bg-black/80"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black"></div>
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto text-center mb-16">
          <p className="text-primary text-[11px] font-bold tracking-[0.25em] uppercase mb-4">Flexloc Business</p>
          <h2 className="text-white text-3xl md:text-5xl lg:text-6xl font-light mb-6">
            Métricas de <span className="font-semibold text-white">Crescimento</span>
          </h2>
          <p className="text-gray-400 text-base md:text-lg leading-relaxed font-light font-sans max-w-2xl mx-auto">
            Nossa trajetória é marcada por resultados reais e impacto positivo na vida de milhares de motoristas.
          </p>
        </div>

        <div className="relative z-10 max-w-[1400px] mx-auto flex overflow-x-auto snap-x snap-mandatory no-scrollbar md:grid md:grid-cols-3 gap-6 lg:gap-8 mb-16 -mx-6 px-6 lg:mx-0 lg:px-0">
          <div className="card-glass p-8 rounded-[2rem] border border-white/5 flex flex-col items-start gap-6 hover:border-primary/20 transition-all duration-500 group snap-center shrink-0 w-[85vw] sm:w-[380px] md:w-auto">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined font-light fill-current">groups</span>
            </div>
            <div>
              <h3 className="text-white text-2xl lg:text-3xl font-bold mb-4">+3000 Clientes</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-sans">
                Atendidos com excelência em nossas unidades de Feira de Santana e Salvador, ajudando a movimentar a economia local.
              </p>
            </div>
          </div>

          <div className="card-glass p-8 rounded-[2rem] border border-white/5 flex flex-col items-start gap-6 hover:border-primary/20 transition-all duration-500 group snap-center shrink-0 w-[85vw] sm:w-[380px] md:w-auto">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined font-light fill-current">directions_car</span>
            </div>
            <div>
              <h3 className="text-white text-2xl lg:text-3xl font-bold mb-4">+100 Veículos</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-sans">
                Uma frota diversificada e sempre revisada, equipada com GNV para garantir o melhor custo-benefício do mercado.
              </p>
            </div>
          </div>

          <div className="card-glass p-8 rounded-[2rem] border border-white/5 flex flex-col items-start gap-6 hover:border-primary/20 transition-all duration-500 group snap-center shrink-0 w-[85vw] sm:w-[380px] md:w-auto">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 text-primary group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined font-light fill-current">location_on</span>
            </div>
            <div>
              <h3 className="text-white text-2xl lg:text-3xl font-bold mb-4">Unidades</h3>
              <p className="text-gray-400 text-sm leading-relaxed font-sans">
                Atendimento especializado em Feira de Santana e Salvador.
              </p>
            </div>
          </div>
        </div>

        <div className="relative z-10 flex justify-center">
          <a href="https://wa.me/5575981333333" target="_blank" rel="noopener noreferrer"
             className="bg-primary text-black px-8 py-4 rounded-full text-base font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-[0_10px_30px_rgba(230,197,25,0.3)]">
            <span>Falar com Consultor</span>
            <span className="material-symbols-outlined text-xl">chat</span>
          </a>
        </div>
      </section>

      <section id="about" className="py-24 px-6 lg:px-20 bg-background-dark relative overflow-hidden border-t border-white/5">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-primary/5 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="max-w-[1400px] mx-auto">
            <div className="grid lg:grid-cols-12 gap-12 items-center">
                <div className="lg:col-span-5 relative group">
                    <div className="absolute -inset-2 bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl blur-lg opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                    <div className="relative rounded-2xl overflow-hidden aspect-[4/5] shadow-2xl border border-white/5">
                        <img alt="Adailton Junior - Gerente Flexloc" decoding="async" loading="lazy" className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src="/images/Adailton Junior.png" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <p className="font-bold text-base">Adailton Junior</p>
                            <p className="text-base text-primary">Gerente Flexloc</p>
                        </div>
                    </div>
                </div>
                <div className="lg:col-span-7 lg:pl-10 flex flex-col gap-8">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2 text-primary">
                            <span className="text-sm font-semibold tracking-widest uppercase">Sobre a Flexloc</span>
                            <span className="h-px w-12 bg-primary/50"></span>
                        </div>
                        <h2 className="text-3xl md:text-4xl lg:text-5xl font-light text-white tracking-tight">
                            Mobilidade com <br /><span className="font-bold text-transparent text-gradient-animate">menos burocracia.</span>
                        </h2>
                        <p className="text-slate-400 text-base leading-relaxed max-w-2xl font-sans">
                            A Flexloc é uma empresa especializada em locação de veículos que nasceu com o objetivo de tornar o aluguel de carros mais simples, rápido e acessível.<br /><br />
                            Trabalhamos com uma frota diversificada preparada tanto para motoristas de aplicativos quanto para pessoas que precisam de um carro confiável para o dia a dia.<br /><br />
                            Nosso compromisso é oferecer economia, praticidade e atendimento ágil, garantindo que você tenha sempre um veículo pronto para dirigir.
                        </p>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4 mt-8">
                        <div className="card-glass p-5 rounded-2xl flex items-center gap-4 group hover:border-primary/30 transition-all">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined font-light">location_on</span>
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">Duas Unidades</p>
                                <p className="text-gray-500 text-sm font-sans">Feira e Salvador</p>
                            </div>
                        </div>
                        <div className="card-glass p-5 rounded-2xl flex items-center gap-4 group hover:border-primary/30 transition-all">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined font-light">groups</span>
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">+300 Clientes</p>
                                <p className="text-gray-500 text-sm font-sans">Satisfeitos e ativos</p>
                            </div>
                        </div>
                        <div className="card-glass p-5 rounded-2xl flex items-center gap-4 group hover:border-primary/30 transition-all">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined font-light">verified_user</span>
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">Processo Seguro</p>
                                <p className="text-gray-500 text-sm font-sans">Dados protegidos</p>
                            </div>
                        </div>
                        <div className="card-glass p-5 rounded-2xl flex items-center gap-4 group hover:border-primary/30 transition-all">
                            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-primary/10 text-primary group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined font-light">support_agent</span>
                            </div>
                            <div>
                                <p className="text-white font-bold text-lg">Suporte Vip</p>
                                <p className="text-gray-500 text-sm font-sans">Consultoria ágil</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
      </section>

      <footer className="bg-black border-t border-white/5 py-16 px-6 lg:px-20 overflow-hidden relative">
        <div className="max-w-[1400px] mx-auto grid lg:grid-cols-4 gap-16 relative z-10">
          <div className="lg:col-span-2 space-y-8">
            <img src="/images/logo.png" decoding="async" alt="Flexloc Logo" className="h-10 w-auto object-contain opacity-90" />
            <p className="text-slate-400 text-lg leading-relaxed font-sans max-w-md">
                Simplificando o seu trajeto com veículos econômicos e revisados em Feira de Santana e Salvador.
            </p>
            <div className="flex gap-4">
                <a href="https://instagram.com/flexloc" target="_blank" rel="noopener noreferrer" 
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 text-white hover:text-primary transition-all duration-300 group">
                    <span className="group-hover:scale-110 transition-transform">IG</span>
                </a>
                <a href="https://wa.me/5575981333333" target="_blank" rel="noopener noreferrer"
                    className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 hover:border-primary/50 text-white hover:text-primary transition-all duration-300 group">
                    <span className="material-symbols-outlined text-xl group-hover:scale-110 transition-transform">chat</span>
                </a>
            </div>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Navegação</h4>
            <ul className="space-y-4">
              <li><a href="#fleet" className="text-slate-500 hover:text-primary transition-colors text-base font-sans">Nossa Frota</a></li>
              <li><a href="#about" className="text-slate-500 hover:text-primary transition-colors text-base font-sans">Sobre Nós</a></li>
              <li><Link to="/contact" className="text-slate-500 hover:text-primary transition-colors text-base font-sans">Página de Contato</Link></li>
            </ul>
          </div>
          
          <div className="space-y-6">
            <h4 className="text-white font-bold text-sm uppercase tracking-widest">Contato</h4>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-slate-500 font-sans">
                <span className="material-symbols-outlined text-primary text-xl">location_on</span>
                BA-001, Feira de Santana, Salvador
              </li>
              <li className="flex items-center gap-3 text-slate-500 font-sans">
                <span className="material-symbols-outlined text-primary text-xl">call</span>
                (75) 98133-3333
              </li>
              <li className="flex items-center gap-3 text-slate-500 font-sans">
                <span className="material-symbols-outlined text-primary text-xl">mail</span>
                contato@flexloc.com.br
              </li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1400px] mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-600 text-sm font-sans relative z-10">
          <p>© {new Date().getFullYear()} Flexloc Locadora de Veículos. Todos os direitos reservados.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Termos de Uso</a>
            <a href="#" className="hover:text-white transition-colors">Privacidade</a>
          </div>
        </div>
      </footer>
    </>
  );
}
