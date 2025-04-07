import { motion } from 'framer-motion';

const features = [
  {
    title: "Real-time Analysis",
    description: "Process audio streams in real-time, extracting valuable insights as they happen.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Powerful Visualization",
    description: "Transform complex audio data into intuitive visuals that reveal hidden patterns.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      </svg>
    ),
  },
  {
    title: "Advanced AI Processing",
    description: "Our AI technology accurately identifies speakers, emotions, and key topics in your audio.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
];

const secondRowFeatures = [
  {
    title: "Seamless Integration",
    description: "Easily integrate with your existing tools and workflows through our robust API.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: "Actionable Insights",
    description: "Turn raw data into actionable business intelligence with our comprehensive reporting.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
  },
  {
    title: "Enterprise Security",
    description: "Rest easy with industry-leading encryption and privacy-focused data handling.",
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
  },
];

// Combine all features for the scrolling animation
const allFeatures = [...features, ...secondRowFeatures];

export default function Features() {
  return (
    <section id="features" className="py-20 md:py-28 relative">
      {/* Glossy highlight effect */}
      <motion.div 
        className="absolute top-1/4 right-1/4 w-80 h-80 bg-primary-500/10 rounded-full filter blur-3xl opacity-30"
        animate={{ 
          scale: [1, 1.1, 1, 0.9, 1]
        }}
        transition={{ 
          duration: 30, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      ></motion.div>
      <motion.div 
        className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-secondary-500/10 rounded-full filter blur-3xl opacity-30"
        animate={{ 
          scale: [1, 0.9, 1, 1.1, 1]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2 
        }}
      ></motion.div>
      
      <div className="container px-4 mx-auto relative">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-3xl sm:text-4xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span 
              className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400"
              style={{ backgroundSize: '200% 100%' }}
            >
              Writes, brainstorms, edits,
            </span> and explores ideas with you
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Auralytics brings together cutting-edge audio processing technology and intuitive design
            to deliver insights you can act on.
          </motion.p>
        </div>
        
        {/* Features with continuous right to left motion */}
        <div className="space-y-12">
          {/* First row */}
          <div className="relative overflow-hidden py-4">
            <div className="relative" style={{ width: '100%', overflowX: 'hidden' }}>
              <motion.div
                className="flex gap-4 flex-nowrap"
                animate={{ 
                  x: ["0%", "calc(-50%)"] 
                }}
                transition={{ 
                  x: {
                    duration: 12,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear"
                  }
                }}
                style={{
                  width: "max-content"
                }}
              >
                {/* Duplicate the features to create an infinite loop effect */}
                {[...allFeatures, ...allFeatures].map((feature, index) => (
                  <motion.div
                    key={index}
                    className="glossy-card rounded-xl p-6 glossy-purple-accent flex-shrink-0"
                    style={{ width: "350px" }}
                    initial={{ opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div 
                      className="rounded-full w-12 h-12 flex items-center justify-center bg-primary-500/20 text-primary-400 mb-4"
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
          
          {/* Second row - slightly faster */}
          <div className="relative overflow-hidden py-4">
            <div className="relative" style={{ width: '100%', overflowX: 'hidden' }}>
              <motion.div
                className="flex gap-4 flex-nowrap"
                animate={{ 
                  x: ["0%", "calc(-50%)"] 
                }}
                transition={{ 
                  x: {
                    duration: 9,
                    repeat: Infinity,
                    repeatType: "loop",
                    ease: "linear"
                  }
                }}
                style={{
                  width: "max-content"
                }}
              >
                {/* Duplicate and reverse the features for variety */}
                {[...allFeatures.reverse(), ...allFeatures.reverse()].map((feature, index) => (
                  <motion.div
                    key={`second-${index}`}
                    className="glossy-card rounded-xl p-6 glossy-purple-accent flex-shrink-0"
                    style={{ width: "350px" }}
                    initial={{ opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                  >
                    <div 
                      className="rounded-full w-12 h-12 flex items-center justify-center bg-secondary-500/20 text-secondary-400 mb-4"
                    >
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-medium text-white mb-2">{feature.title}</h3>
                    <p className="text-gray-400">{feature.description}</p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
} 