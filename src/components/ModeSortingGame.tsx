import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { BINS_CONFIG, WASTE_ITEMS, GAME_ROUNDS } from '../data/recyclingData';
import { WasteItem, WasteCategory, PlayerScore } from '../types';
import { CartoonBin } from './CartoonBin';
import { CartoonWasteCard } from './CartoonWasteCard';
import { MascotGuide } from './MascotGuide';
import { sound } from '../utils/sound';
import {
  Trophy,
  Clock,
  Sparkles,
  Zap,
  RotateCcw,
  Play,
  CheckCircle,
  XCircle,
  Star,
  ChevronRight,
  Flame,
  Award,
} from 'lucide-react';
import heroBinsImg from '../assets/images/hero_bins_quartet_1789832895863.jpg';

interface ModeSortingGameProps {
  onOpenLeaderboard: () => void;
  onSaveScore: (score: Omit<PlayerScore, 'id' | 'timestamp'>) => void;
}

export const ModeSortingGame: React.FC<ModeSortingGameProps> = ({
  onOpenLeaderboard,
  onSaveScore,
}) => {
  // Game Status
  const [gameState, setGameState] = useState<'intro' | 'playing' | 'round_end' | 'game_over'>('intro');
  const [currentRoundIdx, setCurrentRoundIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(GAME_ROUNDS[0].timeSeconds);
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [wrongCount, setWrongCount] = useState<number>(0);

  // Queue of waste items for current round
  const [queue, setQueue] = useState<WasteItem[]>([]);
  const [currentItem, setCurrentItem] = useState<WasteItem | null>(null);

  // Feedback animations
  const [floatingScore, setFloatingScore] = useState<{ id: number; text: string; isCorrect: boolean } | null>(null);
  const [selectedBinId, setSelectedBinId] = useState<WasteCategory | null>(null);

  // Mascot guide
  const [mascotMsg, setMascotMsg] = useState<string>(
    'Hãy sẵn sàng phân loại thật nhanh rác vào đúng 4 chiếc thùng hoạt hình trước khi hết giờ nhé!'
  );
  const [mascotMood, setMascotMood] = useState<'happy' | 'thinking' | 'cheering' | 'oops'>('happy');

  // Player Name & Avatar for Leaderboard Submission
  const [playerName, setPlayerName] = useState<string>('');
  const [playerAvatar, setPlayerAvatar] = useState<string>('🦖');
  const [hasSubmittedScore, setHasSubmittedScore] = useState<boolean>(false);

  const currentRound = GAME_ROUNDS[currentRoundIdx] || GAME_ROUNDS[0];
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const AVATAR_CHOICES = ['🦖', '🐱', '🐼', '🦊', '🦁', '🐬', '🚀', '🍀', '⭐', '🦄'];

  // Start or Advance Round
  const startRound = (roundIdx: number) => {
    setCurrentRoundIdx(roundIdx);
    const roundConfig = GAME_ROUNDS[roundIdx];
    setTimeLeft(roundConfig.timeSeconds);

    // Pick random items matching round difficulty
    // Round 1 has more organic and recyclable items; Round 2 & 3 add hazardous and residual
    let availablePool = WASTE_ITEMS;
    if (roundIdx === 0) {
      availablePool = WASTE_ITEMS.filter((w) => w.category === 'organic' || w.category === 'recyclable');
    }

    const shuffled = [...availablePool].sort(() => Math.random() - 0.5);
    const roundItems: WasteItem[] = [];
    while (roundItems.length < roundConfig.totalItems) {
      roundItems.push(...shuffled);
    }
    const finalQueue = roundItems.slice(0, roundConfig.totalItems);

    setQueue(finalQueue.slice(1));
    setCurrentItem(finalQueue[0]);
    setGameState('playing');
    setHasSubmittedScore(false);

    setMascotMsg(`Vòng ${roundIdx + 1} bắt đầu! Hãy phân loại ${finalQueue[0].name} vào thùng nào!`);
    setMascotMood('cheering');
    sound.playPop();
  };

  // Timer Tick
  useEffect(() => {
    if (gameState === 'playing') {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 6 && prev > 1) {
            sound.playTick();
          }
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, currentRoundIdx]);

  // When Time Runs Out
  const handleTimeUp = () => {
    sound.playWrong();
    if (score >= currentRound.minScoreToPass) {
      triggerRoundSuccess();
    } else {
      setGameState('game_over');
      setMascotMsg(`Hết giờ rồi bé ơi! Bé đạt ${score} điểm. Hãy thử lại để đạt mốc ${currentRound.minScoreToPass} điểm nhé!`);
      setMascotMood('oops');
    }
  };

  // Round cleared
  const triggerRoundSuccess = () => {
    sound.playFanfare();
    confetti({
      particleCount: 80,
      spread: 80,
      origin: { y: 0.6 },
      colors: ['#22c55e', '#facc15', '#38bdf8', '#fb7185'],
    });

    if (currentRoundIdx < GAME_ROUNDS.length - 1) {
      setGameState('round_end');
      setMascotMsg(`Hoan hô! Bé đã xuất sắc vượt qua Vòng ${currentRoundIdx + 1}! Sẵn sàng cho vòng tiếp theo chưa?`);
      setMascotMood('cheering');
    } else {
      setGameState('game_over');
      setMascotMsg(`QUÁN QUÂN MÔI TRƯỜNG! Bé đã hoàn thành xuất sắc tất cả các vòng! Hãy lưu tên vào Bảng Vàng nhé!`);
      setMascotMood('cheering');
    }
  };

  // Handle player sorting the current item into a bin
  const handleSortItem = (binCategory: WasteCategory) => {
    if (gameState !== 'playing' || !currentItem) return;

    const isCorrect = currentItem.category === binCategory;
    const nowId = Date.now();

    if (isCorrect) {
      sound.playCorrect();
      const comboBonus = combo * 15;
      const pointsEarned = 100 + comboBonus;
      setScore((prev) => prev + pointsEarned);
      setCorrectCount((prev) => prev + 1);

      const nextCombo = combo + 1;
      setCombo(nextCombo);
      if (nextCombo > maxCombo) setMaxCombo(nextCombo);

      setFloatingScore({
        id: nowId,
        text: `+${pointsEarned} ✨${nextCombo > 1 ? ` (Combo x${nextCombo})` : ''}`,
        isCorrect: true,
      });

      setMascotMsg(`Đúng rồi! ${currentItem.name} thuộc ${BINS_CONFIG[binCategory].name}. Giỏi quá!`);
      setMascotMood('cheering');
    } else {
      sound.playWrong();
      setScore((prev) => Math.max(0, prev - 40));
      setWrongCount((prev) => prev + 1);
      setCombo(0);

      setFloatingScore({
        id: nowId,
        text: `-40 ❌`,
        isCorrect: false,
      });

      setMascotMsg(`Chưa đúng rồi nè! ${currentItem.name} phải bỏ vào "${BINS_CONFIG[currentItem.category].name}" bé nhé!`);
      setMascotMood('oops');
    }

    // Advance to next waste in queue
    if (queue.length > 0) {
      setCurrentItem(queue[0]);
      setQueue((prev) => prev.slice(1));
    } else {
      // Cleared all items in this round!
      if (timerRef.current) clearInterval(timerRef.current);
      setTimeout(() => {
        triggerRoundSuccess();
      }, 500);
    }
  };

  // Handle Submitting to Leaderboard
  const handleSubmitScore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!playerName.trim()) return;

    const totalTrials = correctCount + wrongCount;
    const accuracy = totalTrials > 0 ? Math.round((correctCount / totalTrials) * 100) : 100;

    onSaveScore({
      playerName: playerName.trim(),
      avatar: playerAvatar,
      score,
      roundsCleared: currentRoundIdx + (score >= currentRound.minScoreToPass ? 1 : 0),
      accuracy,
    });

    setHasSubmittedScore(true);
    sound.playMagicSparkle();
    onOpenLeaderboard();
  };

  // Restart everything
  const handleResetGame = () => {
    sound.playPop();
    setScore(0);
    setCombo(0);
    setMaxCombo(0);
    setCorrectCount(0);
    setWrongCount(0);
    startRound(0);
  };

  // Calculate Accuracy
  const totalAnswers = correctCount + wrongCount;
  const currentAccuracy = totalAnswers > 0 ? Math.round((correctCount / totalAnswers) * 100) : 100;

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Top Header with Game Info & Leaderboard Button */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white/90 backdrop-blur-md rounded-3xl p-4 border-2 border-emerald-200 shadow-md">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-100 border-2 border-amber-300 flex items-center justify-center text-2xl shadow-inner">
            ⚡
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-emerald-950 flex items-center gap-2">
              Thử Thách Phân Loại Siêu Tốc
              <span className="text-xs bg-rose-500 text-white font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                Thể loại 2
              </span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 font-medium">
              Chạy đua với thời gian, phân loại rác chính xác theo từng vòng và ghi danh Bảng Vàng!
            </p>
          </div>
        </div>

        <button
          id="open-leaderboard-btn"
          onClick={() => {
            sound.playPop();
            onOpenLeaderboard();
          }}
          className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-500 hover:to-yellow-600 text-amber-950 font-black px-4 py-2.5 rounded-2xl shadow-md border-2 border-white transition-all active:scale-95"
        >
          <Trophy size={18} className="text-amber-800" />
          <span>Bảng Xếp Hạng</span>
        </button>
      </div>

      {/* Mascot Guidance */}
      <MascotGuide message={mascotMsg} mood={mascotMood} />

      {/* Intro Screen */}
      {gameState === 'intro' && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-xl border-4 border-emerald-300 text-center max-w-2xl mx-auto space-y-6"
        >
          {/* Superhero Bins Illustration */}
          <div className="relative w-full max-w-xs mx-auto rounded-3xl overflow-hidden shadow-lg border-4 border-white">
            <img
              src={heroBinsImg}
              alt="4 Hiệp Sĩ Thùng Rác Hoạt Hình"
              referrerPolicy="no-referrer"
              className="w-full h-44 object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end justify-center p-2">
              <span className="text-white text-xs font-black drop-shadow-md">
                Bộ Tứ Siêu Anh Hùng Thùng Rác
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
              Sẵn Sàng Thử Thách 3 Vòng Chơi!
            </h3>
            <p className="text-sm text-slate-600 max-w-md mx-auto">
              Bé có thời gian quy định để đưa các món rác đang trôi vào đúng 4 thùng rác hoạt hình. Càng phân loại chuẩn xác và tạo chuỗi combo, điểm số càng bùng nổ!
            </p>
          </div>

          {/* 3 Rounds Preview */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
            {GAME_ROUNDS.map((r, i) => (
              <div
                key={r.round}
                className="rounded-2xl p-3.5 bg-slate-50 border-2 border-slate-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-black text-emerald-800 uppercase">
                      Vòng {r.round}
                    </span>
                    <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                      {r.timeSeconds}s
                    </span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-800 leading-tight">
                    {r.title.split(': ')[1]}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    {r.description}
                  </p>
                </div>
                <div className="text-[11px] text-emerald-700 font-bold mt-2 pt-2 border-t">
                  Cần: {r.minScoreToPass} điểm
                </div>
              </div>
            ))}
          </div>

          <button
            id="start-game-btn"
            onClick={() => startRound(0)}
            className="w-full max-w-sm mx-auto py-4 px-8 rounded-2xl bg-gradient-to-r from-emerald-500 via-green-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xl shadow-xl border-4 border-white transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <Play size={24} className="fill-white" />
            <span>BẮT ĐẦU VÒNG 1</span>
          </button>
        </motion.div>
      )}

      {/* Main Game Screen (Playing) */}
      {(gameState === 'playing' || gameState === 'round_end' || gameState === 'game_over') && (
        <div className="space-y-5">
          {/* Stats Bar (Round, Timer, Score, Combo) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Round Badge */}
            <div className="bg-white/95 rounded-2xl p-3 border-2 border-emerald-200 shadow-sm flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 font-black flex items-center justify-center text-lg">
                {currentRoundIdx + 1}
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Vòng chơi</span>
                <span className="text-sm sm:text-base font-black text-slate-800 truncate">
                  Vòng {currentRoundIdx + 1}/3
                </span>
              </div>
            </div>

            {/* Countdown Timer with Animated bar */}
            <div
              className={`rounded-2xl p-3 border-2 shadow-sm flex items-center gap-3 transition-colors ${
                timeLeft <= 5
                  ? 'bg-rose-50 border-rose-400 text-rose-800 animate-pulse'
                  : 'bg-white/95 border-amber-200 text-slate-800'
              }`}
            >
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black ${
                  timeLeft <= 5 ? 'bg-rose-500 text-white' : 'bg-amber-100 text-amber-800'
                }`}
              >
                <Clock size={20} className={timeLeft <= 5 ? 'animate-spin' : ''} />
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-center text-[11px] font-bold">
                  <span className="text-slate-400 uppercase">Thời gian</span>
                  <span className={timeLeft <= 5 ? 'text-rose-600 font-black' : 'text-amber-700'}>
                    {timeLeft}s
                  </span>
                </div>
                {/* Visual Timer Bar */}
                <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden mt-1">
                  <div
                    className={`h-full transition-all duration-1000 rounded-full ${
                      timeLeft <= 5 ? 'bg-rose-500' : 'bg-amber-400'
                    }`}
                    style={{
                      width: `${(timeLeft / currentRound.timeSeconds) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Score */}
            <div className="bg-white/95 rounded-2xl p-3 border-2 border-emerald-200 shadow-sm flex items-center gap-3 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-yellow-100 text-yellow-700 flex items-center justify-center font-black">
                ⭐
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Điểm số</span>
                <span className="text-lg sm:text-xl font-black text-amber-600">
                  {score}
                </span>
              </div>

              {/* Floating score indicator */}
              <AnimatePresence>
                {floatingScore && (
                  <motion.div
                    key={floatingScore.id}
                    initial={{ opacity: 1, y: 0, scale: 0.8 }}
                    animate={{ opacity: 0, y: -25, scale: 1.2 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.8 }}
                    className={`absolute right-3 top-2 font-black text-sm ${
                      floatingScore.isCorrect ? 'text-emerald-600' : 'text-rose-600'
                    }`}
                  >
                    {floatingScore.text}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Combo Streak */}
            <div className="bg-white/95 rounded-2xl p-3 border-2 border-emerald-200 shadow-sm flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black ${
                  combo > 1 ? 'bg-orange-100 text-orange-600 animate-bounce' : 'bg-slate-100 text-slate-400'
                }`}
              >
                <Flame size={20} className={combo > 1 ? 'fill-orange-500' : ''} />
              </div>
              <div>
                <span className="text-[11px] font-bold text-slate-400 uppercase block">Chuỗi Combo</span>
                <span
                  className={`text-sm sm:text-base font-black ${
                    combo > 1 ? 'text-orange-600' : 'text-slate-700'
                  }`}
                >
                  {combo > 1 ? `x${combo} Siêu Xanh!` : `${combo}`}
                </span>
              </div>
            </div>
          </div>

          {/* Active Trash Conveyor Belt Stage */}
          {gameState === 'playing' && currentItem && (
            <div className="bg-gradient-to-r from-emerald-100 via-teal-50 to-amber-100 rounded-3xl p-5 sm:p-6 border-3 border-emerald-300 shadow-lg flex flex-col items-center relative overflow-hidden">
              <div className="text-center mb-2">
                <span className="text-xs font-black text-emerald-800 uppercase tracking-wider bg-white/80 px-3 py-1 rounded-full border border-emerald-200">
                  RÁC CẦN PHÂN LOẠI NGAY (Còn {queue.length + 1} món):
                </span>
              </div>

              {/* Main Card */}
              <div className="w-full max-w-sm my-2">
                <CartoonWasteCard
                  item={currentItem}
                  isSelected={true}
                  showCategoryHint={true}
                />
              </div>

              {/* Next upcoming items preview */}
              {queue.length > 0 && (
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-emerald-200/60 w-full justify-center">
                  <span className="text-[11px] font-bold text-slate-500">Kế tiếp:</span>
                  <div className="flex items-center gap-2">
                    {queue.slice(0, 3).map((item, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-1 bg-white/80 rounded-xl px-2 py-1 text-xs font-bold text-slate-700 border border-slate-200 shadow-xs"
                      >
                        <span className="text-base">{item.emoji}</span>
                        <span className="truncate max-w-[80px]">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* The 4 Cartoon Bins (Click or Drop Targets) */}
          <div className="space-y-2">
            <div className="text-center">
              <span className="text-xs font-black text-slate-600 uppercase tracking-wide">
                👇 CHẠM HOẶC KÉO RÁC VÀO 1 TRONG 4 THÙNG RÁC HOẠT HÌNH DƯỚI ĐÂY:
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
              {(Object.keys(BINS_CONFIG) as WasteCategory[]).map((catKey) => {
                const bin = BINS_CONFIG[catKey];
                return (
                  <CartoonBin
                    key={catKey}
                    bin={bin}
                    isTarget={selectedBinId === catKey}
                    onClick={() => handleSortItem(catKey)}
                    onDropItem={() => handleSortItem(catKey)}
                    disabled={gameState !== 'playing'}
                  />
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Round Complete Modal */}
      {gameState === 'round_end' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border-4 border-emerald-400 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-emerald-100 flex items-center justify-center text-4xl shadow-inner border-2 border-emerald-300">
              🎉
            </div>

            <h3 className="text-2xl font-black text-slate-900">
              VƯỢT QUA VÒNG {currentRoundIdx + 1}!
            </h3>

            <p className="text-sm text-slate-600 font-medium">
              Bé đã xuất sắc hoàn thành thử thách với điểm số ấn tượng!
            </p>

            <div className="grid grid-cols-2 gap-3 bg-emerald-50 rounded-2xl p-4 border border-emerald-200 text-left">
              <div>
                <span className="text-xs text-slate-500 font-bold block">Điểm tích lũy</span>
                <span className="text-xl font-black text-amber-600">{score} điểm</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block">Độ chính xác</span>
                <span className="text-xl font-black text-emerald-700">{currentAccuracy}%</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block">Số câu đúng</span>
                <span className="text-sm font-black text-slate-800">{correctCount} món rác</span>
              </div>
              <div>
                <span className="text-xs text-slate-500 font-bold block">Chuỗi Combo max</span>
                <span className="text-sm font-black text-orange-600">x{maxCombo} liên tiếp</span>
              </div>
            </div>

            <button
              id="next-round-btn"
              onClick={() => startRound(currentRoundIdx + 1)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white font-black text-base shadow-lg border-2 border-white transition-all active:scale-95 flex items-center justify-center gap-2"
            >
              <span>TIẾP TỤC VÒNG {currentRoundIdx + 2}</span>
              <ChevronRight size={20} />
            </button>
          </div>
        </motion.div>
      )}

      {/* Game Over / Victory Modal & Leaderboard Submission */}
      {gameState === 'game_over' && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-amber-400 text-center space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-100 flex items-center justify-center text-4xl shadow-inner border-2 border-amber-300">
              {score >= currentRound.minScoreToPass ? '👑' : '💪'}
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                {score >= currentRound.minScoreToPass
                  ? 'CHIẾN BINH MÔI TRƯỜNG!'
                  : 'HẾT GIỜ RỒI BÉ ƠI!'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
                {score >= currentRound.minScoreToPass
                  ? 'Bé đã hoàn thành xuất sắc các vòng thử thách!'
                  : 'Cố lên bé nhé, lần sau sẽ nhanh tay hơn nữa!'}
              </p>
            </div>

            {/* Score Highlights */}
            <div className="grid grid-cols-3 gap-2 bg-amber-50 rounded-2xl p-3.5 border border-amber-200">
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">Tổng Điểm</span>
                <span className="text-xl font-black text-amber-600">{score}</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">Vòng Vượt Qua</span>
                <span className="text-xl font-black text-emerald-700">
                  {currentRoundIdx + (score >= currentRound.minScoreToPass ? 1 : 0)}/3
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-bold block">Chính Xác</span>
                <span className="text-xl font-black text-blue-600">{currentAccuracy}%</span>
              </div>
            </div>

            {/* Form: Name & Avatar Submission */}
            {!hasSubmittedScore ? (
              <form onSubmit={handleSubmitScore} className="space-y-3 text-left pt-2">
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wide">
                  1. Chọn Avatar Hoạt Hình Của Bé:
                </label>
                <div className="flex flex-wrap gap-2 justify-center py-1">
                  {AVATAR_CHOICES.map((av) => (
                    <button
                      key={av}
                      type="button"
                      onClick={() => {
                        sound.playPop();
                        setPlayerAvatar(av);
                      }}
                      className={`w-10 h-10 rounded-2xl text-xl flex items-center justify-center border-2 transition-all ${
                        playerAvatar === av
                          ? 'border-amber-500 bg-amber-100 scale-110 shadow-md ring-2 ring-amber-400'
                          : 'border-slate-200 bg-slate-50 hover:bg-slate-100'
                      }`}
                    >
                      {av}
                    </button>
                  ))}
                </div>

                <label className="block text-xs font-black text-slate-700 uppercase tracking-wide mt-2">
                  2. Nhập Tên Bé:
                </label>
                <div className="flex gap-2">
                  <input
                    id="player-name-input"
                    type="text"
                    required
                    maxLength={25}
                    value={playerName}
                    onChange={(e) => setPlayerName(e.target.value)}
                    placeholder="Ví dụ: Bé Bắp, Minh Khôi..."
                    className="flex-1 px-4 py-2.5 rounded-2xl border-2 border-slate-300 focus:border-amber-400 focus:outline-none text-sm font-bold text-slate-800"
                  />
                  <button
                    type="submit"
                    className="bg-amber-400 hover:bg-amber-500 text-amber-950 font-black px-5 py-2.5 rounded-2xl text-sm shadow-md transition-all active:scale-95 border-2 border-white flex items-center gap-1"
                  >
                    <Trophy size={16} />
                    Lưu Bảng Vàng
                  </button>
                </div>
              </form>
            ) : (
              <div className="bg-emerald-50 text-emerald-800 rounded-2xl p-3 border border-emerald-300 font-bold text-sm flex items-center justify-center gap-2">
                <CheckCircle size={18} className="text-emerald-600" />
                Đã ghi danh vào Bảng Xếp Hạng!
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleResetGame}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black py-3 px-4 rounded-2xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <RotateCcw size={16} />
                Chơi Lại Từ Đầu
              </button>
              <button
                onClick={() => {
                  sound.playPop();
                  onOpenLeaderboard();
                }}
                className="flex-1 bg-amber-400 hover:bg-amber-500 text-amber-950 font-black py-3 px-4 rounded-2xl text-sm transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
              >
                <Award size={16} />
                Xem Bảng Xếp Hạng
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};
