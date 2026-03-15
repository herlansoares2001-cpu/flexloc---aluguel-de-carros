export interface Car {
  id: string | number;
  name: string;
  brand: string;
  category: string;
  price: number;
  priceDay?: number;
  weekFsa?: number | null;
  weekSsa?: number | null;
  pricingApp?: {
    fsa: {
      k3: number | null;
      k6: number | null;
      free: number | null;
    };
    ssa: {
      k3: number | null;
      k6: number | null;
      free: number | null;
    };
  };
  image: string;
  img?: string;
  transmission: string;
  passengers: number;
  bags: number;
  fuel: string;
  feats?: string[];
  catColor?: string;
  catLabel?: string;
  availablePF?: boolean;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar: string;
}
