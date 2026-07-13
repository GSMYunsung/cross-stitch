"use client";

import { useStitch } from "@/app/src/providers/StitchProvider";
import { GAME_MODE, GameMode } from "@/app/src/types/crossTitch";
import { useState } from "react";

const ONBOARDING_KEY = (mode: GameMode) => `crossstitch-onboarded-${mode}`;

const challengeSteps = [
  { label: "STEP 01", title: "커밋하면 칸이 열려요", desc: "최근 한 달간의 GitHub 커밋 수만큼 셀을 채울 수 있어요." },
  { label: "STEP 02", title: "색상을 골라 그려요", desc: "왼쪽 컬러피커로 색을 고르고 셀을 클릭해서 픽셀 아트를 완성하세요." },
  { label: "STEP 03", title: "README에 삽입해요", desc: "완성 → 버튼을 누르면 이미지가 저장되고, 링크를 복사해 GitHub README에 붙여넣으세요." },
];

const normalSteps = [
  { label: "STEP 01", title: "제한 없이 채워요", desc: "커밋 수와 무관하게 원하는 만큼 셀을 채울 수 있어요. 자유롭게 창작하세요." },
  { label: "STEP 02", title: "색상을 골라 그려요", desc: "왼쪽 컬러피커로 색을 고르고 셀을 클릭해서 픽셀 아트를 완성하세요." },
  { label: "STEP 03", title: "README에 삽입해요", desc: "완성 → 버튼을 누르면 이미지가 저장되고, 링크를 복사해 GitHub README에 붙여넣으세요." },
];

export default function OnboardingModal() {
  const { mode } = useStitch();
  const [step, setStep] = useState(0);
  const [seenModes, setSeenModes] = useState<Set<GameMode>>(() => {
    if (typeof window === "undefined") return new Set();
    const seen = new Set<GameMode>();
    if (localStorage.getItem(ONBOARDING_KEY(GAME_MODE.NORMAL))) seen.add(GAME_MODE.NORMAL);
    if (localStorage.getItem(ONBOARDING_KEY(GAME_MODE.CHALLENGE))) seen.add(GAME_MODE.CHALLENGE);
    return seen;
  });

  const show = !seenModes.has(mode);

  const handleClose = () => {
    localStorage.setItem(ONBOARDING_KEY(mode), "true");
    setSeenModes((prev) => new Set([...prev, mode]));
  };

  if (!show) return null;

  const steps = mode === GAME_MODE.NORMAL ? normalSteps : challengeSteps;
  const isLast = step === steps.length - 1;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(245,238,230,0.92)", backdropFilter: "blur(4px)" }}
      onClick={handleClose}
    >
      <div
        className="w-full max-w-md"
        style={{
          background: "#FFFFFF",
          border: "2px solid #1A1A1A",
          boxShadow: "6px 6px 0 #1A1A1A",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ background: "#1A1A1A", borderBottom: "2px solid #1A1A1A" }}
        >
          <div className="flex items-center gap-3">
            <span className="font-label text-[11px]" style={{ color: "#FFFFFF" }}>
              HOW TO USE
            </span>
            <span
              className="font-label text-[9px] px-2 py-0.5"
              style={{
                background: mode === GAME_MODE.NORMAL ? "#3B9A3B" : "#C41E3A",
                color: "#fff",
              }}
            >
              {mode === GAME_MODE.NORMAL ? "NORMAL" : "CHALLENGE"}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="font-label text-[10px] cursor-pointer"
            style={{ color: "#888", textDecoration: "underline" }}
          >
            SKIP
          </button>
        </div>

        <div className="flex" style={{ borderBottom: "1.5px solid #D5CFC7" }}>
          {steps.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-1"
              style={{ background: i <= step ? "#C41E3A" : "#D5CFC7" }}
            />
          ))}
        </div>

        <div className="p-6">
          <span
            className="font-label text-[9px] block mb-2"
            style={{ color: "#C41E3A" }}
          >
            {steps[step].label}
          </span>
          <h3
            className="font-black text-xl mb-3"
            style={{ color: "#1A1A1A" }}
          >
            {steps[step].title}
          </h3>
          <p className="text-sm leading-relaxed" style={{ color: "#7A7A7A" }}>
            {steps[step].desc}
          </p>
        </div>

        <div
          className="flex gap-2 px-5 pb-5"
          style={{ borderTop: "1.5px solid #D5CFC7", paddingTop: 16 }}
        >
          {step > 0 && (
            <button
              onClick={() => setStep((s) => s - 1)}
              className="flex-1 py-2.5 font-label text-[10px] cursor-pointer transition-all"
              style={{ border: "1.5px solid #1A1A1A", background: "#FFFFFF", color: "#1A1A1A" }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#F0E9E0"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#FFFFFF"; }}
            >
              ← 이전
            </button>
          )}
          <button
            onClick={isLast ? handleClose : () => setStep((s) => s + 1)}
            className="flex-1 py-2.5 font-label text-[10px] cursor-pointer transition-all"
            style={{
              background: "#1A1A1A",
              color: "#FFFFFF",
              border: "1.5px solid #1A1A1A",
              boxShadow: "2px 2px 0 #C41E3A",
            }}
          >
            {isLast ? "시작하기 →" : "다음 →"}
          </button>
        </div>
      </div>
    </div>
  );
}
