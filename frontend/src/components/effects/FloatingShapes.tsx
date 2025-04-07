import { motion } from 'framer-motion';

interface FloatingShapesProps {
  color?: 'blue' | 'purple';
  opacity?: number;
}

export default function FloatingShapes({ 
  color = 'blue', 
  opacity = 0.1 
}: FloatingShapesProps) {
  const baseColor = color === 'blue' ? 'primary' : 'secondary';
  
  const shapes = [
    // Cubes
    { type: 'cube', x: '10%', y: '20%', size: 80, delay: 0 },
    { type: 'cube', x: '85%', y: '15%', size: 60, delay: 2 },
    { type: 'cube', x: '70%', y: '80%', size: 90, delay: 1 },
    
    // Spheres
    { type: 'sphere', x: '25%', y: '75%', size: 70, delay: 1.5 },
    { type: 'sphere', x: '80%', y: '60%', size: 50, delay: 0.5 },
    
    // Pyramids
    { type: 'pyramid', x: '15%', y: '50%', size: 65, delay: 2.5 },
    { type: 'pyramid', x: '60%', y: '30%', size: 75, delay: 3 },
  ];
  
  return (
    <div className="fixed inset-0 -z-15 overflow-hidden pointer-events-none">
      {shapes.map((shape, index) => (
        <motion.div
          key={index}
          className="absolute"
          style={{
            left: shape.x,
            top: shape.y,
            opacity: opacity,
            width: shape.size,
            height: shape.size,
          }}
          animate={{
            y: [0, -20, 0, 20, 0],
            rotateX: [0, 360],
            rotateY: [0, 360],
            rotateZ: [0, 360],
          }}
          transition={{
            y: {
              repeat: Infinity,
              duration: 10 + shape.delay * 2,
              ease: "easeInOut",
              delay: shape.delay,
            },
            rotateX: {
              repeat: Infinity,
              duration: 20 + shape.delay,
              ease: "linear",
              delay: shape.delay,
            },
            rotateY: {
              repeat: Infinity,
              duration: 30 - shape.delay,
              ease: "linear",
              delay: shape.delay,
            },
            rotateZ: {
              repeat: Infinity,
              duration: 40 + shape.delay * 2,
              ease: "linear",
              delay: shape.delay,
            },
          }}
        >
          {shape.type === 'cube' && (
            <div className={`relative w-full h-full text-${baseColor}-400/30 transform-style-3d`}>
              {/* Front face */}
              <div className={`absolute inset-0 border-2 border-${baseColor}-400/30 transform translate-z-[30px] backdrop-blur-sm bg-${baseColor}-900/10`}></div>
              {/* Back face */}
              <div className={`absolute inset-0 border-2 border-${baseColor}-400/30 transform translate-z-[-30px] backdrop-blur-sm bg-${baseColor}-900/10`}></div>
              {/* Right face */}
              <div className={`absolute inset-0 border-2 border-${baseColor}-400/30 transform translate-x-[30px] rotate-y-90 backdrop-blur-sm bg-${baseColor}-900/10`}></div>
              {/* Left face */}
              <div className={`absolute inset-0 border-2 border-${baseColor}-400/30 transform translate-x-[-30px] rotate-y-90 backdrop-blur-sm bg-${baseColor}-900/10`}></div>
              {/* Top face */}
              <div className={`absolute inset-0 border-2 border-${baseColor}-400/30 transform translate-y-[-30px] rotate-x-90 backdrop-blur-sm bg-${baseColor}-900/10`}></div>
              {/* Bottom face */}
              <div className={`absolute inset-0 border-2 border-${baseColor}-400/30 transform translate-y-[30px] rotate-x-90 backdrop-blur-sm bg-${baseColor}-900/10`}></div>
            </div>
          )}
          
          {shape.type === 'sphere' && (
            <div className={`w-full h-full rounded-full border-2 border-${baseColor}-400/30 backdrop-blur-sm bg-${baseColor}-900/10 relative overflow-hidden`}>
              <div className={`absolute inset-0 rounded-full border-4 border-${baseColor}-400/10`}></div>
              <div className={`absolute top-0 left-1/4 right-1/4 h-full border-l-2 border-r-2 border-${baseColor}-400/20`}></div>
              <div className={`absolute left-0 top-1/4 bottom-1/4 w-full border-t-2 border-b-2 border-${baseColor}-400/20`}></div>
            </div>
          )}
          
          {shape.type === 'pyramid' && (
            <div className={`w-full h-full relative text-${baseColor}-400/30`}>
              {/* Base */}
              <div className={`absolute bottom-0 w-full h-full backdrop-blur-sm bg-${baseColor}-900/10 border-2 border-${baseColor}-400/30`} style={{ clipPath: 'polygon(0% 100%, 100% 100%, 50% 0%)' }}></div>
              
              {/* Sides - simplified for rendering */}
              <div className={`absolute bottom-0 w-full h-full backdrop-blur-sm border-2 border-${baseColor}-400/30`} style={{ clipPath: 'polygon(0% 100%, 50% 0%, 50% 100%)' }}></div>
              <div className={`absolute bottom-0 w-full h-full backdrop-blur-sm border-2 border-${baseColor}-400/30`} style={{ clipPath: 'polygon(100% 100%, 50% 0%, 50% 100%)' }}></div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
} 