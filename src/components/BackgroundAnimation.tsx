import { motion } from 'framer-motion';

export function BackgroundAnimation() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Neon floating geometric shapes */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/30 to-orange-500/30 blur-xl"
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-40 right-32 w-24 h-24 rounded-lg bg-gradient-to-br from-cyan-400/30 to-pink-400/30 blur-lg rotate-45"
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          rotate: [45, 135, 45],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-32 left-1/3 w-40 h-40 rounded-full bg-gradient-to-br from-orange-400/25 to-yellow-400/25 blur-2xl"
        animate={{
          x: [0, -120, 0],
          y: [0, -80, 0],
          scale: [1, 0.8, 1],
        }}
        transition={{
          duration: 18,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-20 right-20 w-28 h-28 rounded-full bg-gradient-to-br from-purple-400/30 to-pink-400/30 blur-lg"
        animate={{
          x: [0, 60, 0],
          y: [0, -100, 0],
          scale: [1, 1.3, 1],
        }}
        transition={{
          duration: 22,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* DNA helix-inspired floating elements */}
      <motion.div
        className="absolute top-1/2 left-10 w-2 h-16 bg-gradient-to-b from-cyan-400/40 to-blue-400/40 rounded-full"
        animate={{
          rotate: [0, 360],
          y: [0, -20, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute top-1/3 right-16 w-2 h-20 bg-gradient-to-b from-green-400/40 to-teal-400/40 rounded-full"
        animate={{
          rotate: [0, -360],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />
    </div>
  );
}