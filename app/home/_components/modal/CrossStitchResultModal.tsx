"use client";

import { useAuthInfo } from "@/app/src/providers/AuthProvider";
import { useStitch } from "@/app/src/providers/StitchProvider";
import { GAME_MODE } from "@/app/src/types/crossTitch";
import { CROSSTITCH_SPEC } from "@/app/src/constant";
import { useAuth } from "@/app/src/hooks/useAuth";
import { useFile } from "@/app/src/hooks/useFile";
import { StitchFileInfo } from "@/app/src/types/github";
import { compareWithoutExtension, generateReadmeMarkdown } from "@/app/src/utils/string";
import Lottie from "react-lottie-player";
import Image from "next/image";
import lottieJson from "../../../../public/check.json";
import { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TOTAL_CELLS = CROSSTITCH_SPEC * CROSSTITCH_SPEC;

export const CrossStitchResultModal = ({ isOpen, onClose }: ModalProps) => {
  const { getAllFilesInfo } = useFile();
  const { user } = useAuth();
  const { commitInfo, githubStats } = useAuthInfo();
  const { checkedCount, mode } = useStitch();

  const [userFileData, setUserFileData] = useState<StitchFileInfo | null>(null);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const isChallenge = mode === GAME_MODE.CHALLENGE;
  const progressTotal = isChallenge ? (commitInfo?.total_count ?? 0) : TOTAL_CELLS;
  const progressPct = progressTotal > 0 ? Math.min((checkedCount / progressTotal) * 100, 100) : 0;
  const now = new Date();
  const monthLabel = `${now.getFullYear()}.${String(now.getMonth() + 1).padStart(2, "0")}`;

  useEffect(() => {
    if (isOpen && user) {
      getAllFilesInfo("images").then((fileData) => {
        if (fileData) {
          const myFile = fileData.find((m) => compareWithoutExtension(m.name, user.uid));
          if (myFile) setUserFileData(myFile);
        }
      });
    }
  }, [getAllFilesInfo, isOpen, user]);

  const handleCopy = () => {
    if (user?.uid) {
      navigator.clipboard.writeText(generateReadmeMarkdown(user.uid, window.location.origin));
      setIsCopied(true);
    }
  };

  const handleClose = () => {
    setUserFileData(null);
    setIsImgLoaded(false);
    setIsCopied(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(245,238,230,0.92)", backdropFilter: "blur(4px)" }}
    >
      <div className="absolute inset-0" onClick={handleClose} />

      <div
        className="relative z-10 w-full max-w-xl"
        style={{
          background: "#FFFFFF",
          border: "2px solid #1A1A1A",
          boxShadow: "6px 6px 0 #1A1A1A",
        }}
      >
        {/* 헤더 */}
        <div
          className="flex items-center justify-between px-5 py-3"
          style={{ background: "#1A1A1A", borderBottom: "2px solid #1A1A1A" }}
        >
          <span className="font-label text-[11px]" style={{ color: "#FFFFFF" }}>
            RESULT
          </span>
          <button
            onClick={handleClose}
            className="font-label text-[10px] cursor-pointer"
            style={{ color: "#888" }}
          >
            ✕ CLOSE
          </button>
        </div>

        {isCopied ? (
          /* 복사 완료 화면 */
          <div className="flex flex-col items-center py-8 px-5">
            <Lottie loop={false} animationData={lottieJson} play style={{ width: 120, height: 120 }} />
            <p className="font-black text-xl mt-2" style={{ color: "#1A1A1A" }}>
              복사 완료!
            </p>
            <p className="text-sm mt-1 mb-5" style={{ color: "#7A7A7A" }}>
              GitHub README에 붙여넣기 하세요.
            </p>
            <button
              onClick={handleClose}
              className="font-label text-[10px] px-6 py-2.5 cursor-pointer"
              style={{ border: "1.5px solid #1A1A1A", background: "#FFFFFF", color: "#1A1A1A" }}
            >
              CLOSE
            </button>
          </div>
        ) : !userFileData ? (
          /* 로딩 화면 */
          <div className="flex flex-col items-center py-16 gap-3">
            <div
              className="w-8 h-8 border-2 border-t-transparent animate-spin"
              style={{ borderColor: "#D5CFC7", borderTopColor: "#1A1A1A" }}
            />
            <span className="font-label text-[10px]" style={{ color: "#7A7A7A" }}>
              LOADING...
            </span>
          </div>
        ) : (
          <>
            {/* 서브헤더 */}
            <div
              className="px-5 py-2"
              style={{ borderBottom: "1px solid #D5CFC7" }}
            >
              <span className="font-label text-[10px]" style={{ color: "#7A7A7A" }}>
                {isChallenge ? "THIS MONTH" : "MY CANVAS"} · {monthLabel}
              </span>
            </div>

            {/* 본문 2열 */}
            <div className="flex gap-0" style={{ borderBottom: "1px solid #D5CFC7" }}>
              {/* 좌측: 픽셀아트 이미지 */}
              <div
                className="flex-1"
                style={{
                  borderRight: "1px solid #D5CFC7",
                  background: "#D5CFC7",
                  padding: 2,
                  minHeight: 200,
                }}
              >
                <div
                  className={`w-full h-full transition-opacity duration-300 ${isImgLoaded ? "opacity-100" : "opacity-0"}`}
                >
                  <Image
                    src={userFileData.url}
                    alt="crossStitch result"
                    onLoad={() => setIsImgLoaded(true)}
                    width={300}
                    height={300}
                    className="w-full h-full object-contain"
                    style={{ display: "block" }}
                  />
                </div>
                {!isImgLoaded && (
                  <div className="flex items-center justify-center h-full" style={{ minHeight: 200 }}>
                    <div
                      className="w-6 h-6 border-2 border-t-transparent animate-spin"
                      style={{ borderColor: "#A09890", borderTopColor: "#1A1A1A" }}
                    />
                  </div>
                )}
              </div>

              {/* 우측: 통계 */}
              <div className="flex-1 flex flex-col gap-0">
                {/* 주요 지표 */}
                {isChallenge ? (
                  /* 도전 모드: 이번 달 커밋 수 강조 블록 */
                  <div
                    className="p-4"
                    style={{ background: "#1A1A1A", borderBottom: "1px solid #D5CFC7" }}
                  >
                    <span className="font-label text-[10px]" style={{ color: "#C41E3A" }}>
                      THIS MONTH COMMITS
                    </span>
                    <div className="flex items-end gap-2 mt-1">
                      <span
                        className="font-black leading-none"
                        style={{
                          color: "#FFFFFF",
                          fontFamily: "var(--font-space-mono, monospace)",
                          fontSize: "3rem",
                        }}
                      >
                        {commitInfo?.total_count ?? 0}
                      </span>
                      <span className="font-label text-[10px] mb-1.5" style={{ color: "#888" }}>
                        commits
                      </span>
                    </div>
                    {/* 채운 칸 진행바 */}
                    <div className="mt-3">
                      <div className="flex justify-between mb-1">
                        <span className="font-label text-[9px]" style={{ color: "#888" }}>
                          {checkedCount}칸 채움
                        </span>
                        <span className="font-label text-[9px]" style={{ color: "#888" }}>
                          {Math.round(progressPct)}%
                        </span>
                      </div>
                      <div
                        className="w-full h-1.5"
                        style={{ background: "#333", borderRadius: 2 }}
                      >
                        <div
                          style={{
                            width: `${progressPct}%`,
                            height: "100%",
                            background: "#C41E3A",
                            borderRadius: 2,
                            transition: "width 0.6s ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 일반 모드: 채운 칸 강조 */
                  <div className="p-4" style={{ borderBottom: "1px solid #D5CFC7" }}>
                    <span className="font-label text-[10px]" style={{ color: "#7A7A7A" }}>
                      CANVAS
                    </span>
                    <div className="flex items-end gap-1.5 mt-0.5">
                      <span
                        className="font-black text-5xl leading-none"
                        style={{ color: "#1A1A1A", fontFamily: "var(--font-space-mono, monospace)" }}
                      >
                        {checkedCount}
                      </span>
                    </div>
                    <p className="font-label text-[9px] mt-1" style={{ color: "#7A7A7A" }}>
                      {checkedCount}칸 채움 · 전체 {TOTAL_CELLS}칸
                    </p>
                    <div
                      className="mt-2 w-full h-1.5"
                      style={{ background: "#E8E2DA", borderRadius: 2 }}
                    >
                      <div
                        style={{
                          width: `${progressPct}%`,
                          height: "100%",
                          background: "#3B9A3B",
                          borderRadius: 2,
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                    <p className="font-label text-[9px] mt-1 text-right" style={{ color: "#7A7A7A" }}>
                      {Math.round(progressPct)}%
                    </p>
                  </div>
                )}

                {/* GitHub 통계 4칸 그리드 */}
                <div className="grid grid-cols-2 gap-x-3 gap-y-3 p-4">
                  {[
                    { label: "REPOS", value: githubStats?.publicRepos },
                    { label: "FOLLOWERS", value: githubStats?.followers },
                    { label: "PRs", value: githubStats?.prs },
                    { label: "ISSUES", value: githubStats?.issues },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p
                        className="font-black text-lg leading-none"
                        style={{ color: "#1A1A1A", fontFamily: "var(--font-space-mono, monospace)" }}
                      >
                        {value != null ? value.toLocaleString() : "—"}
                      </p>
                      <p className="font-label text-[9px] mt-0.5" style={{ color: "#7A7A7A" }}>
                        {label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 하단 복사 버튼 */}
            <div className="p-4">
              <button
                className="w-full py-3 font-label text-[11px] cursor-pointer transition-all"
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
                onClick={handleCopy}
              >
                README 링크 복사하기
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
