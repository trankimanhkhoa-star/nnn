import React from 'react';
import { motion } from 'motion/react';
import { BinInfo } from '../types';
import { Apple, Recycle, AlertTriangle, Trash2, Sparkles } from 'lucide-react';

interface CartoonBinProps {
  bin: BinInfo;
  isTarget?: boolean;
  isHovered?: boolean;
  onClick?: () => void;
  onDropItem?: (binId: string) => void;
  itemCount?: number;
  disabled?: boolean;
}

export const CartoonBin: React.FC<CartoonBinProps> = ({
  bin,
  isTarget = false,
  isHovered = false,
  onClick,
  onDropItem,
  itemCount = 0,
  disabled = false,
}) => {
  const getIcon = () => {
    switch (bin.id) {
      case 'organic':
        return <Apple className="w-5 h-5 text-white" />;
      case 'recyclable':
        return <Recycle className="w-5 h-5 text-white" />;
      case 'hazardous':
        return <AlertTriangle className="w-5 h-5 text-white" />;
      case 'residual':
      default:
        return <Trash2 className="w-5 h-5 text-white" />;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    const wasteId = e.dataTransfer.getData('text/plain');
    if (onDropItem) {
      onDropItem(bin.id);
    }
  };

  return (
    <motion.div
      id={`bin-${bin.id}`}
      whileHover={disabled ? {} : { scale: 1.04, y: -4 }}
      whileTap={disabled ? {} : { scale: 0.97 }}
      animate={isTarget ? { scale: [1, 1.07, 1], transition: { repeat: Infinity, duration: 1.2 } } : {}}
      onClick={disabled ? undefined : onClick}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`relative cursor-pointer select-none rounded-3xl p-3 sm:p-4 flex flex-col items-center justify-between transition-all duration-200 shadow-lg border-4 ${
        bin.borderColor
      } ${
        isHovered || isTarget
          ? 'ring-4 ring-offset-2 ring-yellow-400 shadow-2xl brightness-105'
          : 'hover:shadow-xl'
      } bg-gradient-to-b ${bin.bgGrad} text-white min-h-[160px] sm:min-h-[190px]`}
    >
      {/* Cartoon Bin Lid with handle and eyes */}
      <div className="w-full flex flex-col items-center">
        {/* Lid handle */}
        <div className="w-10 h-2.5 bg-white/40 rounded-t-lg border-t-2 border-white/60 mb-0.5" />
        
        {/* Lid plate */}
        <div className="w-full h-3.5 bg-white/30 rounded-full shadow-inner mb-2 flex items-center justify-center">
          <div className="w-12 h-1 bg-white/50 rounded-full" />
        </div>

        {/* Cartoon Face: Big cute eyes and smiley mouth */}
        <div className="flex items-center gap-3 my-1">
          {/* Left Eye */}
          <div className="w-4 h-5 sm:w-5 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-sm relative overflow-hidden">
            <div className="w-2.5 h-3.5 bg-slate-900 rounded-full flex items-start justify-end p-0.5">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
            {/* Cheek blush */}
            <div className="absolute -bottom-1 -left-1 w-3 h-1.5 bg-pink-400/60 rounded-full" />
          </div>

          {/* Icon Badge */}
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/30 backdrop-blur-xs flex items-center justify-center border border-white/40 shadow-inner">
            {getIcon()}
          </div>

          {/* Right Eye */}
          <div className="w-4 h-5 sm:w-5 sm:h-6 bg-white rounded-full flex items-center justify-center shadow-sm relative overflow-hidden">
            <div className="w-2.5 h-3.5 bg-slate-900 rounded-full flex items-start justify-start p-0.5">
              <div className="w-1 h-1 bg-white rounded-full" />
            </div>
            {/* Cheek blush */}
            <div className="absolute -bottom-1 -right-1 w-3 h-1.5 bg-pink-400/60 rounded-full" />
          </div>
        </div>

        {/* Happy Cartoon Mouth */}
        <div className="w-5 h-2.5 bg-slate-900/40 rounded-b-full border-b border-white/40 mb-1" />
      </div>

      {/* Bin Ribs decoration */}
      <div className="flex gap-2 my-1 opacity-40">
        <div className="w-1 h-8 sm:h-12 bg-white rounded-full" />
        <div className="w-1 h-8 sm:h-12 bg-white rounded-full" />
        <div className="w-1 h-8 sm:h-12 bg-white rounded-full" />
      </div>

      {/* Label and Badge */}
      <div className="w-full text-center bg-black/20 backdrop-blur-xs rounded-2xl py-1.5 px-2 border border-white/20">
        <div className="font-extrabold text-sm sm:text-base tracking-wide drop-shadow-sm leading-tight">
          {bin.name}
        </div>
        <div className="text-[11px] sm:text-xs text-white/90 font-semibold truncate mt-0.5">
          {bin.shortName}
        </div>
      </div>

      {/* Item Counter if count > 0 */}
      {itemCount > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2.5 -right-2.5 bg-amber-400 text-amber-950 font-black text-xs sm:text-sm px-2.5 py-1 rounded-full border-2 border-white shadow-md flex items-center gap-1"
        >
          <Sparkles size={12} className="text-amber-700 animate-spin" />
          +{itemCount}
        </motion.div>
      )}
    </motion.div>
  );
};
