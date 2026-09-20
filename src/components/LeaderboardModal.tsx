import React from 'react';
import { motion } from 'motion/react';
import { PlayerScore } from '../types';
import { Trophy, Medal, X, RotateCcw, Award } from 'lucide-react';
import { sound } from '../utils/sound';

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  scores: PlayerScore[];
  onResetLeaderboard: () => void;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  scores,
  onResetLeaderboard,
}) => {
  if (!isOpen) return null;

  // Sort scores descending
  const sortedScores = [...scores].sort((a, b) => b.score - a.score);

  const getRankBadge = (index: number) => {
    switch (index) {
      case 0:
        return (
          <div className="w-9 h-9 rounded-2xl bg-amber-400 text-amber-950 font-black flex items-center justify-center text-lg shadow-md border-2 border-amber-200">
            🥇
          </div>
        );
      case 1:
        return (
          <div className="w-9 h-9 rounded-2xl bg-slate-300 text-slate-800 font-black flex items-center justify-center text-lg shadow-md border-2 border-slate-100">
            🥈
          </div>
        );
      case 2:
        return (
          <div className="w-9 h-9 rounded-2xl bg-amber-700 text-amber-100 font-black flex items-center justify-center text-lg shadow-md border-2 border-amber-600">
            🥉
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-2xl bg-slate-100 text-slate-600 font-black flex items-center justify-center text-sm border border-slate-200">
            #{index + 1}
          </div>
        );
    }
  };

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
        className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border-4 border-amber-400 relative overflow-hidden flex flex-col max-h-[90vh]"
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
            🏆
          </div>
          <h3 className="text-2xl font-black text-slate-900">
            Bảng Vàng Dũng Sĩ Xanh
          </h3>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Vinh danh những bạn nhỏ phân loại rác nhanh và chính xác nhất!
          </p>
        </div>

        {/* Scores List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 my-2">
          {sortedScores.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              Chưa có kỷ lục nào. Hãy chơi Vòng 1 để ghi tên đầu tiên nhé!
            </div>
          ) : (
            sortedScores.map((entry, idx) => (
              <div
                key={entry.id || idx}
                className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all ${
                  idx === 0
                    ? 'bg-amber-50/80 border-amber-300 shadow-sm'
                    : idx === 1
                    ? 'bg-slate-50 border-slate-200'
                    : idx === 2
                    ? 'bg-orange-50/50 border-orange-200'
                    : 'bg-white border-slate-100'
                }`}
              >
                <div className="flex items-center gap-3">
                  {getRankBadge(idx)}
                  <div className="text-2xl">{entry.avatar || '⭐'}</div>
                  <div>
                    <h4 className="font-extrabold text-sm text-slate-800 leading-tight">
                      {entry.playerName}
                    </h4>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium mt-0.5">
                      <span className="text-emerald-700 font-bold">
                        Vượt {entry.roundsCleared}/3 vòng
                      </span>
                      <span>•</span>
                      <span>Chính xác: {entry.accuracy}%</span>
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-lg font-black text-amber-600">
                    {entry.score}
                  </span>
                  <span className="text-[10px] text-slate-400 font-bold block">
                    điểm
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-2">
          <button
            onClick={() => {
              sound.playPop();
              onResetLeaderboard();
            }}
            className="text-xs text-slate-400 hover:text-slate-600 font-bold flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={13} />
            Đặt lại bảng mẫu
          </button>
          <button
            onClick={() => {
              sound.playPop();
              onClose();
            }}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-black px-5 py-2.5 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95"
          >
            Đóng & Tiếp Tục Chơi
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
