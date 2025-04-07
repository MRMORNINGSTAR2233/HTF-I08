import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import './index.css';

// Landing page components
import Navbar from './components/layout/Navbar';
import Hero from './components/layout/Hero';
import Features from './components/layout/Features';
import CTA from './components/layout/CTA';
import Footer from './components/layout/Footer';
import HolographicBackground from './components/effects/HolographicBackground';
import CircuitElements from './components/effects/CircuitElements';
import FloatingShapes from './components/effects/FloatingShapes';
import HowItWorks from './components/sections/HowItWorks';
import Pricing from './components/sections/Pricing';

// Chat components
import ChatLayout from './components/layout/ChatLayout';
import ChatPage from './pages/chat/ChatPage';
import ChatDetails from './pages/chat/ChatDetails';
import DataSourceConfig from './pages/DataSourceConfig';

function LandingPage() {
  useEffect(() => {
    // Add dark mode class to html element
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <div className="min-h-screen bg-dark-900 text-white relative z-0">
      <HolographicBackground color="purple" opacity={0.15} />
      <CircuitElements color="purple" opacity={0.2} />
      <FloatingShapes color="purple" opacity={0.08} />
      <Navbar />
      <main>
        <Hero />
        <Features />
        <HowItWorks />
        <Pricing />
        <CTA />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  useEffect(() => {
    // Add dark mode class to html element
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        
        {/* Chat routes */}
        <Route path="/chat" element={<ChatLayout />}>
          <Route index element={<ChatPage />} />
          <Route path="config" element={<DataSourceConfig />} />
          <Route path=":chatId" element={<ChatDetails />} />
        </Route>

        {/* Fallback route */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </Router>
  );
}

export default App;
