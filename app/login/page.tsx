import GithubButton from "./LoginForm";

const features = [
  {
    icon: "⬛",
    label: "커밋 수만큼 셀을 채워 픽셀 아트를 완성하세요",
  },
  {
    icon: "🎨",
    label: "원하는 색상으로 나만의 스타일을 표현하세요",
  },
  {
    icon: "📌",
    label: "완성된 이미지를 GitHub README에 바로 삽입하세요",
  },
];

export default function Page() {
  return (
    <div className="flex flex-1 items-center justify-center bg-[#0d0d12] px-4">
      {/* 배경 그래디언트 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_#1e1b4b20_0%,_transparent_60%)] pointer-events-none" />

      <div className="relative w-full max-w-sm">
        {/* 로고 + 타이틀 */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 mb-5">
            <span className="text-2xl">✦</span>
          </div>
          <h1 className="text-white text-2xl font-bold tracking-tight mb-2">
            CrossStitch
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed">
            GitHub 커밋을 십자수 픽셀 아트로 바꿔보세요.
            <br />
            나만의 README를 꾸며보세요.
          </p>
        </div>

        {/* 로그인 카드 */}
        <div className="bg-[#13131a] border border-[#1e1e2a] rounded-2xl p-6 mb-6">
          <GithubButton />

          <p className="text-center text-slate-600 text-xs mt-4">
            GitHub 계정으로 안전하게 로그인됩니다
          </p>
        </div>

        {/* 피처 리스트 */}
        <div className="flex flex-col gap-3">
          {features.map((f, i) => (
            <div key={i} className="flex items-center gap-3">
              <span className="text-lg">{f.icon}</span>
              <span className="text-slate-500 text-xs">{f.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
