"use client";

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function ResetNotificationModal({ isOpen, onClose }: Props) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(245,238,230,0.92)", backdropFilter: "blur(4px)" }}
    >
      <div
        style={{
          background: "#FFFFFF",
          border: "2px solid #1A1A1A",
          boxShadow: "6px 6px 0 #C41E3A",
          width: "100%",
          maxWidth: 340,
        }}
      >
        <div
          className="px-5 py-3 flex items-center justify-between"
          style={{ background: "#C41E3A", borderBottom: "2px solid #1A1A1A" }}
        >
          <span className="font-label text-[11px]" style={{ color: "#FFFFFF" }}>
            !! RESET ALERT
          </span>
          <span className="text-white font-black text-lg">↺</span>
        </div>

        <div className="p-5">
          <p className="font-label text-[10px] mb-2" style={{ color: "#1A1A1A" }}>
            십자수가 초기화됐어요
          </p>
          <p className="text-sm leading-relaxed mb-4" style={{ color: "#5A5050" }}>
            저장 시점 대비 커밋이{" "}
            <span className="font-black" style={{ color: "#C41E3A" }}>30% 이하</span>로
            떨어져 십자수가 자동으로 초기화되었어요.
          </p>

          <div
            className="p-3 mb-5 text-xs leading-relaxed"
            style={{ background: "#FEF9EC", border: "1px solid #C9971A", color: "#5A4A30" }}
          >
            꾸준히 커밋하면 십자수를 지킬 수 있어요. 새로운 마음으로 다시 시작해보세요 🌱
          </div>

          <button
            onClick={onClose}
            className="w-full py-3 cursor-pointer font-label text-[11px] transition-all"
            style={{
              background: "#1A1A1A",
              color: "#FFFFFF",
              border: "1.5px solid #1A1A1A",
              boxShadow: "3px 3px 0 #C41E3A",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "1px 1px 0 #C41E3A";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 #C41E3A";
            }}
          >
            새로 시작하기
          </button>
        </div>
      </div>
    </div>
  );
}
