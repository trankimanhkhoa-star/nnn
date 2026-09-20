import React, { useState } from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { sound } from '../utils/sound';

export const SoundToggle: React.FC = () => {
  const [muted, setMuted] = useState(sound.getMuted());

  const handleToggle = () => {
    const nextMuted = sound.toggleMute();
    setMuted(nextMuted);
    if (!nextMuted) {
      sound.playPop();
    }
  };

  return (
    <button
      id="sound-toggle-btn"
      onClick={handleToggle}
      className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-sm shadow-md transition-all active:scale-95 border-2 ${
        muted
          ? 'bg-rose-100 text-rose-700 border-rose-300 hover:bg-rose-200'
          : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
      }`}
      title={muted ? 'Bật âm thanh' : 'Tắt âm thanh'}
    >
      {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      <span className="hidden sm:inline">{muted ? 'Âm thanh: Tắt' : 'Âm thanh: Bật'}</span>
    </button>
  );
};
