import React from 'react';
import Navbar from '../components/Navbar';
import { Link } from 'react-router-dom';

export default function Contact() {
    return (
        <div className="min-h-screen bg-black flex flex-col">
            <div id="spotlight"></div>
            <Navbar />

            <main className="flex-grow pt-20 pb-20 relative z-10">
                <div className="max-w-7xl mx-auto px-6 lg:px-8">
                    {/* Hero Header Section */}
                    <div className="mb-16 text-center max-w-3xl mx-auto">
                        <h1 className="text-3xl md:text-5xl font-light text-white tracking-tight leading-tight mb-6">
                            Vamos levar sua <span className="font-medium bg-clip-text text-transparent italic text-gradient-animate px-2 pb-1 inline-block">visão</span> adiante.
                        </h1>
                        <p className="text-gray-400 text-base md:text-lg font-light leading-relaxed max-w-xl mx-auto">
                            Nossa equipe de concierge está disponível para auxiliar com suas necessidades automotivas premium. Experimente o auge da gestão de veículos e logística.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                        {/* Left Column: Contact Details */}
                        <div className="lg:col-span-12 xl:col-span-5 space-y-6">
                            <div className="glass-panel p-8 rounded-2xl group hover:border-primary/30 transition-all duration-500">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                        <span className="material-symbols-outlined font-light text-2xl">chat_bubble</span>
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-3 mb-1">
                                            <h4 className="font-display text-xl font-bold text-white">Consultor Netu</h4>
                                            <span className="bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Fast</span>
                                        </div>
                                        <p className="text-gray-400 text-sm mb-4 font-light">Atendimento costuma ser mais rápido através deste canal.</p>
                                        <a className="text-primary font-bold text-sm tracking-[0.1em] flex items-center gap-2 group-hover:gap-4 transition-all" href="https://wa.me/5575997333333" target="_blank" rel="noopener noreferrer">
                                            (75) 99733-3333 <span className="material-symbols-outlined text-sm">open_in_new</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel p-8 rounded-2xl group hover:border-primary/30 transition-all duration-500">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                        <span className="material-symbols-outlined font-light text-2xl">chat_bubble</span>
                                    </div>
                                    <div>
                                        <h4 className="font-display text-xl font-bold text-white mb-1">Consultor Adailton</h4>
                                        <p className="text-gray-400 text-sm mb-4 font-light">Atendimento personalizado para sua locação.</p>
                                        <a className="text-primary font-bold text-sm tracking-[0.1em] flex items-center gap-2 group-hover:gap-4 transition-all" href="https://wa.me/5575981333333" target="_blank" rel="noopener noreferrer">
                                            (75) 98133-3333 <span className="material-symbols-outlined text-sm">open_in_new</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel p-8 rounded-2xl group hover:border-primary/30 transition-all duration-500">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                        <span className="material-symbols-outlined font-light text-2xl">mail</span>
                                    </div>
                                    <div>
                                        <h4 className="font-display text-xl font-bold text-white mb-1">E-mail Oficial</h4>
                                        <p className="text-gray-400 text-sm mb-4 font-light">Resposta em até 2 horas para inquéritos e parcerias.</p>
                                        <a className="text-primary font-bold text-sm tracking-[0.1em] flex items-center gap-2 group-hover:gap-4 transition-all" href="mailto:contato@flexloc.net">
                                            contato@flexloc.net <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                        </a>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel p-8 rounded-2xl group hover:border-primary/30 transition-all duration-500">
                                <div className="flex items-start gap-6">
                                    <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform duration-500 shrink-0">
                                        <span className="material-symbols-outlined font-light text-2xl">location_on</span>
                                    </div>
                                    <div>
                                        <h4 className="font-display text-xl font-bold text-white mb-1">Sede FlexLoc</h4>
                                        <p className="text-gray-400 text-sm mb-1 font-light">R. Carlos Alberto, 14 - Cidade Nova</p>
                                        <p className="text-gray-500 text-xs mb-4 font-light uppercase tracking-widest">Feira de Santana - BA, CEP: 44053-274</p>
                                        <a className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-white text-[10px] font-bold uppercase tracking-widest hover:bg-primary hover:text-black transition-all flex items-center gap-2 w-fit mt-4" 
                                           href="https://www.google.com/maps/search/?api=1&query=R.+Carlos+Alberto,+14+-+Cidade+Nova,+Feira+de+Santana+-+BA,+44053-274" target="_blank" rel="noopener noreferrer">
                                            Ver no mapa <span className="material-symbols-outlined text-xs font-light">map</span>
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Right Column: Contact Form */}
                        <div className="lg:col-span-12 xl:col-span-7">
                            <div className="glass-panel p-8 md:p-12 rounded-3xl border-primary/10 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[120px] pointer-events-none"></div>
                                
                                <form className="relative z-10 space-y-10">
                                    <div className="grid md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase ml-1">Nome Completo</label>
                                            <input className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-700 font-light" placeholder="Ex: João Silva" type="text"/>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase ml-1">E-mail de Contato</label>
                                            <input className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-700 font-light" placeholder="joao@exemplo.com" type="email"/>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase ml-1">Tipo de Serviço</label>
                                        <div className="relative">
                                            <select className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-4 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all appearance-none font-light">
                                                <option className="bg-background-dark">Locação Particular</option>
                                                <option className="bg-background-dark">Motorista de Aplicativo</option>
                                                <option className="bg-background-dark">Gestão de Frotas</option>
                                                <option className="bg-background-dark">Terceirização Corporativa</option>
                                            </select>
                                            <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none">expand_more</span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-bold tracking-[0.2em] text-gray-500 uppercase ml-1">Sua Mensagem</label>
                                        <textarea className="w-full bg-white/[0.03] border border-white/10 rounded-xl px-5 py-5 text-white focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-gray-700 resize-none font-light" placeholder="Conte-nos sobre seus requisitos..." rows={5}></textarea>
                                    </div>
                                    
                                    <div className="space-y-6">
                                        <button className="w-full py-5 bg-primary text-black font-display font-black text-sm tracking-[0.3em] rounded-xl hover:bg-white transition-all transform hover:scale-[1.01] uppercase shadow-2xl shadow-primary/20" type="submit">
                                            Enviar Mensagem
                                        </button>
                                        
                                        <div className="flex items-center justify-center gap-6">
                                            <div className="flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-primary/60 animate-pulse"></div>
                                                <span className="text-[9px] font-bold text-gray-500 tracking-widest uppercase text-center">Tempo de resposta: &lt; 15 mins</span>
                                            </div>
                                            <div className="w-px h-3 bg-white/10"></div>
                                            <span className="text-[9px] font-bold text-gray-500 tracking-widest uppercase text-center">Suporte 24/7 Ativo</span>
                                        </div>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <footer className="w-full bg-[#0A0A0A] border-t border-white/5 pt-16 pb-8 font-sans relative z-20">
                <div className="max-w-[1400px] mx-auto px-6 md:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12 lg:gap-8 mb-16">
                        <div className="lg:col-span-2">
                            <div className="flex items-center gap-2 mb-6">
                                <img src="/images/logo.png" decoding="async" loading="lazy" alt="Flexloc Logo" className="h-6 w-auto object-contain" />
                            </div>
                            <p className="text-[#71717A] text-base leading-relaxed max-w-sm mb-8">
                                A Flexloc oferece locação de veículos com economia, praticidade e aprovação rápida. Ideal para motoristas de aplicativos, entregadores ou pessoas que precisam de um carro confiável para o dia a dia.
                            </p>
                            <div className="flex flex-col gap-3">
                                <a href="https://www.instagram.com/flexlocbrasil/" target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-3 px-6 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm font-bold hover:bg-white/10 hover:border-primary/50 transition-all duration-300 group w-fit">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" className="text-primary transition-transform duration-300 group-hover:scale-110">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.791-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.209-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                    Seguir no Instagram
                                </a>
                                <a href="https://wa.me/5575981333333" target="_blank" rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center gap-3 px-6 py-2.5 bg-primary text-background-dark rounded-xl text-xs font-black uppercase tracking-wider hover:bg-white hover:scale-[1.02] transition-all duration-300 shadow-[0_10px_20px_rgba(230,197,25,0.1) w-fit">
                                    <span className="material-symbols-outlined text-lg">chat</span>
                                    Atendimento
                                </a>
                            </div>
                        </div>
                        <div>
                            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Aluguel</h4>
                            <ul className="space-y-4">
                                <li><a className="text-[#71717A] hover:text-primary transition-colors text-sm" href="#">Frota Econômica (GNV)</a></li>
                                <li><a className="text-[#71717A] hover:text-primary transition-colors text-sm" href="#">Sedãs Executivos</a></li>
                                <li><a className="text-[#71717A] hover:text-primary transition-colors text-sm" href="#">SUVs &amp; Família</a></li>
                                <li><a className="text-[#71717A] hover:text-primary transition-colors text-sm" href="#">Aluguel Semanal</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Corporativo</h4>
                            <ul className="space-y-4">
                                <li><a className="text-[#71717A] hover:text-primary transition-colors text-sm" href="#">Terceirização de Frota</a></li>
                                <li><a className="text-[#71717A] hover:text-primary transition-colors text-sm" href="#">Locação de Longo Prazo</a></li>
                                <li><a className="text-[#71717A] hover:text-primary transition-colors text-sm" href="#">Gestão de Ativos</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-6">Empresa</h4>
                            <ul className="space-y-4">
                                <li><Link className="text-[#71717A] hover:text-primary transition-colors text-sm" to="/contact">Central de Contato</Link></li>
                                <li><a className="text-[#71717A] hover:text-primary transition-colors text-sm" href="#">Sobre a FlexLoc</a></li>
                                <li><a className="text-[#71717A] hover:text-primary transition-colors text-sm" href="#">Termos e Condições</a></li>
                            </ul>
                        </div>
                    </div>
                    <div className="pt-8 border-t border-white/5 flex flex-col md:row justify-between items-center gap-6">
                        <p className="text-[#71717A] text-xs font-light">
                            © {new Date().getFullYear()} FlexLoc Locação de Veículos. Todos os direitos reservados.
                        </p>
                        <div className="flex gap-8">
                            <a className="text-[#71717A] hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold" href="#">Privacidade</a>
                            <a className="text-[#71717A] hover:text-white transition-colors text-[10px] uppercase tracking-widest font-bold" href="#">Cookies</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
