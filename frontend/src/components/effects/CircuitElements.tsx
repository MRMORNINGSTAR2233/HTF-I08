import { motion } from 'framer-motion';

interface CircuitElementsProps {
  color?: 'blue' | 'purple';
  opacity?: number;
}

export default function CircuitElements({ 
  color = 'blue', 
  opacity = 0.2 
}: CircuitElementsProps) {
  const baseColor = color === 'blue' ? 'primary' : 'secondary';
  
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Circuit paths */}
      <svg
        className="absolute h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1000 1000"
        style={{ opacity }}
      >
        <g fill="none" stroke={`currentColor`} strokeWidth="1" className={`text-${baseColor}-400/30`}>
          {/* Horizontal circuit */}
          <motion.path
            d="M0,300 H400 Q410,300 410,310 V400 Q410,410 420,410 H550 Q560,410 560,420 V480 Q560,490 570,490 H1000"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 0.5 
            }}
            transition={{ 
              duration: 2,
              ease: "easeInOut"
            }}
          />
          
          {/* Vertical circuit with nodes */}
          <motion.path
            d="M300,0 V250 Q300,260 310,260 H370 Q380,260 380,270 V480 Q380,490 390,490 H450 Q460,490 460,500 V1000"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 0.4
            }}
            transition={{ 
              duration: 2.5,
              delay: 0.5,
              ease: "easeInOut"
            }}
          />
          
          {/* Diagonal circuit */}
          <motion.path
            d="M1000,200 L800,400 Q795,405 790,410 L600,600 Q595,605 590,610 L400,800 Q390,810 380,820 L200,1000"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 0.3 
            }}
            transition={{ 
              duration: 3,
              delay: 1,
              ease: "easeInOut"
            }}
          />
          
          {/* Curved circuit */}
          <motion.path
            d="M0,600 H200 Q210,600 220,590 L300,510 Q310,500 320,500 H450 Q460,500 460,490 V400 Q460,390 470,390 H700 Q710,390 710,380 V0"
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ 
              pathLength: 1, 
              opacity: 0.6
            }}
            transition={{ 
              duration: 2.8,
              delay: 0.7,
              ease: "easeInOut"
            }}
          />
        </g>
        
        {/* Data pulses */}
        <motion.circle
          cx="410"
          cy="410"
          r="4"
          className={`fill-${baseColor}-400`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1,
            repeatDelay: 3
          }}
        />
        
        <motion.circle
          cx="560"
          cy="490"
          r="4"
          className={`fill-${baseColor}-400`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 2,
            repeatDelay: 4
          }}
        />
        
        <motion.circle
          cx="380"
          cy="270"
          r="4"
          className={`fill-${baseColor}-400`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 1.5,
            repeatDelay: 2.5
          }}
        />
        
        <motion.circle
          cx="600"
          cy="600"
          r="4"
          className={`fill-${baseColor}-400`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 3,
            repeatDelay: 5
          }}
        />
        
        <motion.circle
          cx="460"
          cy="500"
          r="4"
          className={`fill-${baseColor}-400`}
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            delay: 2.5,
            repeatDelay: 3.5
          }}
        />
      </svg>
      
      {/* Connection points */}
      <div className="absolute inset-0">
        {/* Top right connection */}
        <motion.div 
          className={`absolute top-[10%] right-[25%] w-4 h-4 rounded-full border border-${baseColor}-400/50`}
          animate={{
            boxShadow: [
              `0 0 0 0 rgba(var(--${baseColor}-500-rgb), 0)`,
              `0 0 0 8px rgba(var(--${baseColor}-500-rgb), 0.1)`,
              `0 0 0 0 rgba(var(--${baseColor}-500-rgb), 0)`
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 1
          }}
        />
        
        {/* Bottom left connection */}
        <motion.div 
          className={`absolute bottom-[20%] left-[15%] w-4 h-4 rounded-full border border-${baseColor}-400/50`}
          animate={{
            boxShadow: [
              `0 0 0 0 rgba(var(--${baseColor}-500-rgb), 0)`,
              `0 0 0 8px rgba(var(--${baseColor}-500-rgb), 0.1)`,
              `0 0 0 0 rgba(var(--${baseColor}-500-rgb), 0)`
            ]
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            repeatDelay: 2,
            delay: 1.5
          }}
        />
        
        {/* Middle connection */}
        <motion.div 
          className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 rounded-full border border-${baseColor}-400/50`}
          animate={{
            boxShadow: [
              `0 0 0 0 rgba(var(--${baseColor}-500-rgb), 0)`,
              `0 0 0 15px rgba(var(--${baseColor}-500-rgb), 0.1)`,
              `0 0 0 0 rgba(var(--${baseColor}-500-rgb), 0)`
            ]
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            repeatDelay: 0.5
          }}
        />
      </div>
    </div>
  );
} 