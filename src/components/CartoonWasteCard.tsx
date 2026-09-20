import React from 'react';
import { motion } from 'motion/react';
import { WasteItem } from '../types';
import { Sparkles, Info } from 'lucide-react';
import { sound } from '../utils/sound';

interface CartoonWasteCardProps {
  item: WasteItem;
  isSelected?: boolean;
  isDragging?: boolean;
  onSelect?: () => void;
  showCategoryHint?: boolean;
  compact?: boolean;
}

export const CartoonWasteCard: React.FC<CartoonWasteCardProps> = ({
  item,
  isSelected = false,
  isDragging = false,
  onSelect,
  showCategoryHint = false,
  compact = false,
}) => {
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', item.id);
    e.dataTransfer.effectAllowed = 'copyMove';
    sound.playPop();
  };

  return (
    <div
      id={`waste-item-${item.id}`}
      draggable
      onDragStart={handleDragStart}
      className="w-full select-none cursor-grab active:cursor-grabbing"
    >
      <motion.div
        onClick={() => {
          sound.playPop();
          onSelect?.();
        }}
        whileHover={{ scale: 1.05, y: -4 }}
        whileTap={{ scale: 0.95 }}
        animate={isSelected ? { scale: [1, 1.06, 1], transition: { repeat: Infinity, duration: 1 } } : {}}
        className={`relative rounded-3xl border-4 transition-all duration-200 shadow-md ${
          isSelected
            ? 'ring-4 ring-yellow-400 border-amber-500 bg-amber-50 shadow-xl'
            : 'border-white bg-white/90 hover:bg-white hover:shadow-lg'
        } ${compact ? 'p-2 sm:p-3' : 'p-3 sm:p-4'} flex flex-col items-center justify-between text-center`}
        style={{
          backgroundColor: isSelected ? '#fef3c7' : '#ffffff',
        }}
      >
      {/* Decorative Sparkle for cute cartoon look */}
      <div className="absolute top-2 left-2 text-amber-400 opacity-60">
        <Sparkles size={compact ? 12 : 16} />
      </div>

      {/* Main Cute Emoji / Cartoon visual */}
      <motion.div
        animate={{ y: [0, -3, 0] }}
        transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        className={`flex items-center justify-center rounded-2xl p-1 sm:p-2 mb-1 shadow-inner border border-slate-100 overflow-hidden ${
          compact ? 'w-14 h-14 text-3xl' : 'w-20 h-20 sm:w-24 sm:h-24 text-4xl sm:text-5xl'
        }`}
        style={{ backgroundColor: item.color }}
      >
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <span className="drop-shadow-sm transform hover:scale-110 transition-transform">
            {item.emoji}
          </span>
        )}
      </motion.div>

      {/* Item Name */}
      <div className="w-full mt-1">
        <h3
          className={`font-black text-slate-800 leading-tight truncate ${
            compact ? 'text-xs' : 'text-sm sm:text-base'
          }`}
        >
          {item.name}
        </h3>
        
        {!compact && (
          <p className="text-[11px] sm:text-xs text-slate-500 line-clamp-1 mt-0.5 px-1 font-medium">
            {item.description}
          </p>
        )}
      </div>

      {/* Optional Hint Pill */}
      {showCategoryHint && (
        <div className="mt-2 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 flex items-center gap-1">
          <Info size={11} className="text-emerald-500" />
          <span>Chạm vào thùng rác</span>
        </div>
      )}
      </motion.div>
    </div>
  );
};
