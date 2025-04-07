import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Upload Your Audio",
      description: "Upload any audio file or connect a live stream source to our platform. We support all major formats and can process both pre-recorded and real-time content.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      )
    },
    {
      number: "02",
      title: "AI Processing",
      description: "Our advanced AI analyzes your audio in real-time, identifying speakers, emotions, key topics, and important segments. The neural network extracts meaningful insights from even the most complex audio.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      number: "03",
      title: "Visualize & Analyze",
      description: "Access intuitive visualizations that transform complex audio data into actionable insights. Our dashboards highlight patterns, trends, and key moments that would otherwise remain hidden.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
        </svg>
      )
    },
    {
      number: "04",
      title: "Take Action",
      description: "Export reports, share insights with your team, or integrate with your existing workflows through our API. Convert audio intelligence into business actions that drive results.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      )
    }
  ];

  return (
    <section id="how-it-works" className="py-20 md:py-28 relative">
      {/* Background glow effects */}
      <motion.div 
        className="absolute top-1/3 right-1/4 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl opacity-30"
        animate={{ 
          scale: [1, 1.2, 1, 0.9, 1]
        }}
        transition={{ 
          duration: 25, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      ></motion.div>
      <motion.div 
        className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-secondary-500/10 rounded-full filter blur-3xl opacity-30"
        animate={{ 
          scale: [1, 0.8, 1, 1.2, 1]
        }}
        transition={{ 
          duration: 20, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1 
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
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-400">
              How Auralytics Works
            </span>
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Our four-step process transforms your audio into valuable insights with minimal effort
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mt-16">
          {steps.map((step, index) => (
            <motion.div 
              key={index}
              className="glossy-card rounded-xl p-8 glossy-purple-accent relative overflow-hidden"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: "0 0 20px 0 rgba(124, 58, 237, 0.3)"
              }}
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0">
                  <div className="w-16 h-16 rounded-full bg-primary-500/20 flex items-center justify-center text-primary-400">
                    {step.icon}
                  </div>
                </div>
                <div>
                  <div className="text-5xl font-bold text-primary-600/20 absolute -top-2 -right-2">{step.number}</div>
                  <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                  <p className="text-gray-400">{step.description}</p>
                </div>
              </div>
              
              {/* Animated pulse highlight */}
              <motion.div 
                className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary-500/30 to-secondary-500/30 opacity-0"
                animate={{
                  opacity: [0, 0.2, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  repeatDelay: index + 2,
                }}
                style={{ zIndex: -1 }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
} 