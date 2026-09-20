import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { RECYCLED_PRODUCTS } from '../data/recyclingData';
import { RecycledProduct } from '../types';
import { X, Lock, CheckCircle, Sparkles, Heart } from 'lucide-react';
import { sound } from '../utils/sound';

interface CraftGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  unlockedCraftIds: string[];
}

export const CraftGalleryModal: React.FC<CraftGalleryModalProps> = ({
  isOpen,
  onClose,
  unlockedCraftIds,
}) => {
  const [inspectedCraft, setInspectedCraft] = useState<RecycledProduct | null>(null);

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.85, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.85, y: 20 }}
        className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border-4 border-amber-400 relative overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            sound.playPop();
            onClose();
          }}
          className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center font-bold transition-all"
        >
          <X size={20} />
        </button>

        {/* Header */}
        <div className="text-center mb-4">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-3xl shadow-inner mb-2">
            🎨
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            Phòng Triển Lãm Đồ Tái Chế Của Bé
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Bé đã mở khóa thành công {unlockedCraftIds.length}/{RECYCLED_PRODUCTS.length} sản phẩm sáng tạo từ rác thải!
          </p>

          {/* Progress Bar */}
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden mt-3 max-w-md mx-auto border border-slate-200">
            <div
              className="h-full bg-gradient-to-r from-amber-400 to-emerald-500 rounded-full transition-all duration-500"
              style={{
                width: `${(unlockedCraftIds.length / RECYCLED_PRODUCTS.length) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Grid of Crafts */}
        <div className="flex-1 overflow-y-auto grid grid-cols-2 sm:grid-cols-3 gap-3 pr-1 my-2">
          {RECYCLED_PRODUCTS.map((craft) => {
            const isUnlocked = unlockedCraftIds.includes(craft.id);

            return (
              <div
                key={craft.id}
                onClick={() => {
                  sound.playPop();
                  if (isUnlocked) {
                    setInspectedCraft(craft);
                  }
                }}
                className={`rounded-2xl p-3.5 border-2 flex flex-col items-center text-center transition-all ${
                  isUnlocked
                    ? 'cursor-pointer border-amber-300 bg-amber-50/50 hover:bg-amber-100/70 hover:scale-103 shadow-sm'
                    : 'border-dashed border-slate-300 bg-slate-50 opacity-70'
                }`}
              >
                {/* Emoji / Icon */}
                <div
                  className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-2 shadow-inner border relative overflow-hidden ${
                    isUnlocked ? 'border-white' : 'border-slate-200 bg-slate-200 text-slate-400'
                  }`}
                  style={{ backgroundColor: isUnlocked ? craft.color : '#e2e8f0' }}
                >
                  {isUnlocked ? (
                    craft.imageUrl ? (
                      <img
                        src={craft.imageUrl}
                        alt={craft.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="drop-shadow-sm">{craft.emoji}</span>
                    )
                  ) : (
                    <Lock size={22} className="text-slate-400" />
                  )}

                  {isUnlocked && (
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-xs">
                      <CheckCircle size={13} />
                    </span>
                  )}
                </div>

                <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 line-clamp-1 leading-tight">
                  {isUnlocked ? craft.name : 'Chưa Khám Phá'}
                </h4>

                <span className="text-[10px] text-slate-500 font-semibold mt-1">
                  {isUnlocked ? (
                    <span className="text-amber-700 font-bold bg-amber-100 px-2 py-0.5 rounded-full">
                      {craft.category}
                    </span>
                  ) : (
                    'Cần chế tạo trong Xưởng'
                  )}
                </span>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-6 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            Đóng Triển Lãm
          </button>
        </div>

        {/* Detail Popup for a specific craft */}
        <AnimatePresence>
          {inspectedCraft && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 bg-white/95 backdrop-blur-md p-6 flex flex-col justify-between overflow-y-auto"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <span className="text-xs font-black uppercase text-amber-600 bg-amber-100 px-3 py-1 rounded-full">
                    {inspectedCraft.category}
                  </span>
                  <button
                    onClick={() => {
                      sound.playPop();
                      setInspectedCraft(null);
                    }}
                    className="text-slate-400 hover:text-slate-600 font-black text-sm"
                  >
                    Quay lại
                  </button>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-md border-2 border-white flex-shrink-0 overflow-hidden"
                    style={{ backgroundColor: inspectedCraft.color }}
                  >
                    {inspectedCraft.imageUrl ? (
                      <img
                        src={inspectedCraft.imageUrl}
                        alt={inspectedCraft.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      inspectedCraft.emoji
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900">
                      {inspectedCraft.name}
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mt-1">
                      {inspectedCraft.description}
                    </p>
                  </div>
                </div>

                {/* Eco Impact */}
                <div className="bg-emerald-50 rounded-2xl p-3 border border-emerald-200">
                  <div className="text-xs font-bold text-emerald-800 uppercase flex items-center gap-1.5 mb-1">
                    <Heart size={14} className="text-rose-500 fill-rose-500" />
                    Lợi ích môi trường:
                  </div>
                  <p className="text-xs text-emerald-900 font-semibold">
                    {inspectedCraft.ecoBenefit}
                  </p>
                </div>

                {/* Steps */}
                <div className="bg-slate-50 rounded-2xl p-3 border border-slate-200">
                  <div className="text-xs font-bold text-slate-700 uppercase flex items-center gap-1.5 mb-2">
                    <Sparkles size={14} className="text-amber-500" />
                    Cách bé tự làm tại nhà:
                  </div>
                  <div className="space-y-1.5 text-xs text-slate-600">
                    {inspectedCraft.craftingSteps.map((step, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                          {idx + 1}
                        </span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playPop();
                  setInspectedCraft(null);
                }}
                className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                Đóng Xem Chi Tiết
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};
