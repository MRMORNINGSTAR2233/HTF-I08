import { FC, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface AuraProps {}

const text = "Starting Aura ...";
// Split text into individual letters while preserving spaces
const letters = text.split("").map((char, index) => {
  return char === " " ? { char: "\u00A0", isSpace: true } : { char, isSpace: false };
});

// Animation variants
const container = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: { 
      duration: 0.5
    }
  }
};

const letter = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeInOut"
    }
  }
};

const Aura: FC<AuraProps> = () => {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [isPulsing, setIsPulsing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [hasSpoken, setHasSpoken] = useState(false);
  const [showGreeting, setShowGreeting] = useState(false);
  const [readyToNavigate, setReadyToNavigate] = useState(false);
  const [textAnimationComplete, setTextAnimationComplete] = useState(false);
  const [audioContextInitialized, setAudioContextInitialized] = useState(false);
  const [speakingAttempted, setSpeakingAttempted] = useState(false);
  const GREETING_TEXT = "Hello, I'm Aura! How can I help you?";
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const sphereRef = useRef<HTMLDivElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Navigate only when explicitly ready
  useEffect(() => {
    if (readyToNavigate) {
      console.log("*** READY TO NAVIGATE - GOING TO CHAT/CONFIG ***");
      const timer = setTimeout(() => {
        navigate('/chat/config');
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [readyToNavigate, navigate]);

  // Initialize audio context - important for enabling audio on some browsers
  const initAudio = () => {
    try {
      // If already initialized, return it
      if (audioContextRef.current) {
        return audioContextRef.current;
      }

      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContext) {
        const audioCtx = new AudioContext();
        audioContextRef.current = audioCtx;
        
        console.log("Audio context state:", audioCtx.state);
        
        // Create and immediately play a short sound to unblock audio
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.01; // Very low volume but not silent
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.start();
        oscillator.stop(audioCtx.currentTime + 0.1);
        
        console.log("Audio context initialized, new state:", audioCtx.state);
        setAudioContextInitialized(true);
        return audioCtx;
      }
    } catch (e) {
      console.error("Could not initialize audio context", e);
    }
    return null;
  };

  // Super simple speech function - the most direct approach possible
  const simpleSpeakGreeting = () => {
    console.log("ATTEMPTING SIMPLE SPEAK");
    setSpeakingAttempted(true);

    try {
      // Cancel any ongoing speech first
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }

      // Create a new, simple utterance
      const utterance = new SpeechSynthesisUtterance(GREETING_TEXT);
      utterance.volume = 1.0;
      utterance.rate = 0.9;
      utterance.pitch = 1.0;

      // Set voice if available
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Just use the first available voice rather than complex selection
        utterance.voice = voices[0];
      }

      // Show the text anyway
      setShowGreeting(true);
      
      // Log the speech attempt
      console.log("Attempting to speak with utterance:", utterance);
            
      // Handle end events to navigate
      utterance.onend = () => {
        console.log("Speech ended, navigating");
        setReadyToNavigate(true);
      };

      // Directly speak
      window.speechSynthesis.speak(utterance);
      
      // Fallback for navigation if onend doesn't fire
      setTimeout(() => {
        if (!readyToNavigate) {
          console.log("Navigation fallback triggered");
          setReadyToNavigate(true);
        }
      }, 5000);
    } catch (error) {
      console.error("Simple speech error:", error);
      // Navigate anyway if speech fails
      setTimeout(() => {
        setReadyToNavigate(true);
      }, 3000);
    }
  };

  // Auto-speak after delay
  useEffect(() => {
    // Initialize audio early
    initAudio();
    
    // Wait for animation to complete
    if (textAnimationComplete && !hasSpoken) {
      console.log("Text animation completed, setting up auto-speak timer");
      
      // Set a timer to auto-speak after animation completes
      const speakTimer = setTimeout(() => {
        console.log("Auto-speak timer triggered");
        simpleSpeakGreeting();
        setHasSpoken(true);
      }, 1500); // 1.5 second delay after animation completes
      
      return () => clearTimeout(speakTimer);
    }
  }, [textAnimationComplete, hasSpoken]);

  useEffect(() => {
    // Try to initialize audio early to help with permissions
    initAudio();
    
    // Auto-activate after 2 seconds
    const timer = setTimeout(() => {
      setIsActive(true);
    }, 2000);

    // Start pulsing periodically
    const pulseInterval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 300);
    }, 3000);

    // Create animation loop for text
    const animationLoop = setInterval(() => {
      // Keep the text visible, don't toggle it off
      if (!isVisible) {
        setIsVisible(true);
      }
    }, 5000);
    
    // Mark text animation as complete after a delay
    const textAnimationTimer = setTimeout(() => {
      console.log("Animation time complete, setting text animation complete");
      setTextAnimationComplete(true);
    }, 3000);

    return () => {
      clearTimeout(timer);
      clearInterval(pulseInterval);
      clearInterval(animationLoop);
      clearTimeout(textAnimationTimer);
      
      // Cancel any ongoing speech
      if (window.speechSynthesis && window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Generate wave circles
  const renderCircularWaves = () => {
    const waves = [];
    for (let i = 0; i < 6; i++) {
      waves.push(
        <div
          key={`wave-${i}`}
          className="absolute circular-wave"
          style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            border: `1px solid rgba(91, 225, 255, ${0.3 - i * 0.05})`,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            opacity: 0,
            animationDelay: `${i * 0.8}s`,
            zIndex: 0,
          }}
        />
      );
    }
    return waves;
  };

  // Text animation variants and data
  const container = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
    exit: {
      opacity: 0,
      transition: {
        duration: 0.5,
      },
    },
  };

  const child = {
    hidden: {
      opacity: 0,
      y: -20,
      x: -30,
      scale: 0.9,
      filter: "blur(5px)",
    },
    visible: {
      opacity: 1,
      y: 0,
      x: 0,
      scale: 1,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 200,
        duration: 0.8,
      },
    },
    exit: {
      opacity: 0,
      y: 20,
      filter: "blur(5px)",
      transition: {
        duration: 0.3,
      },
    },
  };

  const text = "Aura is Starting";
  const words = text.split(" ");

  // Spinner animation
  const spinnerVariants = {
    hidden: { opacity: 0, scale: 0 },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        delay: words.length * 0.15 + 0.3,
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      scale: 0,
      transition: {
        duration: 0.2,
      },
    },
  };
  
  // Greeting text animation
  const greetingContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
  };

  const greetingLetter = {
    hidden: { opacity: 0, y: 10 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
  };

  // Split greeting text into individual letters for animation
  const greetingLetters = GREETING_TEXT.split("").map((char, index) => {
    return char === " " ? { char: "\u00A0", isSpace: true } : { char, isSpace: false };
  });

  return (
    <div className="w-full h-full flex justify-center items-center">
      <div
        ref={containerRef}
        className="relative w-full flex justify-center items-center mx-auto"
        style={{
          filter: `brightness(${isPulsing ? 1.4 : isActive ? 1.2 : 1})`,
          transition: "filter 0.3s ease",
          maxWidth: "min(100vw, 900px)",
          height: "100vh",
          margin: "0 auto",
        }}
      >
        <div className="absolute inset-0 flex justify-center items-center">
          {/* Continuous circular waves */}
          {renderCircularWaves()}

          {/* Pulse ripples */}
          <div
            className={`absolute ripple1 ${isPulsing ? "active-ripple" : ""}`}
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(91, 225, 255, 0.3)",
              opacity: 0,
              zIndex: 1,
            }}
          ></div>

          <div
            className={`absolute ripple2 ${isPulsing ? "active-ripple" : ""}`}
            style={{
              width: "230px",
              height: "230px",
              borderRadius: "50%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              border: "1px solid rgba(91, 225, 255, 0.2)",
              opacity: 0,
              animationDelay: "0.15s",
              zIndex: 1,
            }}
          ></div>

          {/* Glow effect */}
          <div
            className="absolute glow-effect"
            style={{
              width: "300px",
              height: "300px",
              borderRadius: "50%",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background:
                "radial-gradient(circle, rgba(130, 47, 255, 0.2) 0%, rgba(91, 225, 255, 0.05) 40%, transparent 70%)",
              filter: "blur(15px)",
              animation: "glow-pulse 4s ease-in-out infinite",
              zIndex: 2,
            }}
          ></div>

          {/* Outer waves */}
          <div
            className="absolute z-0 wave-circle1"
            style={{
              width: "220px",
              height: "220px",
              borderRadius: "50%",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%)`,
              background: "rgb(91, 225, 255)",
              opacity: 0.15,
              mixBlendMode: "screen",
              zIndex: 2,
            }}
          ></div>

          <div
            className="absolute z-0 wave-circle2"
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%)`,
              background: "rgb(81, 0, 255)",
              opacity: 0.2,
              filter: "blur(1px)",
              zIndex: 2,
            }}
          ></div>

          <div
            className="absolute z-0 wave-circle3"
            style={{
              width: "240px",
              height: "240px",
              borderRadius: "50%",
              top: "50%",
              left: "50%",
              transform: `translate(-50%, -50%)`,
              background: "rgb(55, 0, 255)",
              opacity: 0.15,
              filter: "blur(5px)",
              zIndex: 2,
            }}
          ></div>

          {/* Main sphere */}
          <div
            ref={sphereRef}
            className="absolute w-[120px] h-[120px] rounded-full overflow-hidden"
            style={{
              boxShadow: isActive
                ? "0 0 20px rgba(130, 47, 255, 0.8), 0 0 40px rgba(91, 225, 255, 0.4)"
                : "0 0 15px rgba(130, 47, 255, 0.6)",
              border: "1px solid rgba(128, 0, 255, 0.54)",
              position: "absolute",
              background: "rgba(102, 0, 255, 0.64)",
              backdropFilter: "blur(1px)",
              transition:
                "transform 0.2s ease-out, box-shadow 0.5s ease, filter 0.3s ease",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 10,
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
          >
            {/* External rotating gradient background */}
            <div
              className="absolute inset-0 z-0"
              style={{
                background:
                  "linear-gradient(135deg, rgba(111, 88, 255, 0.7), rgba(91, 33, 255, 0.6), rgba(0, 185, 255, 0.7), rgba(128, 0, 255, 0.6))",
                backgroundSize: "400% 400%",
                animation: "gradientShift 5s ease infinite",
                opacity: 0.8,
                mixBlendMode: "screen",
              }}
            />

            {/* Glass inner sphere */}
            <div
              className="absolute inset-0 z-10 m-[6px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 30%, rgb(187, 78, 255), transparent 70%)",
                boxShadow: "inset 0 0 10px rgba(139, 92, 246, 0.2)",
                backdropFilter: "blur(5px)",
                borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                borderLeft: "1px solid rgba(255, 255, 255, 0.15)",
                animation: isHovering ? "pulse 1s ease-in-out infinite" : "",
              }}
            />

            {/* Inner rotating gradient */}
            <div
              className="absolute inset-0 z-5 m-[12px] rounded-full overflow-hidden"
              style={{
                opacity: 0.8,
                animation: "spin 5s linear infinite",
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "conic-gradient(from 0deg, rgba(130, 47, 255, 0.7), rgba(91, 225, 255, 0.6), rgba(81, 0, 255, 0.7), rgba(187, 78, 255, 0.6))",
                  animation: "spin-reverse 4s linear infinite",
                }}
              />
            </div>

            {/* Audio wave blobs */}
            <div
              className="absolute w-[35px] h-[35px] blob1"
              style={{
                background: "rgba(114, 79, 255, 0.4)",
                borderRadius: "50%",
                left: "35%",
                top: "20%",
                transform: "translate(-50%, -50%)",
                filter: "blur(1px)",
              }}
            />

            <div
              className="absolute w-[40px] h-[40px] blob2"
              style={{
                background: "rgba(91, 225, 255, 0.5)",
                borderRadius: "50%",
                left: "60%",
                top: "70%",
                transform: "translate(-50%, -50%)",
                filter: "blur(1px)",
              }}
            />

            <div
              className="absolute w-[30px] h-[30px] blob3"
              style={{
                background: "rgba(81, 0, 255, 0.4)",
                borderRadius: "50%",
                left: "75%",
                top: "30%",
                transform: "translate(-50%, -50%)",
                filter: "blur(1px)",
              }}
            />

            {/* Sound wave rings */}
            <div
              className={`absolute top-[50%] left-[50%] sound-wave1 ${
                isPulsing ? "sound-wave-boost" : ""
              }`}
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: "rgba(187, 78, 255, 0.8)",
                transform: "translate(-50%, -50%)",
              }}
            ></div>

            <div
              className={`absolute top-[50%] left-[50%] sound-wave2 ${
                isPulsing ? "sound-wave-boost" : ""
              }`}
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: "rgba(91, 225, 255, 0.8)",
                transform: "translate(-50%, -50%)",
              }}
            ></div>

            <div
              className={`absolute top-[35%] left-[30%] sound-wave3 ${
                isPulsing ? "sound-wave-boost" : ""
              }`}
              style={{
                width: "2px",
                height: "2px",
                borderRadius: "50%",
                background: "rgba(114, 79, 255, 0.7)",
                transform: "translate(-50%, -50%)",
              }}
            ></div>

            <div
              className={`absolute top-[65%] left-[70%] sound-wave4 ${
                isPulsing ? "sound-wave-boost" : ""
              }`}
              style={{
                width: "3px",
                height: "3px",
                borderRadius: "50%",
                background: "rgba(81, 0, 255, 0.7)",
                transform: "translate(-50%, -50%)",
              }}
            ></div>

            {/* Glass effect overlay */}
            <div
              className="absolute inset-0 z-30 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 20%, rgba(255, 255, 255, 0.15), transparent 60%)",
                boxShadow: "inset 0 0 10px rgba(139, 92, 246, 0.2)",
                backdropFilter: "blur(1px)",
                borderTop: "1px solid rgba(255, 255, 255, 0.2)",
                borderLeft: "1px solid rgba(255, 255, 255, 0.1)",
                mixBlendMode: "overlay",
              }}
            />

            {/* Additional glass highlight */}
            <div
              className="absolute top-[10%] left-[60%] w-[40px] h-[20px] rounded-full"
              style={{
                background:
                  "radial-gradient(circle, rgba(255, 255, 255, 0.2), transparent 70%)",
                transform: "rotate(-30deg)",
                mixBlendMode: "overlay",
              }}
            />

            {/* Sparkle effects */}
            <div
              className="absolute w-[3px] h-[3px] rounded-full sparkle1"
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                top: "30%",
                left: "20%",
                boxShadow: "0 0 3px 1px rgba(255, 255, 255, 0.6)",
              }}
            ></div>

            <div
              className="absolute w-[2px] h-[2px] rounded-full sparkle2"
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                top: "70%",
                left: "80%",
                boxShadow: "0 0 3px 1px rgba(255, 255, 255, 0.6)",
              }}
            ></div>

            <div
              className="absolute w-[2px] h-[2px] rounded-full sparkle3"
              style={{
                background: "rgba(255, 255, 255, 0.9)",
                top: "20%",
                left: "70%",
                boxShadow: "0 0 3px 1px rgba(255, 255, 255, 0.6)",
              }}
            ></div>
          </div>

          {/* Additional outer wave effects */}
          <div
            className="absolute wave-outer1"
            style={{
              width: "160px",
              height: "160px",
              borderRadius: "50%",
              border: "1px solid rgba(91, 225, 255, 0.3)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 3,
            }}
          ></div>

          <div
            className="absolute wave-outer2"
            style={{
              width: "180px",
              height: "180px",
              borderRadius: "50%",
              border: "1px solid rgba(130, 47, 255, 0.2)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 3,
            }}
          ></div>

          <div
            className="absolute wave-outer3"
            style={{
              width: "200px",
              height: "200px",
              borderRadius: "50%",
              border: "1px solid rgba(81, 0, 255, 0.15)",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 3,
            }}
          ></div>

          {/* Enhanced text animation with spinner */}
          <div
            className="absolute w-full"
            style={{
              top: "calc(50% + 150px)",
              left: "50%",
              transform: "translateX(-50%)",
              zIndex: 5,
              fontWeight: "bold",
              fontSize: "26px",
              textAlign: "center",
            }}
          >
            <AnimatePresence mode="wait">
              {isVisible && (
                <div className="flex justify-center items-center">
                  <motion.div
                    key="text-container"
                    className="flex justify-center items-center text-xl"
                    initial="hidden"
                    animate="visible"
                    exit="exit"
                    variants={container}
                    onAnimationComplete={() => {
                      // This will fire when the animation completes
                      if (!textAnimationComplete) {
                        console.log("Text animation completed - from animation event");
                        setTextAnimationComplete(true);
                      }
                    }}
                  >
                    {letters.map((item, index) => (
                      <motion.span
                        key={index}
                        style={{
                          color: "gray",
                          textShadow: "0 0 8px rgba(183, 199, 202, 0.5)",
                          display: "inline-block",
                          marginRight: item.isSpace ? "0" : "0.03em",
                        }}
                        variants={letter}
                      >
                        {item.char}
                      </motion.span>
                    ))}
                  </motion.div>

                  <Loader2
                    className="ml-2 animate-spin text-purple-500"
                    size={24}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Greeting text animation - only shown when speech starts */}
          {showGreeting && (
            <div
              className="absolute w-full"
              style={{
                top: "calc(50% + 200px)",
                left: "50%",
                transform: "translateX(-50%)",
                zIndex: 5,
                fontWeight: "bold",
                fontSize: "22px",
                textAlign: "center",
                color: "rgba(255, 255, 255, 0.9)",
                textShadow: "0 0 10px rgba(139, 92, 246, 0.7)",
              }}
            >
              <motion.div
                className="flex justify-center items-center flex-wrap"
                initial="hidden"
                animate="visible"
                variants={greetingContainer}
              >
                {greetingLetters.map((item, index) => (
                  <motion.span
                    key={index}
                    style={{
                      display: "inline-block",
                      marginRight: item.isSpace ? "0.2em" : "0.01em", // Reduced margins for better spacing
                    }}
                    variants={greetingLetter}
                  >
                    {item.char}
                  </motion.span>
                ))}
              </motion.div>
            </div>
          )}
        </div>

        {/* Add global styles */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
          @keyframes gradientShift {
            0% { background-position: 0% 50% }
            50% { background-position: 100% 50% }
            100% { background-position: 0% 50% }
          }
          
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          
          @keyframes spin-reverse {
            from { transform: rotate(0deg); }
            to { transform: rotate(-360deg); }
          }
          
          @keyframes pulse {
            0% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.03); opacity: 1; }
            100% { transform: scale(1); opacity: 0.8; }
          }
          
          @keyframes glow-pulse {
            0% { opacity: 0.1; }
            50% { opacity: 0.2; }
            100% { opacity: 0.1; }
          }
          
          /* Continuous wave animation */
          .circular-wave {
            animation: circular-wave-expand 4s infinite cubic-bezier(0, 0.5, 0.5, 1);
          }
          
          @keyframes circular-wave-expand {
            0% {
              width: 120px;
              height: 120px;
              opacity: 0.5;
              border-width: 2px;
            }
            100% {
              width: 400px;
              height: 400px;
              opacity: 0;
              border-width: 1px;
            }
          }
          
          /* Ripple effect */
          .active-ripple {
            animation: ripple 0.8s ease-out forwards;
          }
          
          @keyframes ripple {
            0% { transform: translate(-50%, -50%) scale(0.5); opacity: 0.5; }
            100% { transform: translate(-50%, -50%) scale(1.8); opacity: 0; }
          }
          
          /* Sound wave boost */
          .sound-wave-boost {
            animation-duration: 1s !important;
            animation-timing-function: cubic-bezier(0.1, 0.8, 0.3, 1) !important;
          }
          
          /* Wave circles outside the sphere */
          .wave-circle1 {
            animation: wave-pulse 4s infinite ease-in-out;
          }
          
          .wave-circle2 {
            animation: wave-pulse 4s infinite ease-in-out 1s;
          }
          
          .wave-circle3 {
            animation: wave-pulse 4s infinite ease-in-out 2s;
          }
          
          @keyframes wave-pulse {
            0% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.15; }
            50% { transform: translate(-50%, -50%) scale(1.1); opacity: 0.2; }
            100% { transform: translate(-50%, -50%) scale(0.9); opacity: 0.15; }
          }
          
          /* Outer ring animations */
          .wave-outer1 {
            animation: wave-expand 3s infinite ease-out;
          }
          
          .wave-outer2 {
            animation: wave-expand 3s infinite ease-out 1s;
          }
          
          .wave-outer3 {
            animation: wave-expand 3s infinite ease-out 2s;
          }
          
          @keyframes wave-expand {
            0% { 
              transform: translate(-50%, -50%) scale(1);
              opacity: 0.3;
              border-width: 1px;
            }
            100% { 
              transform: translate(-50%, -50%) scale(2.5);
              opacity: 0;
              border-width: 0.5px;
            }
          }
          
          /* Sparkle animations */
          .sparkle1 {
            animation: sparkle 2s infinite ease-in-out;
          }
          
          .sparkle2 {
            animation: sparkle 2s infinite ease-in-out 0.6s;
          }
          
          .sparkle3 {
            animation: sparkle 2s infinite ease-in-out 1.2s;
          }
          
          @keyframes sparkle {
            0% { opacity: 0; }
            50% { opacity: 1; transform: scale(1.5); }
            100% { opacity: 0; }
          }
          
          /* Sound wave animations */
          .sound-wave1 {
            animation: sound-wave 2.5s infinite ease-out;
          }
          
          .sound-wave2 {
            animation: sound-wave 2.5s infinite ease-out 0.5s;
          }
          
          .sound-wave3 {
            animation: sound-wave 3s infinite ease-out 0.7s;
          }
          
          .sound-wave4 {
            animation: sound-wave 2s infinite ease-out 1s;
          }
          
          @keyframes sound-wave {
            0% {
              width: 3px;
              height: 3px;
              opacity: 0.7;
              filter: blur(0px);
            }
            100% {
              width: 60px;
              height: 60px;
              opacity: 0;
              filter: blur(5px);
            }
          }
        `,
          }}
        />
      </div>
      {/* Add extra styles for detecting and adjusting to sidebar */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          /* Calculate and set sidebar width as CSS variable */
          :root {
            --sidebar-width: 0px;
          }
          
          @media (min-width: 768px) {
            .flex.h-screen > :first-child:not(.relative) {
              --element-width: attr(clientWidth);
            }
            
            :root {
              --sidebar-width: calc((100vw - 100%) / 2);
            }
          }
        `
        }}
      />
    </div>
  );
};

export default Aura;
