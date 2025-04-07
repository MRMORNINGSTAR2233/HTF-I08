import { motion } from 'framer-motion';

export default function CTA() {
  return (
    <section className="py-16 relative overflow-hidden">
      {/* Animated background elements */}
      <motion.div 
        className="absolute -top-20 -left-20 w-60 h-60 bg-primary-500/10 rounded-full filter blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, 45, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      />
      <motion.div 
        className="absolute -bottom-20 -right-20 w-60 h-60 bg-secondary-500/10 rounded-full filter blur-3xl"
        animate={{ 
          scale: [1, 1.2, 1],
          rotate: [0, -45, 0],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ 
          duration: 15, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.5
        }}
      />
      
      {/* Content */}
      <div className="container px-4 mx-auto">
        <motion.div 
          className="rounded-2xl p-8 md:p-10 relative overflow-hidden glossy-card glossy-purple-accent border border-primary-800/50"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {/* Animated accent shapes */}
          <motion.div 
            className="absolute left-0 top-0 w-32 h-32 bg-primary-500/10 rounded-full filter blur-2xl"
            animate={{ 
              x: [0, 20, 0],
              y: [0, 20, 0],
              rotate: [0, 45, 0]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          <motion.div 
            className="absolute right-0 bottom-0 w-32 h-32 bg-secondary-500/10 rounded-full filter blur-2xl"
            animate={{ 
              x: [0, -20, 0],
              y: [0, -20, 0],
              rotate: [0, -45, 0]
            }}
            transition={{ 
              duration: 10, 
              repeat: Infinity,
              ease: "easeInOut",
              delay: 1
            }}
          />
          
          <div className="relative">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="md:max-w-xl mb-6 md:mb-0">
                <motion.h2 
                  className="text-3xl md:text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  Ready to transform your audio data?
                </motion.h2>
                <motion.p 
                  className="text-lg text-gray-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                >
                  Start using Auralytics today and unlock insights hidden in your audio content.
                </motion.p>
              </div>
              
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <motion.button 
                  className="px-6 py-3 rounded-md bg-primary-600 text-white font-medium transition-all hover:bg-primary-500 purple-glow"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Get Started
                </motion.button>
                <motion.button 
                  className="px-6 py-3 rounded-md bg-dark-800/50 text-white font-medium border border-primary-700/50 backdrop-blur transition-all hover:bg-dark-700/50"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Learn More
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
} 