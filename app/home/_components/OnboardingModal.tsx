"use client";

import { useEffect, useState } from "react";

const ONBOARDING_KEY = "crossstitch-onboarded";

const steps = [
  {
    icon: "⬛",
    title: "커밋하면 칸이 열려요",
    desc: "최근 7일간의 GitHub 커밋 수만큼 그리드 셀을 채울 수 있어요.",
  },
  {
    icon: "🎨",
    title: "색상을 골라 픽셀을 그려요",
    desc: "원하는 색을 선택하고 셀을 클릭해서 나만의 십자수 아트를 만드세요.",
  },
  {
    icon: "📌",
    title: "GitHub README에 삽입해요",
    desc: "완성 버튼을 누르면 이미지가 저장되고, 링크를 복사해 README에 바로 붙여넣을 수 있어요.",
  },
];

export default function OnboardingModal() {
  const [show, setShow] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (!localStorage.getItem(ONBOARDING_KEY)) {
      setShow(true);
    }
  }, []);

  const handleClose = () => {
    localStorage.setItem(ONBOARDING_KEY, "true");
    setShow(false);
  };

  if (!show) return null;

  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 bg-[#13131a] border border-[#1e1e2a] rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-2">
            <span className="text-indigo-400 text-lg font-bold">✦</span>
            <span className="text-white font-semibold">CrossStitch 시작하기</span>
          </div>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-300 transition-colors text-sm cursor-pointer"
          >
            건너뛰기
          </button>
        </div>

        {/* 스텝 인디케이터 */}
        <div className="flex gap-1.5 px-6 pt-2 pb-4">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === step
                  ? "w-6 bg-indigo-400"
                  : i < step
                    ? "w-3 bg-indigo-600"
                    : "w-3 bg-[#2a2a3a]"
              }`}
            />
          ))}
        </div>

        {/* 콘텐츠 */}
        <div className="px-6 pb-6">
          <div className="bg-[#0d0d12] rounded-xl p-6 mb-6 flex flex-col items-center text-center min-h-[160px] justify-center">
            <span className="text-5xl mb-4">{steps[step].icon}</span>
            <h3 className="text-white font-bold text-lg mb-2">
              {steps[step].title}
            </h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {steps[step].desc}
            </p>
          </div>

          <div className="flex gap-3">
            {step > 0 && (
              <button
                onClick={() => setStep((s) => s - 1)}
                className="flex-1 py-2.5 rounded-lg border border-[#2a2a3a] text-slate-400 hover:text-slate-200 hover:border-[#3a3a4a] transition-all text-sm cursor-pointer"
              >
                이전
              </button>
            )}
            <button
              onClick={isLast ? handleClose : () => setStep((s) => s + 1)}
              className="flex-1 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-all text-sm cursor-pointer"
            >
              {isLast ? "시작하기 →" : "다음"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
