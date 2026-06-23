"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ResetNotificationModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-[#13131a] border border-[#1e1e2a] rounded-2xl shadow-2xl w-full max-w-sm mx-4 overflow-hidden">
        <div className="p-6">
          <div className="flex flex-col items-center text-center gap-4">
            <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <span className="text-2xl">↺</span>
            </div>

            <div>
              <p className="text-white font-semibold text-base mb-2">
                십자수가 초기화됐어요
              </p>
              <p className="text-slate-400 text-sm leading-relaxed">
                저장 시점 대비 커밋이 <span className="text-red-400 font-medium">30% 이하</span>로 떨어져
                <br />
                십자수가 자동으로 초기화되었어요.
              </p>
            </div>

            <div className="w-full bg-[#0d0d12] border border-[#1e1e2a] rounded-xl p-3">
              <p className="text-slate-500 text-xs leading-relaxed">
                GitHub에 꾸준히 커밋하면 십자수를 지킬 수 있어요.
                <br />
                새로운 마음으로 다시 시작해보세요 🌱
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500
              text-white font-medium text-sm transition-all cursor-pointer"
          >
            새로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
