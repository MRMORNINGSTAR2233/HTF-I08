import { motion } from 'framer-motion';

const pricingTiers = [
  {
    title: "Starter",
    price: "$49",
    period: "per month",
    description: "Perfect for individuals and small projects",
    features: [
      "5 hours of audio processing per month",
      "Basic visualization tools",
      "2 user accounts",
      "7-day data retention",
      "Email support"
    ],
    cta: "Start Free Trial",
    highlight: false
  },
  {
    title: "Pro",
    price: "$99",
    period: "per month",
    description: "Ideal for growing teams and businesses",
    features: [
      "20 hours of audio processing per month",
      "Advanced visualization suite",
      "10 user accounts",
      "30-day data retention",
      "API access with 1,000 requests/day",
      "Priority email & chat support"
    ],
    cta: "Start Free Trial",
    highlight: true
  },
  {
    title: "Enterprise",
    price: "Custom",
    period: "contact for pricing",
    description: "For organizations with high-volume needs",
    features: [
      "Unlimited audio processing",
      "Full visualization & analytics suite",
      "Unlimited user accounts",
      "90-day data retention",
      "Unlimited API access",
      "Dedicated account manager",
      "24/7 phone, email & chat support",
      "Custom integration options"
    ],
    cta: "Contact Sales",
    highlight: false
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 md:py-28 relative">
      {/* Background glow effects */}
      <motion.div 
        className="absolute top-1/4 right-1/3 w-96 h-96 bg-secondary-500/10 rounded-full filter blur-3xl opacity-30"
        animate={{ 
          scale: [1, 1.1, 1, 0.9, 1]
        }}
        transition={{ 
          duration: 22, 
          repeat: Infinity,
          ease: "easeInOut" 
        }}
      ></motion.div>
      <motion.div 
        className="absolute bottom-1/3 left-1/3 w-96 h-96 bg-primary-500/10 rounded-full filter blur-3xl opacity-30"
        animate={{ 
          scale: [1, 0.9, 1, 1.1, 1]
        }}
        transition={{ 
          duration: 18, 
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
              Simple, Transparent Pricing
            </span>
          </motion.h2>
          <motion.p 
            className="text-lg text-gray-300 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Choose the perfect plan for your needs. All plans include a 14-day free trial.
          </motion.p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          {pricingTiers.map((tier, index) => (
            <motion.div 
              key={index}
              className={`glossy-card rounded-xl overflow-hidden ${tier.highlight ? 'border-primary-500/30' : 'border-white/5'}`}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ 
                scale: 1.02,
                boxShadow: tier.highlight 
                  ? "0 0 25px 0 rgba(124, 58, 237, 0.3)" 
                  : "0 0 20px 0 rgba(0, 0, 0, 0.3)"
              }}
            >
              {tier.highlight && (
                <div className="bg-gradient-to-r from-primary-500 to-secondary-500 text-center text-white text-sm py-1 font-medium">
                  Most Popular
                </div>
              )}
              
              <div className="p-8">
                <h3 className="text-2xl font-bold text-white mb-2">{tier.title}</h3>
                <div className="mb-4">
                  <span className="text-4xl font-bold">{tier.price}</span>
                  <span className="text-gray-400 ml-2">{tier.period}</span>
                </div>
                <p className="text-gray-300 mb-6">{tier.description}</p>
                
                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <svg className="h-6 w-6 text-primary-400 mr-2 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <motion.button
                  className={`w-full py-3 px-4 rounded-md font-medium transition-all ${
                    tier.highlight
                      ? 'bg-primary-600 hover:bg-primary-500 text-white purple-glow'
                      : 'bg-white/10 hover:bg-white/20 text-white'
                  }`}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {tier.cta}
                </motion.button>
              </div>
              
              {tier.highlight && (
                <motion.div 
                  className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-primary-500/20 to-secondary-500/20 opacity-0"
                  animate={{
                    opacity: [0, 0.3, 0],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    repeatDelay: 2,
                  }}
                  style={{ zIndex: -1 }}
                />
              )}
            </motion.div>
          ))}
        </div>
        
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <p className="text-gray-400">
            Need a custom solution? <a href="#contact" className="text-primary-400 hover:text-primary-300 underline">Contact us</a> for personalized pricing.
          </p>
        </motion.div>
      </div>
    </section>
  );
} 