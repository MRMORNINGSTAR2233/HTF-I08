import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

interface HolographicBackgroundProps {
  color?: 'blue' | 'purple';
  opacity?: number;
}

export default function HolographicBackground({ 
  color = 'blue', 
  opacity = 0.15 
}: HolographicBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set canvas dimensions
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Grid properties
    const gridSize = 20;
    const horizontalLines = Math.ceil(canvas.height / gridSize);
    const verticalLines = Math.ceil(canvas.width / gridSize);
    
    // Particles
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      alpha: number;
      decay: number;
    }
    
    const particles: Particle[] = [];
    const maxParticles = 40;
    
    for (let i = 0; i < maxParticles; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 0.5,
        speedX: (Math.random() - 0.5) * 0.3,
        speedY: (Math.random() - 0.5) * 0.3,
        alpha: Math.random() * 0.5 + 0.1,
        decay: 0.001 + Math.random() * 0.001
      });
    }
    
    // Animation properties
    let wavePhase = 0;
    let glowPhase = 0;
    
    // Color settings
    const baseColor = color === 'blue' 
      ? { r: 120, g: 160, b: 255 } 
      : { r: 180, g: 130, b: 255 };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Increase phases
      wavePhase += 0.02;
      glowPhase += 0.01;
      
      // Draw grid
      ctx.lineWidth = 0.5;
      
      // Horizontal grid lines with wave effect
      for (let i = 0; i <= horizontalLines; i++) {
        const y = i * gridSize;
        ctx.beginPath();
        
        for (let x = 0; x < canvas.width; x += 5) {
          const distanceFromCenter = Math.abs(x - canvas.width / 2) / (canvas.width / 2);
          const waveHeight = Math.sin(x / 100 + wavePhase) * 2 * (1 - distanceFromCenter * 0.5);
          
          if (x === 0) {
            ctx.moveTo(x, y + waveHeight);
          } else {
            ctx.lineTo(x, y + waveHeight);
          }
        }
        
        const alpha = Math.abs(Math.sin(i / 5 + glowPhase)) * 0.2 + 0.1;
        ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${alpha * opacity})`;
        ctx.stroke();
      }
      
      // Vertical grid lines
      for (let i = 0; i <= verticalLines; i++) {
        const x = i * gridSize;
        ctx.beginPath();
        
        for (let y = 0; y < canvas.height; y += 5) {
          const distanceFromCenter = Math.abs(y - canvas.height / 2) / (canvas.height / 2);
          const waveWidth = Math.sin(y / 100 + wavePhase * 0.7) * 2 * (1 - distanceFromCenter * 0.5);
          
          if (y === 0) {
            ctx.moveTo(x + waveWidth, y);
          } else {
            ctx.lineTo(x + waveWidth, y);
          }
        }
        
        const alpha = Math.abs(Math.sin(i / 5 + glowPhase + 1)) * 0.15 + 0.05;
        ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${alpha * opacity})`;
        ctx.stroke();
      }
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        particle.alpha -= particle.decay;
        
        // Reset particles that fade out or go off screen
        if (particle.alpha <= 0 || 
            particle.x < 0 || 
            particle.x > canvas.width || 
            particle.y < 0 || 
            particle.y > canvas.height) {
          particle.x = Math.random() * canvas.width;
          particle.y = Math.random() * canvas.height;
          particle.alpha = Math.random() * 0.5 + 0.1;
        }
        
        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${baseColor.r + 40}, ${baseColor.g + 40}, ${baseColor.b + 40}, ${particle.alpha * opacity})`;
        ctx.fill();
      });
      
      // Draw intersection pulses
      for (let x = 0; x <= verticalLines; x++) {
        for (let y = 0; y <= horizontalLines; y++) {
          const pulseX = x * gridSize;
          const pulseY = y * gridSize;
          
          const time = Date.now() / 1000;
          const pulseSize = (Math.sin(time * 2 + x * 0.5 + y * 0.3) + 1) * 1.5;
          
          ctx.beginPath();
          ctx.arc(pulseX, pulseY, pulseSize, 0, Math.PI * 2);
          
          const alpha = (Math.sin(time * 2 + x * 0.5 + y * 0.3) + 1) * 0.15;
          ctx.fillStyle = `rgba(${baseColor.r + 60}, ${baseColor.g + 60}, ${baseColor.b + 60}, ${alpha * opacity})`;
          ctx.fill();
        }
      }
      
      // Continue animation
      requestAnimationFrame(animate);
    };
    
    // Start animation
    animate();
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [color, opacity]);
  
  return (
    <div className="fixed inset-0 -z-20 overflow-hidden">
      <canvas 
        ref={canvasRef} 
        className="w-full h-full"
      />
      <motion.div
        className={`absolute inset-0 bg-gradient-to-b ${
          color === 'blue' 
            ? 'from-primary-500/5 to-transparent' 
            : 'from-secondary-500/5 to-transparent'
        }`}
        animate={{ 
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{ 
          duration: 8, 
          repeat: Infinity, 
          ease: "easeInOut" 
        }}
      />
      
      {/* Radial highlight */}
      <div className="absolute top-1/4 right-1/4 w-[800px] h-[800px] rounded-full bg-gradient-radial from-white/5 to-transparent opacity-20 blur-3xl"></div>
      <div className="absolute bottom-1/4 left-1/4 w-[600px] h-[600px] rounded-full bg-gradient-radial from-white/5 to-transparent opacity-15 blur-3xl"></div>
    </div>
  );
} 