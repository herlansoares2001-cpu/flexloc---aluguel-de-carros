import { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Lenis from 'lenis';

// Importação assíncrona para dividir o pacote (Code Splitting)
const Home = lazy(() => import('./pages/Home'));
const Book = lazy(() => import('./pages/Book'));
const Contact = lazy(() => import('./pages/Contact'));

// Componente para gerenciar o scroll entre rotas e inicializar o Lenis
function ScrollManager() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }

    requestAnimationFrame(raf);

    // Reset scroll on path change or handle hash
    if (!hash) {
      window.scrollTo(0, 0);
      lenis.scrollTo(0, { immediate: true });
    } else {
      const target = document.querySelector(hash);
      if (target) {
        lenis.scrollTo(target as HTMLElement, { offset: -80 });
      }
    }

    return () => {
      lenis.destroy();
    };
  }, [pathname, hash]);

  return null;
}

// Fallback visual mínimo para manter o layout intocado durante o carregamento
const LoadingFallback = () => <div className="min-h-screen bg-black flex items-center justify-center text-primary tracking-widest text-xs uppercase font-bold text-white">Carregando...</div>;

export default function App() {
  return (
    <Router>
      <ScrollManager />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Book />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
