import React from 'react';
import { Swords, X, MessageSquareQuote } from 'lucide-react';

export interface DialoguePayload {
  npcId: string;
  name: string;
  role: string;
  dialogue: string;
  scenarioId: string;
}

interface Props {
  dialogue: DialoguePayload | null;
  onClose: () => void;
  onStartBattle: (scenarioId: string) => void;
}

export const NPCDialogue: React.FC<Props> = ({ dialogue, onClose, onStartBattle }) => {
  if (!dialogue) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 max-w-2xl w-[94%] bg-slate-900 border-2 border-amber-500 rounded-3xl p-5 shadow-2xl animate-in slide-in-from-bottom-6 duration-200">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <MessageSquareQuote className="w-5 h-5 text-amber-400" />
          <span className="font-black text-sm text-slate-100">{dialogue.name}</span>
          <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
            {dialogue.role}
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Body */}
      <p className="text-xs sm:text-sm text-slate-200 leading-relaxed italic mb-5">
        "{dialogue.dialogue}"
      </p>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
        >
          Để Tôi Suy Nghĩ Lại
        </button>
        <button
          onClick={() => onStartBattle(dialogue.scenarioId)}
          className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black text-xs cursor-pointer shadow-lg active:scale-95 transition-all"
        >
          <Swords className="w-4 h-4" />
          <span>Vào Giao Đấu Quyết Sách (Battle) ➔</span>
        </button>
      </div>
    </div>
  );
};
