import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, MessageSquare } from 'lucide-react';
import { EventBus } from '../game/EventBus';

export const VirtualDPad: React.FC = () => {
  const handleDirStart = (dir: string) => {
    EventBus.emit('virtual-dpad-move', { dir });
  };

  const handleDirEnd = () => {
    EventBus.emit('virtual-dpad-move', { dir: 'stop' });
  };

  const handleAction = () => {
    EventBus.emit('virtual-action');
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-30 pointer-events-none flex items-end justify-between sm:hidden">
      {/* 4 Direction Buttons */}
      <div className="pointer-events-auto grid grid-cols-3 gap-1 bg-slate-950/70 p-2 rounded-2xl border border-slate-700/80 backdrop-blur-sm shadow-xl">
        <div />
        <button
          onTouchStart={() => handleDirStart('up')}
          onTouchEnd={handleDirEnd}
          onMouseDown={() => handleDirStart('up')}
          onMouseUp={handleDirEnd}
          className="w-11 h-11 rounded-xl bg-slate-800 active:bg-amber-500 text-slate-100 active:text-slate-950 flex items-center justify-center border border-slate-700 font-black cursor-pointer"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
        <div />

        <button
          onTouchStart={() => handleDirStart('left')}
          onTouchEnd={handleDirEnd}
          onMouseDown={() => handleDirStart('left')}
          onMouseUp={handleDirEnd}
          className="w-11 h-11 rounded-xl bg-slate-800 active:bg-amber-500 text-slate-100 active:text-slate-950 flex items-center justify-center border border-slate-700 font-black cursor-pointer"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div />
        <button
          onTouchStart={() => handleDirStart('right')}
          onTouchEnd={handleDirEnd}
          onMouseDown={() => handleDirStart('right')}
          onMouseUp={handleDirEnd}
          className="w-11 h-11 rounded-xl bg-slate-800 active:bg-amber-500 text-slate-100 active:text-slate-950 flex items-center justify-center border border-slate-700 font-black cursor-pointer"
        >
          <ArrowRight className="w-5 h-5" />
        </button>

        <div />
        <button
          onTouchStart={() => handleDirStart('down')}
          onTouchEnd={handleDirEnd}
          onMouseDown={() => handleDirStart('down')}
          onMouseUp={handleDirEnd}
          className="w-11 h-11 rounded-xl bg-slate-800 active:bg-amber-500 text-slate-100 active:text-slate-950 flex items-center justify-center border border-slate-700 font-black cursor-pointer"
        >
          <ArrowDown className="w-5 h-5" />
        </button>
        <div />
      </div>

      {/* Action Button (A / Talk) */}
      <button
        onClick={handleAction}
        className="pointer-events-auto w-16 h-16 rounded-full bg-gradient-to-tr from-amber-500 to-amber-400 active:scale-95 text-slate-950 flex flex-col items-center justify-center font-black text-xs border-2 border-slate-950 shadow-2xl cursor-pointer"
      >
        <MessageSquare className="w-6 h-6" />
        <span className="text-[10px] mt-0.5">BẮT CHUYỆN</span>
      </button>
    </div>
  );
};
