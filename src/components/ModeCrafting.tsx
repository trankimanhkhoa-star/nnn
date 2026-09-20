import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { WASTE_ITEMS, RECYCLED_PRODUCTS } from '../data/recyclingData';
import { WasteItem, RecycledProduct } from '../types';
import { sound } from '../utils/sound';
import { MascotGuide } from './MascotGuide';
import { Sparkles, ArrowRight, BookOpen, CheckCircle, RefreshCw, Award, Heart, HelpCircle, Flame, Wrench, ImageIcon } from 'lucide-react';
import wasteMachineImg from '../assets/images/waste_machine_img_1789832865602.jpg';
import craftToysImg from '../assets/images/craft_toys_showcase_1789832878645.jpg';

interface ModeCraftingProps {
  onOpenGallery: () => void;
  unlockedCraftIds: string[];
  onUnlockCraft: (craftId: string) => void;
}

export const ModeCrafting: React.FC<ModeCraftingProps> = ({
  onOpenGallery,
  unlockedCraftIds,
  onUnlockCraft,
}) => {
  // Items currently loaded into the recycling hopper
  const [hopperItems, setHopperItems] = useState<WasteItem[]>([]);
  // Current active recipe filter or selected recipe
  const [selectedRecipe, setSelectedRecipe] = useState<RecycledProduct | null>(null);
  // Machine animation state
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  // Newly crafted product reveal
  const [revealedProduct, setRevealedProduct] = useState<RecycledProduct | null>(null);
  // Mascot message
  const [mascotMsg, setMascotMsg] = useState<string>(
    'Chào mừng bé đến Xưởng Tái Chế Thần Kỳ! Hãy chọn rác thải đưa vào máy để biến thành đồ chơi đáng yêu nhé!'
  );
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'cheering' | 'oops'>('happy');

  // Filter available craftable wastes (plastics, cardboard, cans, organic foods, etc.)
  const craftableWastes = WASTE_ITEMS.filter((item) => item.craftableInto && item.craftableInto.length > 0);

  // Add item into machine hopper
  const handleAddToHopper = (item: WasteItem) => {
    if (hopperItems.length >= 3) {
      setMascotMsg('Cửa nạp đã đầy 3 món rác rồi bé ơi! Hãy nhấn nút "Biến Hình" hoặc bấm vào rác trong máy để bỏ ra nhé!');
      setMascotMood('thinking');
      sound.playWrong();
      return;
    }
    sound.playPop();
    const newHopper = [...hopperItems, item];
    setHopperItems(newHopper);
    setMascotMsg(`Đã nạp ${item.name} vào máy! Bé hãy thêm rác hoặc nhấn nút Biến Hình nào!`);
    setMascotMood('happy');
  };

  // Remove item from hopper
  const handleRemoveFromHopper = (index: number) => {
    sound.playPop();
    const updated = hopperItems.filter((_, i) => i !== index);
    setHopperItems(updated);
  };

  // Clear hopper
  const handleClearHopper = () => {
    sound.playPop();
    setHopperItems([]);
    setMascotMsg('Đã làm sạch phễu nạp! Hãy chọn những món rác mới nhé!');
  };

  // Apply a recipe from the recipe book
  const handleSelectRecipe = (recipe: RecycledProduct) => {
    sound.playPop();
    setSelectedRecipe(recipe);
    // Auto populate hopper with the recipe's required items for an intuitive experience
    const neededItems: WasteItem[] = [];
    recipe.requiredWastes.forEach((req) => {
      const match = WASTE_ITEMS.find((w) => w.id === req.wasteId);
      if (match) {
        for (let i = 0; i < req.count; i++) {
          neededItems.push(match);
        }
      }
    });
    setHopperItems(neededItems);
    setMascotMsg(`Công thức ${recipe.name}: Cần ${recipe.requiredWastes.map((r) => `${r.count} ${r.name}`).join(', ')}. Nhấn nút Biến Hình thôi!`);
    setMascotMood('cheering');
  };

  // The Magic Transform Process!
  const handleCraft = () => {
    if (hopperItems.length === 0) {
      setMascotMsg('Phễu nạp đang trống trơn nè! Hãy nhấp chọn các món rác ở bảng bên dưới trước nhé!');
      setMascotMood('thinking');
      sound.playWrong();
      return;
    }

    setIsProcessing(true);
    sound.playMachineWork();
    setMascotMsg('Bánh răng đang quay tít... Rác thải đang được nung nấu và biến hóa thần kỳ...!');
    setMascotMood('cheering');

    setTimeout(() => {
      // Find matching recipe
      const hopperIds = hopperItems.map((item) => item.id).sort();

      let matchedProduct = RECYCLED_PRODUCTS.find((p) => {
        const requiredIds = p.requiredWastes.flatMap((rw) => Array(rw.count).fill(rw.wasteId)).sort();
        return (
          requiredIds.length === hopperIds.length &&
          requiredIds.every((val, index) => val === hopperIds[index])
        );
      });

      // If no exact match, check if any item in hopper has a possible craft
      if (!matchedProduct) {
        const firstCraftable = hopperItems.find((item) => item.craftableInto && item.craftableInto.length > 0);
        if (firstCraftable && firstCraftable.craftableInto) {
          const fallbackCraftId = firstCraftable.craftableInto[0];
          matchedProduct = RECYCLED_PRODUCTS.find((p) => p.id === fallbackCraftId);
        }
      }

      // If still nothing, pick a fun default
      if (!matchedProduct) {
        matchedProduct = RECYCLED_PRODUCTS[0];
      }

      setIsProcessing(false);
      setRevealedProduct(matchedProduct);
      onUnlockCraft(matchedProduct.id);
      sound.playMagicSparkle();

      // Launch cheerful confetti
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#22c55e', '#eab308', '#ec4899', '#3b82f6', '#a855f7'],
      });

      setMascotMsg(`Tuyệt vời! Máy đã chế tạo thành công: ${matchedProduct.name}! Hãy xem công dụng của nó nào!`);
      setMascotMood('cheering');
    }, 1800);
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Top Banner & Stats */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 backdrop-blur-md rounded-3xl p-4 border-2 border-emerald-200 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-inner">
            🏭
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-950 flex items-center gap-2">
              Xưởng Biến Hình Tái Chế
              <span className="text-xs bg-amber-400 text-amber-950 font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Thể loại 1
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Biến rác thải tưởng chừng bỏ đi thành những món đồ chơi & đồ dùng diệu kỳ!
            </p>
          </div>
        </div>

        {/* Gallery Button & Unlocked Count */}
        <button
          id="open-gallery-btn"
          onClick={() => {
            sound.playPop();
            onOpenGallery();
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black px-4 py-2.5 rounded-2xl shadow-md border-2 border-white transition-all active:scale-95"
        >
          <Award size={18} className="text-amber-800" />
          <span>Triển Lãm Đồ Tái Chế</span>
          <span className="bg-white/80 text-amber-900 text-xs px-2 py-0.5 rounded-full font-extrabold">
            {unlockedCraftIds.length}/{RECYCLED_PRODUCTS.length}
          </span>
        </button>
      </div>

      {/* Mascot Guidance */}
      <MascotGuide message={mascotMsg} mood={mascotMood} />

      {/* Main Interactive Stage: The Cartoon Recycling Machine */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left/Center: The Magic Recycling Machine (7 cols) */}
        <div className="lg:col-span-7 bg-gradient-to-b from-teal-500 via-emerald-600 to-green-700 rounded-3xl p-5 sm:p-7 shadow-2xl border-4 border-emerald-400 text-white relative overflow-hidden">
          {/* Machine Header Plates & Light Indicators */}
          <div className="flex items-center justify-between border-b-2 border-white/20 pb-4 mb-5">
            <div className="flex items-center gap-2">
              <span className="w-4 h-4 rounded-full bg-red-400 animate-ping" />
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-300" />
              <span className="w-3.5 h-3.5 rounded-full bg-yellow-300" />
              <span className="text-xs font-black tracking-widest uppercase text-emerald-100 ml-2">
                MÁY TÁI CHẾ VŨ TRỤ 3000
              </span>
            </div>

            {/* Clear Button */}
            {hopperItems.length > 0 && (
              <button
                onClick={handleClearHopper}
                disabled={isProcessing}
                className="text-xs bg-white/20 hover:bg-white/30 text-white px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-colors"
              >
                <RefreshCw size={12} />
                Làm rỗng phễu
              </button>
            )}
          </div>

          {/* Hopper / Input Conveyor */}
          <div className="bg-emerald-900/50 backdrop-blur-xs rounded-2xl p-4 border-2 border-emerald-300/40 mb-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-200 uppercase tracking-wide flex items-center gap-1.5">
                <Flame size={14} className="text-amber-400" />
                Phễu nạp rác thải (Tối đa 3 món):
              </span>
              <span className="text-xs text-white/70 font-semibold">
                Đã nạp: {hopperItems.length}/3
              </span>
            </div>

            {/* Slots in Hopper */}
            <div className="grid grid-cols-3 gap-3 min-h-[100px]">
              {[0, 1, 2].map((slotIdx) => {
                const item = hopperItems[slotIdx];
                return (
                  <div
                    key={slotIdx}
                    onClick={() => item && !isProcessing && handleRemoveFromHopper(slotIdx)}
                    className={`rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-2 transition-all ${
                      item
                        ? 'bg-white text-slate-800 border-amber-400 shadow-md cursor-pointer hover:bg-rose-50 hover:border-rose-400 group'
                        : 'border-white/30 bg-black/10'
                    }`}
                  >
                    {item ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="flex flex-col items-center text-center"
                      >
                        <span className="text-3xl drop-shadow-sm group-hover:scale-110 transition-transform">
                          {item.emoji}
                        </span>
                        <span className="text-[11px] font-extrabold truncate w-full mt-1 text-slate-700 group-hover:text-rose-600">
                          {item.name}
                        </span>
                        <span className="text-[9px] text-rose-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                          Bấm để gỡ
                        </span>
                      </motion.div>
                    ) : (
                      <div className="text-center text-white/40 text-xs font-semibold">
                        <span className="text-lg block opacity-50">+</span>
                        <span>Trống</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Machine Core Body with Animated Gears & Hatch Door */}
          <motion.div
            animate={
              isProcessing
                ? {
                    x: [-3, 3, -3, 3, 0],
                    scale: [1, 1.02, 0.99, 1.01, 1],
                  }
                : {}
            }
            transition={isProcessing ? { repeat: Infinity, duration: 0.2 } : {}}
            className="bg-emerald-800/80 rounded-3xl p-6 border-2 border-emerald-300 shadow-inner flex flex-col items-center relative overflow-hidden"
          >
            {/* Cartoon Machine Face / Window */}
            <div className="w-full max-w-xs h-36 bg-slate-900 rounded-2xl border-4 border-emerald-300/80 shadow-2xl relative flex items-center justify-center overflow-hidden mb-4 group">
              {/* Background Machine Illustration */}
              <img
                src={wasteMachineImg}
                alt="Recycling Machine Illustration"
                referrerPolicy="no-referrer"
                className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
                  isProcessing ? 'opacity-40 filter saturate-150' : 'opacity-30 group-hover:opacity-40'
                }`}
              />

              {/* Status inside window */}
              {isProcessing ? (
                <div className="flex flex-col items-center justify-center text-center z-10 bg-black/60 p-3 rounded-2xl backdrop-blur-xs">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
                    className="text-4xl mb-1"
                  >
                    ⚙️
                  </motion.div>
                  <span className="text-xs font-black text-amber-300 tracking-wider animate-pulse">
                    ĐANG BIẾN HÌNH TÁI CHẾ...
                  </span>
                  <div className="flex gap-1 mt-1 text-sm">
                    <span>✨</span>
                    <span>💨</span>
                    <span>⚡</span>
                  </div>
                </div>
              ) : revealedProduct ? (
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex flex-col items-center justify-center text-center z-10 cursor-pointer bg-black/60 p-3 rounded-2xl backdrop-blur-xs"
                  onClick={() => setRevealedProduct(null)}
                >
                  <span className="text-5xl drop-shadow-md animate-bounce">
                    {revealedProduct.emoji}
                  </span>
                  <span className="text-xs font-extrabold text-white mt-1">
                    {revealedProduct.name}
                  </span>
                </motion.div>
              ) : (
                <div className="flex flex-col items-center text-emerald-200 text-center z-10 px-4 bg-black/50 p-2.5 rounded-2xl backdrop-blur-xs">
                  <Wrench size={24} className="mb-1 text-emerald-300" />
                  <span className="text-xs font-bold text-white drop-shadow-sm">
                    {hopperItems.length === 0
                      ? 'Nạp rác vào phễu để bắt đầu'
                      : 'Sẵn sàng! Hãy kéo cần gạt biến hình!'}
                  </span>
                </div>
              )}
            </div>

            {/* Giant 3D Transformation Button */}
            <motion.button
              id="craft-action-btn"
              onClick={handleCraft}
              disabled={isProcessing}
              whileHover={{ scale: isProcessing ? 1 : 1.05 }}
              whileTap={{ scale: isProcessing ? 1 : 0.95 }}
              className={`w-full max-w-sm py-4 px-6 rounded-2xl font-black text-lg sm:text-xl shadow-xl border-4 transition-all flex items-center justify-center gap-3 ${
                isProcessing
                  ? 'bg-slate-500 border-slate-400 text-slate-200 cursor-not-allowed'
                  : hopperItems.length === 0
                  ? 'bg-emerald-400 border-emerald-300 text-emerald-950 hover:bg-emerald-300'
                  : 'bg-gradient-to-r from-amber-400 via-yellow-400 to-orange-400 border-white text-amber-950 animate-pulse shadow-yellow-500/50'
              }`}
            >
              <Sparkles size={24} className={isProcessing ? 'animate-spin' : ''} />
              <span>{isProcessing ? 'ĐANG BIẾN HÌNH...' : 'BIẾN HÌNH TÁI CHẾ!'}</span>
            </motion.button>
          </motion.div>
        </div>

        {/* Right: Recipe Book / Guide (5 cols) */}
        <div className="lg:col-span-5 bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-xl border-2 border-emerald-200 flex flex-col space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h3 className="font-black text-slate-800 flex items-center gap-2 text-base sm:text-lg">
              <BookOpen size={20} className="text-emerald-600" />
              Sách Công Thức Thần Kỳ
            </h3>
            <span className="text-xs text-slate-500 font-bold">Bấm để tự nạp rác</span>
          </div>

          <p className="text-xs text-slate-600">
            Khám phá xem các bạn rác thải có thể hóa thân thành món quà gì nhé:
          </p>

          {/* Photo Showcase Card */}
          <div className="relative rounded-2xl overflow-hidden border-2 border-emerald-200 shadow-sm group">
            <img
              src={craftToysImg}
              alt="Mô hình đồ chơi tái chế"
              referrerPolicy="no-referrer"
              className="w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-2.5">
              <span className="text-white text-[11px] font-bold flex items-center gap-1.5 drop-shadow-sm">
                <Sparkles size={13} className="text-yellow-400" />
                Đồ chơi tái sinh từ đôi bàn tay khéo léo!
              </span>
            </div>
          </div>

          {/* List of Discoverable Recipes */}
          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {RECYCLED_PRODUCTS.map((product) => {
              const isUnlocked = unlockedCraftIds.includes(product.id);
              const isCurrent = selectedRecipe?.id === product.id;

              return (
                <div
                  key={product.id}
                  onClick={() => !isProcessing && handleSelectRecipe(product)}
                  className={`cursor-pointer rounded-2xl p-3 border-2 transition-all flex items-center justify-between gap-3 ${
                    isCurrent
                      ? 'border-amber-400 bg-amber-50 shadow-md ring-2 ring-amber-300'
                      : 'border-slate-200 bg-slate-50 hover:bg-white hover:border-emerald-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-inner border border-slate-200 flex-shrink-0"
                      style={{ backgroundColor: product.color }}
                    >
                      {product.emoji}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-black text-sm text-slate-800">
                          {product.name}
                        </h4>
                        {isUnlocked && (
                          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded-full flex items-center gap-0.5">
                            <CheckCircle size={10} className="text-emerald-600" />
                            Đã tạo
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        <span>Cần:</span>
                        {product.requiredWastes.map((rw, i) => (
                          <span
                            key={i}
                            className="inline-flex items-center gap-0.5 bg-white px-1.5 py-0.5 rounded-md border border-slate-200 text-slate-700 font-bold text-[11px]"
                          >
                            <span>{rw.emoji}</span>
                            <span>{rw.count} {rw.name}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <ArrowRight size={16} className="text-slate-400 flex-shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Section: Waste Items Picker */}
      <div className="bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-xl border-2 border-emerald-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <span>🧺</span>
              Kho Rác Thải Chờ Tái Chế
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Chạm vào món rác bé muốn nạp vào máy biến hình thần kỳ!
            </p>
          </div>
          <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full w-fit">
            Mẹo: Rác sạch tái chế đồ dùng, rác hữu cơ ủ phân bón!
          </span>
        </div>

        {/* Grid of Waste Items */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-7 gap-3">
          {craftableWastes.map((item) => (
            <motion.div
              key={item.id}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => !isProcessing && handleAddToHopper(item)}
              className="cursor-pointer bg-slate-50 hover:bg-amber-50 rounded-2xl p-2.5 border-2 border-slate-200 hover:border-amber-400 shadow-sm flex flex-col items-center text-center transition-all group"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mb-1.5 shadow-inner border border-white"
                style={{ backgroundColor: item.color }}
              >
                <span className="group-hover:scale-110 transition-transform">
                  {item.emoji}
                </span>
              </div>
              <span className="text-xs font-extrabold text-slate-800 truncate w-full">
                {item.name}
              </span>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full mt-1">
                + Nạp vào máy
              </span>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Modal: Successfully Crafted Item Reveal */}
      <AnimatePresence>
        {revealedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.7, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.7, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-amber-400 relative overflow-hidden"
            >
              {/* Header Badge */}
              <div className="text-center mb-3">
                <span className="inline-block bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-xs uppercase px-4 py-1 rounded-full shadow-sm tracking-wider">
                  🎉 BIẾN HÌNH THÀNH CÔNG!
                </span>
              </div>

              {/* Large Product Preview */}
              <div className="flex flex-col items-center text-center mb-4">
                <motion.div
                  animate={{ scale: [1, 1.1, 1], rotate: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className="w-28 h-28 rounded-3xl flex items-center justify-center text-6xl shadow-lg border-4 border-white mb-2"
                  style={{ backgroundColor: revealedProduct.color }}
                >
                  {revealedProduct.emoji}
                </motion.div>
                <h3 className="text-2xl font-black text-slate-900">
                  {revealedProduct.name}
                </h3>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-3 py-0.5 rounded-full mt-1">
                  Thể loại: {revealedProduct.category}
                </span>
                <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 px-2">
                  {revealedProduct.description}
                </p>
              </div>

              {/* Eco Benefit Box */}
              <div className="bg-emerald-50 rounded-2xl p-3.5 border border-emerald-200 mb-4">
                <div className="flex items-center gap-2 text-emerald-800 font-extrabold text-xs uppercase mb-1">
                  <Heart size={14} className="text-rose-500 fill-rose-500" />
                  Ý nghĩa bảo vệ Trái Đất:
                </div>
                <p className="text-xs text-emerald-900 font-semibold leading-relaxed">
                  {revealedProduct.ecoBenefit}
                </p>
              </div>

              {/* 4-Step DIY at Home Guide */}
              <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 mb-5">
                <div className="font-extrabold text-xs text-slate-700 uppercase mb-2 flex items-center gap-1.5">
                  <Sparkles size={14} className="text-amber-500" />
                  Bé có thể tự làm tại nhà cùng bố mẹ:
                </div>
                <div className="space-y-1.5 text-xs text-slate-600">
                  {revealedProduct.craftingSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="w-4 h-4 rounded-full bg-amber-400 text-amber-950 font-black flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    sound.playPop();
                    setRevealedProduct(null);
                    onOpenGallery();
                  }}
                  className="flex-1 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black py-3 px-4 rounded-2xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Award size={16} />
                  Xem Phòng Triển Lãm
                </button>
                <button
                  onClick={() => {
                    sound.playPop();
                    setRevealedProduct(null);
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-2xl text-sm transition-all shadow-md active:scale-95"
                >
                  Chế Tạo Tiếp
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
