import { Car, Testimonial } from './types';

export const CARS: Car[] = [
  { 
    id: 1, name: 'KWID', brand: 'Renault', category: 'econômico', price: 90, priceDay: 90, 
    weekFsa: 625, weekSsa: null, 
    pricingApp: {
      fsa: { k3: 625, k6: 725, free: 825 },
      ssa: { k3: null, k6: null, free: null }
    },
    image: '/images/kwid.png', img: '/images/kwid.png', transmission: 'Manual', passengers: 4, bags: 1, fuel: 'Flex', feats: ['ar', 'gnv'], catColor: 'text-emerald-400 glow-green', catLabel: 'Econômicos', availablePF: false 
  },
  { 
    id: 2, name: 'Fiat Mobi', brand: 'Fiat', category: 'econômico', price: 150, priceDay: 150, 
    weekFsa: 650, weekSsa: 700, 
    pricingApp: {
      fsa: { k3: 650, k6: 750, free: 850 },
      ssa: { k3: 700, k6: 800, free: 900 }
    },
    image: '/images/mobi.png', img: '/images/mobi.png', transmission: 'Manual', passengers: 4, bags: 1, fuel: 'Flex', feats: ['ar', 'gnv'], catColor: 'text-emerald-400 glow-green', catLabel: 'Econômicos', availablePF: true 
  },
  { 
    id: 3, name: 'Fiat Uno', brand: 'Fiat', category: 'econômico', price: 93, priceDay: 93, 
    weekFsa: 650, weekSsa: 700, 
    pricingApp: {
      fsa: { k3: 650, k6: 750, free: 850 },
      ssa: { k3: 700, k6: 800, free: 900 }
    },
    image: '/images/uno.png', img: '/images/uno.png', transmission: 'Manual', passengers: 5, bags: 2, fuel: 'Flex', feats: ['ar'], catColor: 'text-emerald-400 glow-green', catLabel: 'Econômicos', availablePF: false 
  },
  { 
    id: 4, name: 'Gol', brand: 'Volkswagen', category: 'econômico', price: 100, priceDay: 100, 
    weekFsa: 700, weekSsa: 750, 
    pricingApp: {
      fsa: { k3: 700, k6: 800, free: 900 },
      ssa: { k3: 750, k6: 850, free: 950 }
    },
    image: '/images/gol.png', img: '/images/gol.png', transmission: 'Manual', passengers: 5, bags: 2, fuel: 'Flex', feats: ['ar'], catColor: 'text-emerald-400 glow-green', catLabel: 'Econômicos', availablePF: false 
  },
  { 
    id: 5, name: 'Onix', brand: 'Chevrolet', category: 'econômico', price: 100, priceDay: 100, 
    weekFsa: 700, weekSsa: 750, 
    pricingApp: {
      fsa: { k3: 700, k6: 800, free: 900 },
      ssa: { k3: 750, k6: 850, free: 950 }
    },
    image: '/images/onix.png', img: '/images/onix.png', transmission: 'Automático', passengers: 5, bags: 2, fuel: 'Flex', feats: ['ar', 'multimidia'], catColor: 'text-emerald-400 glow-green', catLabel: 'Econômicos', availablePF: false 
  },
  { 
    id: 6, name: 'Ford Ka Hatch', brand: 'Ford', category: 'econômico', price: 100, priceDay: 100, 
    weekFsa: 700, weekSsa: 750, 
    pricingApp: {
      fsa: { k3: 700, k6: 800, free: 900 },
      ssa: { k3: 750, k6: 850, free: 950 }
    },
    image: '/images/ka.png', img: '/images/ka.png', transmission: 'Manual', passengers: 5, bags: 2, fuel: 'Flex', feats: ['ar'], catColor: 'text-emerald-400 glow-green', catLabel: 'Econômicos', availablePF: false 
  },
  { 
    id: 7, name: 'Prisma', brand: 'Chevrolet', category: 'sedan', price: 107, priceDay: 107, 
    weekFsa: 750, weekSsa: 800, 
    pricingApp: {
      fsa: { k3: 750, k6: 850, free: 950 },
      ssa: { k3: 800, k6: 900, free: 1000 }
    },
    image: '/images/prisma.png', img: '/images/prisma.png', transmission: 'Manual', passengers: 5, bags: 3, fuel: 'Flex', feats: ['ar', 'multimidia'], catColor: 'text-blue-400 glow-blue', catLabel: 'Comfort', availablePF: false 
  },
  { 
    id: 8, name: 'Ford Ka Sedan', brand: 'Ford', category: 'sedan', price: 107, priceDay: 107, 
    weekFsa: 750, weekSsa: 800, 
    pricingApp: {
      fsa: { k3: 750, k6: 850, free: 950 },
      ssa: { k3: 800, k6: 900, free: 1000 }
    },
    image: '/images/ka.png', img: '/images/ka.png', transmission: 'Manual', passengers: 5, bags: 3, fuel: 'Flex', feats: ['ar'], catColor: 'text-blue-400 glow-blue', catLabel: 'Comfort', availablePF: false 
  },
  { 
    id: 9, name: 'Voyage', brand: 'Volkswagen', category: 'sedan', price: 107, priceDay: 107, 
    weekFsa: 750, weekSsa: 850, 
    pricingApp: {
      fsa: { k3: 750, k6: 850, free: 950 },
      ssa: { k3: 850, k6: 950, free: 1050 }
    },
    image: '/images/voyage-1.png', img: '/images/voyage-1.png', transmission: 'Manual', passengers: 5, bags: 3, fuel: 'Flex', feats: ['ar'], catColor: 'text-blue-400 glow-blue', catLabel: 'Comfort', availablePF: false 
  },
  { 
    id: 10, name: 'Peugeot 208', brand: 'Peugeot', category: 'econômico', price: 114, priceDay: 114, 
    weekFsa: 800, weekSsa: 900, 
    pricingApp: {
      fsa: { k3: 800, k6: 900, free: 1000 },
      ssa: { k3: 900, k6: 1000, free: 1100 }
    },
    image: '/images/208.png', img: '/images/208.png', transmission: 'Automático', passengers: 5, bags: 2, fuel: 'Flex', feats: ['ar', 'multimidia'], catColor: 'text-emerald-400 glow-green', catLabel: 'Econômicos', availablePF: false 
  },
  { 
    id: 11, name: 'Spin', brand: 'Chevrolet', category: 'família', price: 129, priceDay: 129, 
    weekFsa: 900, weekSsa: 1000, 
    pricingApp: {
      fsa: { k3: 900, k6: 1000, free: 1100 },
      ssa: { k3: 1000, k6: 1100, free: 1200 }
    },
    image: '/images/spin.png', img: '/images/spin.png', transmission: 'Automático', passengers: 7, bags: 4, fuel: 'Flex', feats: ['ar', 'multimidia'], catColor: 'text-purple-400 glow-purple', catLabel: 'Família', availablePF: false 
  },
  { 
    id: 12, name: 'Peugeot 2008', brand: 'Peugeot', category: 'suv', price: 129, priceDay: 129, 
    weekFsa: 900, weekSsa: 1000, 
    pricingApp: {
      fsa: { k3: 900, k6: 1000, free: 1100 },
      ssa: { k3: 1000, k6: 1100, free: 1200 }
    },
    image: '/images/2008.png', img: '/images/2008.png', transmission: 'Automático', passengers: 5, bags: 3, fuel: 'Flex', feats: ['ar', 'multimidia'], catColor: 'text-amber-400 glow-gold', catLabel: 'Black', availablePF: false 
  },
  { 
    id: 13, name: 'Polo', brand: 'Volkswagen', category: 'sedan', price: 200, priceDay: 200, 
    weekFsa: null, weekSsa: null, 
    pricingApp: {
      fsa: { k3: null, k6: 950, free: 1050 },
      ssa: { k3: null, k6: 1000, free: 1100 }
    },
    image: '/images/polo.png', img: '/images/polo.png', transmission: 'Automático', passengers: 5, bags: 2, fuel: 'Flex', feats: ['ar', 'multimidia'], catColor: 'text-blue-400 glow-blue', catLabel: 'Comfort', availablePF: true 
  },
  { 
    id: 14, name: 'C4 Cactus', brand: 'Citroën', category: 'suv', price: 143, priceDay: 143, 
    weekFsa: 1000, weekSsa: 1100, 
    pricingApp: {
      fsa: { k3: 1000, k6: 1100, free: 1200 },
      ssa: { k3: 1100, k6: 1200, free: 1300 }
    },
    image: '/images/cactus.png', img: '/images/cactus.png', transmission: 'Automático', passengers: 5, bags: 3, fuel: 'Flex', feats: ['ar', 'multimidia', 'automatico'], catColor: 'text-amber-400 glow-gold', catLabel: 'Black', availablePF: false 
  },
  { 
    id: 15, name: 'Duster', brand: 'Renault', category: 'suv', price: 250, priceDay: 250, 
    weekFsa: 1000, weekSsa: 1100, 
    pricingApp: {
      fsa: { k3: 1000, k6: 1100, free: 1200 },
      ssa: { k3: 1100, k6: 1200, free: 1300 }
    },
    image: '/images/duster.png', img: '/images/duster.png', transmission: 'Manual', passengers: 5, bags: 4, fuel: 'Flex', feats: ['ar', 'multimidia'], catColor: 'text-amber-400 glow-gold', catLabel: 'Black', availablePF: true 
  },
];

export const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'Carlos Eduardo',
    role: 'Motorista de App',
    content: 'A Flexloc me ajudou a voltar a trabalhar rápido. Carro excelente e econômico com GNV.',
    avatar: 'https://picsum.photos/seed/carlos/100/100'
  },
  {
    id: '2',
    name: 'Mariana Silva',
    role: 'Viajante',
    content: 'Aluguei um SUV para minha viagem em família e foi a melhor decisão. Conforto e segurança total.',
    avatar: 'https://picsum.photos/seed/mariana/100/100'
  },
  {
    id: '3',
    name: 'Ricardo Oliveira',
    role: 'Executivo',
    content: 'Processo rápido e sem burocracia. Recomendo fortemente para quem busca agilidade.',
    avatar: 'https://picsum.photos/seed/ricardo/100/100'
  }
];
