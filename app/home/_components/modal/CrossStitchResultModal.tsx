"use client";

import { useAuthInfo } from "@/app/src/providers/AuthProvider";
import { useStitch } from "@/app/src/providers/StitchProvider";
import { DEFAULT_MODE_CONFIG, MODE_MAP } from "@/app/src/config/modes";
import { useAuth } from "@/app/src/hooks/useAuth";
import { useFile } from "@/app/src/hooks/useFile";
import { StitchFileInfo } from "@/app/src/types/github";
import { compareWithoutExtension, generateReadmeMarkdown } from "@/app/src/utils/string";
import Image from "next/image";
import { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrossStitchResultModal = ({ isOpen, onClose }: ModalProps) => {
  const { getAllFilesInfo } = useFile();
  const { user } = useAuth();
  const { commitInfo, githubStats } = useAuthInfo();
  const { checkedCount, mode } = useStitch();

  const [userFileData, setUserFileData] = useState<StitchFileInfo | null>(null);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  const cfg = (mode && MODE_MAP[mode]) ?? DEFAULT_MODE_CONFIG;
  const modeData = { commitCount: commitInfo?.total_count ?? 0, checkedCount };
  const progressTotal = cfg.card.progressTotal(modeData);
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
          <span className="font-pixel" style={{ color: "#FFFFFF" }}>
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
            <div
              className="flex items-center justify-center mb-5"
              style={{
                width: 50,
                height: 50,
                background: "#1A1A1A",
                boxShadow: "4px 4px 0 #C41E3A",
                animation: "pixel-pop 0.2s ease-out",
              }}
            >
              <span style={{ color: "#FFFFFF", fontSize: 24, lineHeight: 1 }}>✓</span>
            </div>
            <style>{`@keyframes pixel-pop { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
            <p className="font-pixel mt-4" style={{ color: "#1A1A1A", fontSize: 12 }}>
              COPIED!
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
              <span className="font-pixel" style={{ color: "#7A7A7A" }}>
                {cfg.card.headerTitle} · {monthLabel}
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
                {/* 주요 지표 — cfg 기반으로 렌더링 */}
                <div
                  className="p-4"
                  style={{ background: cfg.card.heroBg, borderBottom: "1px solid #D5CFC7" }}
                >
                  <span className="font-pixel" style={{ color: cfg.label.color }}>
                    {cfg.card.heroLabel}
                  </span>
                  <div className="flex items-end gap-2 mt-1">
                    <span
                      className="font-black leading-none"
                      style={{
                        color: cfg.card.heroTextColor,
                        fontFamily: "var(--font-space-mono, monospace)",
                        fontSize: "3rem",
                      }}
                    >
                      {cfg.card.heroValue(modeData)}
                    </span>
                  </div>
                  <p className="font-label text-[9px] mt-1" style={{ color: cfg.card.heroSubColor }}>
                    {cfg.card.subText(modeData)}
                  </p>
                  <div className="mt-3">
                    <div className="flex justify-between mb-1">
                      <span className="font-label text-[9px]" style={{ color: cfg.card.heroSubColor }}>
                        {checkedCount}칸 채움
                      </span>
                      <span className="font-label text-[9px]" style={{ color: cfg.card.heroSubColor }}>
                        {Math.round(progressPct)}%
                      </span>
                    </div>
                    <div className="w-full h-1.5" style={{ background: cfg.card.progressBg, borderRadius: 2 }}>
                      <div
                        style={{
                          width: `${progressPct}%`,
                          height: "100%",
                          background: cfg.label.color,
                          borderRadius: 2,
                          transition: "width 0.6s ease",
                        }}
                      />
                    </div>
                  </div>
                </div>

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
                      <p className="font-pixel mt-0.5" style={{ color: "#7A7A7A" }}>
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
                className="w-full py-3 font-pixel cursor-pointer transition-all"
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
                COPY README LINK
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
