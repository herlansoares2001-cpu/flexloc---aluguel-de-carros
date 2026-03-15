import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
    transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Previne o scroll do body quando o menu mobile está aberto
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isMobileMenuOpen]);

  return (
    <nav className={`fixed top-0 w-full z-50 border-b border-white/5 transition-all duration-500 backdrop-blur-lg ${transparent ? 'bg-black/20' : 'bg-background-dark/60'}`}>
      <div className="max-w-7xl mx-auto px-5 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center group cursor-pointer relative z-[60]">
            <img src="/images/logo.png" decoding="async" alt="Flexloc Logo" className="h-6 md:h-8 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80" />
          </Link>
          
          <div className="hidden md:flex items-center gap-10">
            <a className="text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-primary transition-all duration-300 hover:tracking-[0.25em]" href="/#fleet">Frota</a>
            <a className="text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-primary transition-all duration-300 hover:tracking-[0.25em]" href="/#about">Sobre</a>
            <Link className="text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-primary transition-all duration-300 hover:tracking-[0.25em]" to="/contact">Contato</Link>
          </div>

          <div className="flex items-center gap-4 relative z-[60]">
            <button 
              className="md:hidden text-white p-2 -mr-2 hover:text-primary transition-colors focus:outline-none"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu Mobile"
            >
              <span className="material-symbols-outlined font-light text-3xl">
                {isMobileMenuOpen ? 'close' : 'menu'}
              </span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu - Fullscreen Imersivo */}
      <div className={`md:hidden fixed inset-0 w-full h-screen bg-black/95 backdrop-blur-3xl transition-all duration-500 flex flex-col justify-center items-center z-50 ${isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}>
        <div className={`flex flex-col items-center gap-8 transform transition-all duration-500 delay-100 ${isMobileMenuOpen ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <a className="text-2xl font-light uppercase tracking-[0.2em] text-white hover:text-primary transition-colors" href="/#fleet" onClick={() => setIsMobileMenuOpen(false)}>Frota</a>
          <a className="text-2xl font-light uppercase tracking-[0.2em] text-white hover:text-primary transition-colors" href="/#about" onClick={() => setIsMobileMenuOpen(false)}>Sobre</a>
          <Link className="text-2xl font-light uppercase tracking-[0.2em] text-white hover:text-primary transition-colors" to="/contact" onClick={() => setIsMobileMenuOpen(false)}>Contato</Link>
          
          <div className="mt-8 w-12 h-px bg-white/20"></div>
          
          <a href="https://wa.me/5575981333333" target="_blank" rel="noopener noreferrer" className="mt-4 px-8 py-4 bg-primary text-black rounded-full text-sm font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_20px_rgba(230,197,25,0.2)]">
            <span className="material-symbols-outlined text-lg">chat</span>
            Fale Conosco
          </a>
        </div>
      </div>
    </nav>
  );
}
