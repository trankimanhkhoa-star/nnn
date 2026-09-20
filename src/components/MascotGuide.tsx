import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

interface MascotGuideProps {
  message: string;
  mood?: 'happy' | 'thinking' | 'cheering' | 'oops';
  onDismiss?: () => void;
}

export const MascotGuide: React.FC<MascotGuideProps> = ({
  message,
  mood = 'happy',
}) => {
  const getMascotExpression = () => {
    switch (mood) {
      case 'cheering':
        return { eyes: '😄', mouth: 'o', leafSpin: true, bg: 'bg-amber-100 border-amber-300' };
      case 'thinking':
        return { eyes: '🤔', mouth: '-', leafSpin: false, bg: 'bg-sky-100 border-sky-300' };
      case 'oops':
        return { eyes: '🥺', mouth: 'o', leafSpin: false, bg: 'bg-rose-100 border-rose-300' };
      case 'happy':
      default:
        return { eyes: '😊', mouth: 'w', leafSpin: false, bg: 'bg-emerald-100 border-emerald-300' };
    }
  };

  const exp = getMascotExpression();

  return (
    <div className="flex items-center gap-3 bg-white/95 backdrop-blur-sm px-4 py-2.5 rounded-3xl shadow-lg border-2 border-emerald-200 max-w-xl">
      {/* Cartoon Sprout Mascot */}
      <motion.div
        animate={{ y: [0, -4, 0], rotate: [-2, 2, -2] }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="relative flex-shrink-0"
      >
        {/* Cute Head */}
        <div className="w-12 h-12 rounded-full bg-gradient-to-b from-emerald-300 to-green-400 border-2 border-emerald-500 shadow-md flex flex-col items-center justify-center relative overflow-hidden">
          {/* Sprout Leaf on top */}
          <motion.div
            animate={exp.leafSpin ? { rotate: [0, 360] } : { rotate: [-10, 10, -10] }}
            transition={exp.leafSpin ? { repeat: Infinity, duration: 1 } : { repeat: Infinity, duration: 2 }}
            className="absolute -top-3 text-lg"
          >
            🌱
          </motion.div>

          {/* Eyes & smile */}
          <div className="text-xl leading-none select-none">
            {exp.eyes}
          </div>

          {/* Pink Cheeks */}
          <div className="flex justify-between w-8 px-0.5 mt-0.5">
            <div className="w-2 h-1 bg-rose-400/80 rounded-full" />
            <div className="w-2 h-1 bg-rose-400/80 rounded-full" />
          </div>
        </div>

        {/* Small Sparkle */}
        <div className="absolute -bottom-1 -right-1 text-yellow-400">
          <Sparkles size={14} className="animate-pulse" />
        </div>
      </motion.div>

      {/* Speech text */}
      <div className="flex-1">
        <div className="flex items-center gap-1.5 mb-0.5">
          <span className="font-extrabold text-xs text-emerald-800 tracking-wide uppercase">
            Bé Mầm Xanh Nhắc Nhở:
          </span>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={message}
            initial={{ opacity: 0, y: 3 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -3 }}
            className="text-xs sm:text-sm font-semibold text-slate-700 leading-snug"
          >
            {message}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
};
