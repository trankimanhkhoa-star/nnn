/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ModeCrafting } from './components/ModeCrafting';
import { ModeSortingGame } from './components/ModeSortingGame';
import { LeaderboardModal } from './components/LeaderboardModal';
import { CraftGalleryModal } from './components/CraftGalleryModal';
import { SoundToggle } from './components/SoundToggle';
import { INITIAL_LEADERBOARD, RECYCLED_PRODUCTS } from './data/recyclingData';
import { PlayerScore } from './types';
import { sound } from './utils/sound';
import {
  Sparkles,
  Trophy,
  Award,
  Factory,
  Zap,
  Leaf,
  Heart,
  HelpCircle,
} from 'lucide-react';
import recyclingBannerImg from './assets/images/recycling_banner_1789832850263.jpg';

export default function App() {
  // Current Game Mode: 'crafting' (Genre 1) | 'sorting' (Genre 2)
  const [activeTab, setActiveTab] = useState<'crafting' | 'sorting'>('crafting');

  // Modals
  const [isLeaderboardOpen, setIsLeaderboardOpen] = useState<boolean>(false);
  const [isGalleryOpen, setIsGalleryOpen] = useState<boolean>(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState<boolean>(false);

  // Unlocked craft products stored in localStorage
  const [unlockedCraftIds, setUnlockedCraftIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('green_kids_unlocked_crafts');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    // Default unlocked items to spark child's curiosity immediately
    return ['craft_piggy_bank', 'craft_cat_planter'];
  });

  // Leaderboard scores stored in localStorage
  const [leaderboardScores, setLeaderboardScores] = useState<PlayerScore[]>(() => {
    try {
      const saved = localStorage.getItem('green_kids_leaderboard');
      if (saved) return JSON.parse(saved);
    } catch {
      // Fallback
    }
    return INITIAL_LEADERBOARD;
  });

  // Save unlocked crafts to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('green_kids_unlocked_crafts', JSON.stringify(unlockedCraftIds));
    } catch {
      // Ignore
    }
  }, [unlockedCraftIds]);

  // Save leaderboard to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('green_kids_leaderboard', JSON.stringify(leaderboardScores));
    } catch {
      // Ignore
    }
  }, [leaderboardScores]);

  // Handle unlocking a new craft
  const handleUnlockCraft = (craftId: string) => {
    if (!unlockedCraftIds.includes(craftId)) {
      setUnlockedCraftIds((prev) => [...prev, craftId]);
    }
  };

  // Handle saving new player score
  const handleSaveScore = (newScoreData: Omit<PlayerScore, 'id' | 'timestamp'>) => {
    const newEntry: PlayerScore = {
      ...newScoreData,
      id: `score_${Date.now()}`,
      timestamp: Date.now(),
    };
    setLeaderboardScores((prev) => [newEntry, ...prev]);
  };

  // Reset leaderboard to initial samples
  const handleResetLeaderboard = () => {
    setLeaderboardScores(INITIAL_LEADERBOARD);
    try {
      localStorage.setItem('green_kids_leaderboard', JSON.stringify(INITIAL_LEADERBOARD));
    } catch {
      // Ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#edf9f1] text-slate-800 flex flex-col justify-between relative overflow-x-hidden selection:bg-emerald-200">
      {/* Cartoon Background Elements (Floating Clouds & Eco Leaves) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-12 -left-12 w-64 h-64 bg-emerald-200/40 rounded-full blur-2xl" />
        <div className="absolute top-1/3 -right-16 w-80 h-80 bg-amber-200/40 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-teal-200/30 rounded-full blur-3xl" />
        <div className="absolute top-10 right-[15%] text-2xl opacity-30 animate-pulse">☁️</div>
        <div className="absolute top-24 left-[10%] text-3xl opacity-30 animate-bounce">☁️</div>
        <div className="absolute bottom-20 right-[5%] text-2xl opacity-20">🌿</div>
        <div className="absolute bottom-10 left-[8%] text-2xl opacity-20">🌱</div>
      </div>

      {/* Main Header / Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur-md border-b-2 border-emerald-200 shadow-sm py-2.5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Brand Logo & Title */}
          <div className="flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: [0, -10, 10, 0] }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-400 to-green-500 border-2 border-white shadow-md flex items-center justify-center text-2xl shadow-emerald-200"
            >
              🌱
            </motion.div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-emerald-950 flex items-center gap-1.5 tracking-tight">
                Bé Yêu Tái Chế
                <span className="text-xs bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded-full border border-emerald-300">
                  Green Hero Kids
                </span>
              </h1>
              <p className="text-[11px] sm:text-xs text-slate-500 font-bold">
                Trò chơi môi trường thông minh & vui nhộn cho bé
              </p>
            </div>
          </div>

          {/* Game Genre Segmented Switcher (2 Thể Loại Chơi) */}
          <div className="bg-slate-100 p-1.5 rounded-2xl border-2 border-slate-200 flex items-center shadow-inner">
            <button
              id="tab-crafting-btn"
              onClick={() => {
                sound.playPop();
                setActiveTab('crafting');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'crafting'
                  ? 'bg-gradient-to-r from-emerald-500 to-green-600 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Factory size={16} />
              <span>1. Xưởng Biến Hình</span>
            </button>

            <button
              id="tab-sorting-btn"
              onClick={() => {
                sound.playPop();
                setActiveTab('sorting');
              }}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeTab === 'sorting'
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
              }`}
            >
              <Zap size={16} />
              <span>2. Thử Thách Phân Loại</span>
            </button>
          </div>

          {/* Quick Controls: Leaderboard, Gallery, Sound */}
          <div className="flex items-center gap-2">
            <button
              id="nav-leaderboard-btn"
              onClick={() => {
                sound.playPop();
                setIsLeaderboardOpen(true);
              }}
              className="p-2 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-900 font-bold text-xs flex items-center gap-1 border border-amber-300 transition-all active:scale-95 shadow-xs"
              title="Bảng Xếp Hạng"
            >
              <Trophy size={16} />
              <span className="hidden md:inline">Bảng Vàng</span>
            </button>

            <button
              id="nav-gallery-btn"
              onClick={() => {
                sound.playPop();
                setIsGalleryOpen(true);
              }}
              className="p-2 rounded-xl bg-teal-100 hover:bg-teal-200 text-teal-900 font-bold text-xs flex items-center gap-1 border border-teal-300 transition-all active:scale-95 shadow-xs"
              title="Triển Lãm Đồ Chế Tạo"
            >
              <Award size={16} />
              <span className="hidden md:inline">
                Triển Lãm ({unlockedCraftIds.length}/{RECYCLED_PRODUCTS.length})
              </span>
            </button>

            <button
              id="nav-howto-btn"
              onClick={() => {
                sound.playPop();
                setIsHowToPlayOpen(true);
              }}
              className="p-2 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold text-xs flex items-center gap-1 border border-purple-300 transition-all active:scale-95 shadow-xs"
              title="Hướng Dẫn Chơi"
            >
              <HelpCircle size={16} />
              <span className="hidden md:inline">Luật Chơi</span>
            </button>

            <SoundToggle />
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 z-10 relative space-y-6">
        {/* Cartoon Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white bg-gradient-to-r from-emerald-500 via-teal-500 to-green-600">
          <img
            src={recyclingBannerImg}
            alt="Thế Giới Tái Chế Xanh Của Bé"
            referrerPolicy="no-referrer"
            className="w-full h-36 sm:h-48 md:h-56 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent flex flex-col justify-end p-4 sm:p-6 text-white">
            <div className="inline-flex items-center gap-1.5 bg-amber-400 text-amber-950 px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider w-max mb-1 shadow-sm">
              <Sparkles size={13} />
              Chiến Dịch Hành Tinh Xanh
            </div>
            <h2 className="text-lg sm:text-2xl md:text-3xl font-black drop-shadow-md text-white">
              Cùng Các Hiệp Sĩ Nhí Tái Sinh Rác Thải!
            </h2>
            <p className="text-xs sm:text-sm text-emerald-100 font-medium max-w-xl drop-shadow-xs line-clamp-1 sm:line-clamp-2">
              Khám phá sức mạnh kỳ diệu của việc phân loại rác đúng cách và biến những vỏ chai, bìa giấy cũ thành đồ chơi lấp lánh!
            </p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {activeTab === 'crafting' ? (
            <motion.div
              key="crafting-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <ModeCrafting
                onOpenGallery={() => setIsGalleryOpen(true)}
                unlockedCraftIds={unlockedCraftIds}
                onUnlockCraft={handleUnlockCraft}
              />
            </motion.div>
          ) : (
            <motion.div
              key="sorting-tab"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.25 }}
            >
              <ModeSortingGame
                onOpenLeaderboard={() => setIsLeaderboardOpen(true)}
                onSaveScore={handleSaveScore}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-xs border-t border-emerald-200 py-4 px-4 text-center text-xs text-slate-500 font-medium z-10">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
            <Leaf size={15} className="text-emerald-600" />
            <span>Chung tay bảo vệ Môi Trường Xanh - Sạch - Đẹp mỗi ngày!</span>
          </div>
          <div className="flex items-center gap-3 text-slate-500">
            <span>2 Thể loại chơi hoạt hình cho trẻ em</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              Made with <Heart size={12} className="text-rose-500 fill-rose-500" /> for kids
            </span>
          </div>
        </div>
      </footer>

      {/* Leaderboard Modal */}
      <LeaderboardModal
        isOpen={isLeaderboardOpen}
        onClose={() => setIsLeaderboardOpen(false)}
        scores={leaderboardScores}
        onResetLeaderboard={handleResetLeaderboard}
      />

      {/* Craft Gallery Modal */}
      <CraftGalleryModal
        isOpen={isGalleryOpen}
        onClose={() => setIsGalleryOpen(false)}
        unlockedCraftIds={unlockedCraftIds}
      />

      {/* How to Play Guide Modal */}
      <AnimatePresence>
        {isHowToPlayOpen && (
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
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-emerald-400 relative overflow-hidden"
            >
              <div className="text-center mb-4">
                <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 border-2 border-purple-300 flex items-center justify-center text-3xl shadow-inner mb-2">
                  📖
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  Hướng Dẫn 2 Thể Loại Chơi
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Cùng khám phá cách chơi cực đơn giản và thú vị nhé!
                </p>
              </div>

              <div className="space-y-3.5 my-3 text-xs sm:text-sm">
                {/* Mode 1 Guide */}
                <div className="bg-emerald-50 rounded-2xl p-3.5 border-2 border-emerald-200">
                  <h4 className="font-black text-emerald-900 flex items-center gap-1.5 text-sm mb-1">
                    <Factory size={16} className="text-emerald-700" />
                    Thể loại 1: Xưởng Biến Hình Tái Chế
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    Bé hãy chọn các món rác ở kho bên dưới đưa vào <strong>Phễu nạp</strong> của chiếc máy thần kỳ. Nhấn nút <strong>"Biến Hình Tái Chế!"</strong>, bánh răng sẽ quay và cho ra những món đồ chơi, đồ dùng tuyệt đẹp kèm hướng dẫn tự làm tại nhà!
                  </p>
                </div>

                {/* Mode 2 Guide */}
                <div className="bg-amber-50 rounded-2xl p-3.5 border-2 border-amber-200">
                  <h4 className="font-black text-amber-900 flex items-center gap-1.5 text-sm mb-1">
                    <Zap size={16} className="text-amber-700" />
                    Thể loại 2: Thử Thách Phân Loại Siêu Tốc
                  </h4>
                  <p className="text-slate-600 leading-relaxed text-xs">
                    Bé có thời gian quy định cho mỗi vòng (35s, 30s, 25s). Hãy kéo hoặc chạm rác vào đúng 1 trong 4 thùng rác hoạt hình: <strong>Hữu Cơ (Xanh Lá)</strong>, <strong>Tái Chế (Vàng)</strong>, <strong>Nguy Hại (Đỏ)</strong>, <strong>Vô Cơ/Còn Lại (Xám)</strong>. Đạt điểm tối thiểu để mở khóa vòng mới và lưu tên lên <strong>Bảng Xếp Hạng</strong>!
                  </p>
                </div>
              </div>

              <button
                onClick={() => {
                  sound.playPop();
                  setIsHowToPlayOpen(false);
                }}
                className="w-full mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 rounded-2xl text-sm shadow-md transition-all active:scale-95"
              >
                Đã Hiểu, Cùng Chơi Nào!
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
