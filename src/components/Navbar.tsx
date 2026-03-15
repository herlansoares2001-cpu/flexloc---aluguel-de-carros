import React, { useState } from 'react';
import { Link } from 'react-router-dom';

interface NavbarProps {
    transparent?: boolean;
}

export default function Navbar({ transparent = false }: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className={`fixed top-0 w-full z-50 border-b border-white/5 transition-colors duration-300 ${transparent ? 'bg-transparent' : 'bg-background-dark/80 backdrop-blur-xl'}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center group cursor-pointer">
            <img src="/images/logo.png" decoding="async" alt="Flexloc Logo" className="h-6 md:h-8 w-auto object-contain transition-opacity duration-300 group-hover:opacity-80" />
          </Link>
          <div className="hidden md:flex items-center gap-10">
            <a className="text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-primary transition-all duration-300 hover:tracking-[0.25em]" href="/#fleet">Frota</a>
            <a className="text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-primary transition-all duration-300 hover:tracking-[0.25em]" href="/#">Sobre</a>
            <a className="text-[11px] font-bold uppercase tracking-widest text-white/60 hover:text-primary transition-all duration-300 hover:tracking-[0.25em]" href="/#">Contato</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="hidden md:flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-white/40 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[18px]">arrow_back</span> Voltar
            </Link>
            <button 
              className="md:hidden text-white p-2 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Menu Mobile"
              aria-expanded={isMobileMenuOpen ? "true" : "false"}
            >
              <span className="material-symbols-outlined font-light">{isMobileMenuOpen ? 'close' : 'menu'}</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div className={`md:hidden absolute top-20 left-0 w-full bg-background-dark/95 backdrop-blur-xl border-b border-white/10 transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="flex flex-col px-6 py-4 gap-4">
          <a className="text-sm font-bold uppercase tracking-widest text-white/80 hover:text-primary transition-colors" href="/#fleet" onClick={() => setIsMobileMenuOpen(false)}>Frota</a>
          <a className="text-sm font-bold uppercase tracking-widest text-white/80 hover:text-primary transition-colors" href="/#" onClick={() => setIsMobileMenuOpen(false)}>Sobre</a>
          <a className="text-sm font-bold uppercase tracking-widest text-white/80 hover:text-primary transition-colors" href="/#" onClick={() => setIsMobileMenuOpen(false)}>Contato</a>
        </div>
      </div>
    </nav>
  );
}
