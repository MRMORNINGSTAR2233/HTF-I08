import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const footerLinks = [
  {
    title: 'Product',
    links: [
      { name: 'Features', href: '#features' },
      { name: 'How it Works', href: '#how-it-works' },
      { name: 'Pricing', href: '#pricing' },
      { name: 'Case Studies', href: '#case-studies' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'Documentation', href: '/docs' },
      { name: 'API', href: '/api' },
      { name: 'Blog', href: '/blog' },
      { name: 'Support', href: '/support' },
    ],
  },
  {
    title: 'Company',
    links: [
      { name: 'About', href: '/about' },
      { name: 'Careers', href: '/careers' },
      { name: 'Contact', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative pt-16 pb-10 border-t border-dark-800">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary-600/40 to-transparent"></div>
      
      {/* Animated background elements */}
      <motion.div 
        className="absolute top-10 right-10 w-60 h-60 bg-primary-500/5 rounded-full filter blur-3xl"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
      <motion.div 
        className="absolute bottom-10 left-10 w-60 h-60 bg-secondary-500/5 rounded-full filter blur-3xl"
        animate={{ 
          scale: [1, 1.1, 1],
          opacity: [0.2, 0.3, 0.2]
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
      />
      
      <div className="container px-4 mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 lg:gap-12 mb-8">
          <div className="col-span-2">
            <Link to="/" className="inline-block mb-4">
              <motion.span 
                className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-400 to-secondary-400"
                animate={{ 
                  backgroundPosition: ['0% center', '100% center', '0% center'],
                }}
                transition={{ 
                  duration: 8, 
                  repeat: Infinity,
                  ease: "easeInOut" 
                }}
                style={{ backgroundSize: '200% 100%' }}
              >
                Auralytics
              </motion.span>
            </Link>
            <p className="text-gray-400 mb-6 max-w-md">
              Transforming audio data into actionable insights that drive business growth and improve decision making.
            </p>
            <div className="flex space-x-4">
              <motion.a 
                href="#" 
                className="text-gray-400 hover:text-primary-400 transition-colors" 
                aria-label="Twitter"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </motion.a>
              <motion.a 
                href="#" 
                className="text-gray-400 hover:text-primary-400 transition-colors" 
                aria-label="LinkedIn"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                </svg>
              </motion.a>
              <motion.a 
                href="#" 
                className="text-gray-400 hover:text-primary-400 transition-colors" 
                aria-label="GitHub"
                whileHover={{ scale: 1.1, rotate: 5 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </motion.a>
            </div>
          </div>
          
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold text-primary-400 tracking-wider uppercase mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <motion.div
                      whileHover={{ x: 3 }}
                      transition={{ type: "spring", stiffness: 500, damping: 15 }}
                    >
                      <Link to={link.href} className="text-gray-400 hover:text-primary-400 transition-colors">
                        {link.name}
                      </Link>
                    </motion.div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        <div className="pt-6 mt-6 border-t border-dark-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500">
            © {new Date().getFullYear()} Auralytics. All rights reserved.
          </p>
          <div className="mt-4 md:mt-0 flex space-x-6">
            <Link to="/terms" className="text-sm text-gray-500 hover:text-primary-400">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm text-gray-500 hover:text-primary-400">
              Privacy Policy
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 