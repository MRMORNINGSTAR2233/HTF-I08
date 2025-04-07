import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const exampleCards = [
  {
    title: "Analyze phone call sentiment",
    description: "Identify customer satisfaction trends from service call recordings",
    icon: "🗣️"
  },
  {
    title: "Extract podcast insights",
    description: "Summarize key points and topics from audio content",
    icon: "🎙️"
  },
  {
    title: "Process meeting recordings",
    description: "Capture action items and decisions from team discussions",
    icon: "📝"
  },
  {
    title: "Detect voice biometrics",
    description: "Authenticate users through unique voice patterns",
    icon: "🔐"
  },
  {
    title: "Track music engagement",
    description: "Measure audience response to audio tracks in real-time",
    icon: "🎵"
  },
  {
    title: "Monitor environmental sounds",
    description: "Alert to unusual noises in security or industrial settings",
    icon: "🔊"
  }
];

export default function Hero() {
  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId.substring(1));
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative pt-28 pb-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 -z-10 opacity-20">
        <motion.div 
          className="absolute -top-48 -left-48 w-96 h-96 bg-primary-500/20 rounded-full filter blur-3xl animate-pulse-glow"
          animate={{ 
            scale: [1, 1.05, 1, 0.95, 1]
          }}
          transition={{ 
            duration: 20, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
        ></motion.div>
        <motion.div 
          className="absolute top-1/4 right-0 w-80 h-80 bg-secondary-500/20 rounded-full filter blur-3xl animate-pulse-glow" 
          style={{ animationDelay: '1s' }}
          animate={{ 
            scale: [1, 0.95, 1, 1.05, 1]
          }}
          transition={{ 
            duration: 25, 
            repeat: Infinity, 
            ease: "easeInOut", 
            delay: 2 
          }}
        ></motion.div>
        <motion.div 
          className="absolute bottom-0 left-1/3 w-64 h-64 bg-secondary-400/20 rounded-full filter blur-3xl animate-pulse-glow"
          style={{ animationDelay: '2s' }}
          animate={{ 
            scale: [1, 1.1, 1, 0.9, 1]
          }}
          transition={{ 
            duration: 18, 
            repeat: Infinity, 
            ease: "easeInOut", 
            delay: 1 
          }}
        ></motion.div>
      </div>

      <div className="container px-4 mx-auto text-center">
        <div className="max-w-4xl mx-auto mb-16">
          <motion.h1 
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <span>
              Decode audio data.
            </span>
            <br />
            <span>
              Find valuable patterns.
            </span>
            <br />
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400"
              style={{ backgroundSize: '200% 100%' }}
            >
              Drive better decisions.
            </span>
          </motion.h1>
          
          <motion.p 
            className="text-lg md:text-xl text-gray-300 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            Free to use. Easy to implement. Auralytics AI can help with audio analysis, pattern recognition, speech processing, and more.
          </motion.p>
          
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link 
                to="/signup" 
                className="rounded-md px-6 py-3 bg-primary-600/90 hover:bg-primary-600 text-white transition-colors backdrop-blur-sm purple-glow"
              >
                Start now →
              </Link>
            </motion.div>
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <a 
                href="#how-it-works" 
                onClick={(e) => {
                  e.preventDefault();
                  scrollToSection('#how-it-works');
                }}
                className="rounded-md px-6 py-3 bg-dark-800/80 text-gray-300 hover:text-white transition-colors"
              >
                How it works →
              </a>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Example cards grid with continuous horizontal movement */}
        <div className="relative overflow-hidden py-10">
          <div className="relative" style={{ width: '100%', overflowX: 'hidden' }}>
            {/* First row - left to right */}
            <motion.div
              className="flex gap-4 flex-nowrap"
              animate={{ 
                x: ["calc(-50%)", "0%"] 
              }}
              transition={{ 
                x: {
                  duration: 15,
                  repeat: Infinity,
                  repeatType: "loop",
                  ease: "linear"
                }
              }}
              style={{
                width: "max-content"
              }}
            >
              {/* Duplicate the cards to create an infinite loop effect */}
              {[...exampleCards, ...exampleCards].map((card, index) => (
                <motion.div 
                  key={index} 
                  className="glossy-card p-6 rounded-xl text-left hover:bg-dark-700/50 cursor-pointer glossy-purple-accent flex-shrink-0"
                  style={{ width: "300px" }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">
                      {card.icon}
                    </span>
                    <div>
                      <h3 className="font-medium text-white mb-1">
                        {card.title}
                      </h3>
                      <p className="text-gray-400 text-sm">{card.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
} 