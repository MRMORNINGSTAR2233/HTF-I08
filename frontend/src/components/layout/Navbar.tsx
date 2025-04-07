import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' }
  ];

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId.substring(1));
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <motion.header 
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-dark-800/90 backdrop-blur-md border-b border-white/5 glossy-purple-accent' 
          : 'bg-transparent'
      }`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20 }}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center space-x-2">
            <motion.span 
              className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400"
              animate={{ 
                backgroundPosition: ['0% center', '100% center', '0% center'],
              }}
              transition={{ 
                duration: 15, 
                repeat: Infinity,
                ease: "easeInOut" 
              }}
              style={{ backgroundSize: '200% 100%' }}
            >
              Auralytics
            </motion.span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-6">
            {navItems.map((item, index) => (
              <motion.div 
                key={item.name}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <a 
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.href);
                  }}
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  {item.name}
                </a>
              </motion.div>
            ))}
          </nav>
        </div>
        
        <div className="flex items-center gap-4">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link to="/login" className="hidden sm:inline-flex items-center justify-center rounded px-4 py-2 text-sm font-medium text-gray-300 hover:text-white transition-colors">
              Log in
            </Link>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="purple-glow"
          >
            <Link to="/chat" className="inline-flex items-center justify-center rounded-md bg-primary-600/90 hover:bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors backdrop-blur-sm">
              Try Now
            </Link>
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
} 