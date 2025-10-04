import { motion, useScroll, useTransform } from 'motion/react';
import { useRef } from 'react';

export function BackgroundAnimation() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref });
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const opacity = useTransform(scrollYProgress, [0, 0.5, 1], [1, 0.8, 0.6]);

  return (
    <div ref={ref} className="absolute inset-0 overflow-hidden">
      {/* Animated gradient waves */}
      <motion.div
        className="absolute inset-0"
        style={{ y: y1, opacity }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-cyan-500/10 animate-gradient-xy"></div>
      </motion.div>
      
      {/* Flowing gradient lines */}
      <motion.div
        className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-transparent via-pink-500/30 to-transparent"
        animate={{
          x: ['-100%', '100%'],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      
      <motion.div
        className="absolute bottom-20 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent"
        animate={{
          x: ['100%', '-100%'],
        }}
        transition={{
          duration: 12,
          repeat: Infinity,
          ease: "linear",
        }}
      />

      {/* Neon floating geometric shapes with enhanced animations */}
      <motion.div
        className="absolute top-20 left-20 w-32 h-32 rounded-full bg-gradient-to-br from-pink-500/30 to-orange-500/30 blur-xl"
        style={{ y: y2 }}
        animate={{
          x: [0, 100, 0],
          y: [0, -50, 0],
          scale: [1, 1.2, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute top-40 right-32 w-24 h-24 rounded-lg bg-gradient-to-br from-cyan-400/30 to-pink-400/30 blur-lg rotate-45"
        style={{ y: y1 }}
        animate={{
          x: [0, -80, 0],
          y: [0, 60, 0],
          rotate: [45, 135, 45],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      <motion.div
        className="absolute bottom-32 left-1/3 w-40 h-40 rounded-full bg-gradient-to-br from-orange-400/25 to-yellow-400/25 blur-2xl"
        style={{ y: y2 }}
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
        style={{ y: y1 }}
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

      {/* Additional gradient orbs */}
      <motion.div
        className="absolute top-1/4 left-1/2 w-16 h-16 rounded-full bg-gradient-to-br from-emerald-400/25 to-teal-400/25 blur-lg"
        animate={{
          x: [0, -40, 40, 0],
          y: [0, 40, -40, 0],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 16,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      <motion.div
        className="absolute top-3/4 right-1/4 w-20 h-20 rounded-full bg-gradient-to-br from-violet-400/20 to-indigo-400/20 blur-xl"
        animate={{
          x: [0, 80, -40, 0],
          y: [0, -60, 40, 0],
          scale: [1, 0.7, 1.4, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      
      {/* DNA helix-inspired floating elements with parallax */}
      <motion.div
        className="absolute top-1/2 left-10 w-2 h-16 bg-gradient-to-b from-cyan-400/40 to-blue-400/40 rounded-full"
        style={{ y: y1 }}
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
        style={{ y: y2 }}
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

      {/* Particle-like dots */}
      {Array.from({ length: 20 }).map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1, 0],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}

      {/* Gradient mesh overlay */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-tr from-purple-500/5 via-transparent to-cyan-500/5"
        animate={{
          background: [
            'linear-gradient(45deg, rgba(168, 85, 247, 0.05) 0%, transparent 50%, rgba(6, 182, 212, 0.05) 100%)',
            'linear-gradient(135deg, rgba(6, 182, 212, 0.05) 0%, transparent 50%, rgba(168, 85, 247, 0.05) 100%)',
            'linear-gradient(225deg, rgba(168, 85, 247, 0.05) 0%, transparent 50%, rgba(6, 182, 212, 0.05) 100%)',
            'linear-gradient(315deg, rgba(6, 182, 212, 0.05) 0%, transparent 50%, rgba(168, 85, 247, 0.05) 100%)',
            'linear-gradient(45deg, rgba(168, 85, 247, 0.05) 0%, transparent 50%, rgba(6, 182, 212, 0.05) 100%)',
          ],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}