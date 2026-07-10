import BackPressHandler from "@/app/src/components/BackPressHandler";
import GithubButton from "./LoginForm";

const features = [
  { label: "COMMIT → CELL", desc: "커밋 수만큼 셀이 열려요" },
  { label: "DRAW FREELY", desc: "원하는 색상으로 픽셀 아트를 그려요" },
  { label: "README READY", desc: "완성된 이미지를 GitHub README에 삽입해요" },
];

export default function Page() {
  return (
    <>
    <BackPressHandler />
    <div
      className="flex flex-1 items-center justify-center px-4 py-12"
      style={{ background: "#F5EEE6" }}
    >
      <div className="w-full max-w-[360px]">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="flex items-center justify-center w-12 h-12"
              style={{ background: "#C41E3A", border: "2px solid #1A1A1A" }}
            >
              <span
                className="text-white font-black text-xl"
                style={{ fontFamily: "var(--font-space-mono, 'Space Mono', monospace)" }}
              >
                S
              </span>
            </div>
            <div>
              <div
                className="font-black tracking-wider text-base"
                style={{ fontFamily: "var(--font-space-mono, 'Space Mono', monospace)", color: "#1A1A1A" }}
              >
                STITCH.COMMIT
              </div>
              <div
                className="text-[10px] tracking-widest uppercase"
                style={{ color: "#7A7A7A", fontFamily: "var(--font-space-mono, monospace)" }}
              >
                Turn commits into pixel art
              </div>
            </div>
          </div>

          <div style={{ borderTop: "2px solid #1A1A1A" }} />
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: "2px solid #1A1A1A",
            boxShadow: "5px 5px 0 #1A1A1A",
            padding: "24px",
            marginBottom: 20,
          }}
        >
          <p
            className="font-label text-[10px] mb-4"
            style={{ color: "#7A7A7A" }}
          >
            GitHub으로 로그인하여 시작하세요
          </p>
          <GithubButton />
        </div>

        <div className="flex flex-col gap-0 mb-5">
          {features.map((f, i) => (
            <div
              key={i}
              className="flex items-start gap-4 py-3"
              style={{
                borderBottom: i < features.length - 1 ? "1px solid #D5CFC7" : "none",
              }}
            >
              <span
                className="font-label text-[9px] flex-shrink-0 mt-0.5"
                style={{ color: "#C41E3A", minWidth: 80 }}
              >
                {f.label}
              </span>
              <span className="text-xs" style={{ color: "#7A7A7A" }}>
                {f.desc}
              </span>
            </div>
          ))}
        </div>

        <div
          style={{
            border: "1.5px solid #1A1A1A",
            background: "#FFFFFF",
          }}
        >
          <div
            className="px-4 py-2.5"
            style={{ background: "#1A1A1A", borderBottom: "1.5px solid #1A1A1A" }}
          >
            <span className="font-label text-[10px]" style={{ color: "#FFFFFF" }}>
              SELECT YOUR MODE
            </span>
          </div>

          <div
            className="flex items-start gap-3 px-4 py-3.5"
            style={{ borderBottom: "1px solid #D5CFC7" }}
          >
            <div
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-base"
              style={{ border: "1.5px solid #3B9A3B", background: "#F0FAF0" }}
            >
              🎨
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-label text-[9px]" style={{ color: "#3B9A3B" }}>
                  NORMAL MODE
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#7A7A7A" }}>
                커밋 수에 관계없이 자유롭게 채워요. 칸이 줄거나 초기화되지 않아요.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 px-4 py-3.5">
            <div
              className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-base"
              style={{ border: "1.5px solid #C41E3A", background: "#FFF5F5" }}
            >
              ⚔️
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-label text-[9px]" style={{ color: "#C41E3A" }}>
                  CHALLENGE MODE
                </span>
                <span
                  className="font-label text-[8px] px-1.5 py-0.5"
                  style={{ background: "#C41E3A", color: "#fff" }}
                >
                  GITHUB 연동
                </span>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "#7A7A7A" }}>
                이번 달 커밋 수만큼 칸을 사용해요. 커밋이 줄면 십자수도 함께 줄어들어요.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
}
