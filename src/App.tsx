import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Code-splitting: as páginas só são carregadas quando o usuário acessa a rota
const Home = lazy(() => import('./pages/Home'));
const Book = lazy(() => import('./pages/Book'));

export default function App() {
  return (
    <Router>
      {/* Fallback visual enquanto o JS da página é baixado */}
      <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center text-primary">Carregando FlexLoc...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Book />} />
        </Routes>
      </Suspense>
    </Router>
  );
}
