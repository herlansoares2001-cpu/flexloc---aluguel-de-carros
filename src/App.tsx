import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Importação assíncrona para dividir o pacote (Code Splitting)
const Home = lazy(() => import('./pages/Home'));
const Book = lazy(() => import('./pages/Book'));

// Fallback visual mínimo para manter o layout intocado durante o carregamento
const LoadingFallback = () => <div className="min-h-screen bg-black flex items-center justify-center text-primary tracking-widest text-xs uppercase font-bold text-white">Carregando...</div>;

export default function App() {
  return (
    <Router>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Book />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
