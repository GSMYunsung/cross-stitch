"use client";

import { useAuth } from "@/app/src/hooks/useAuth";
import { useFile } from "@/app/src/hooks/useFile";
import { StitchFileInfo } from "@/app/src/types/github";
import {
  compareWithoutExtension,
  generateReadmeMarkdown,
} from "@/app/src/utils/string";
import Lottie from "react-lottie-player";
import Image from "next/image";
import lottieJson from "../../../../public/check.json";
import { useEffect, useState } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrossStitchResultModal = ({ isOpen, onClose }: ModalProps) => {
  const { getAllFilesInfo } = useFile();
  const { user } = useAuth();

  const [userFileData, setUserFileData] = useState<StitchFileInfo | null>(null);
  const [isImgLoaded, setIsImgLoaded] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      getAllFilesInfo("images").then((fileData) => {
        if (fileData) {
          const myFile = fileData.find((m) =>
            compareWithoutExtension(m.name, user.uid),
          );
          if (myFile) setUserFileData(myFile);
        }
      });
    }
  }, [getAllFilesInfo, isOpen, user]);

  const handleCopy = () => {
    if (userFileData?.url) {
      navigator.clipboard.writeText(generateReadmeMarkdown(userFileData.url));
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={handleClose}
      />

      <div className="relative z-10 bg-[#13131a] border border-[#1e1e2a] rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        {/* 헤더 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#1e1e2a]">
          <h2 className="text-white font-semibold text-sm">결과 확인</h2>
          <button
            onClick={handleClose}
            className="text-slate-500 hover:text-slate-300 transition-colors cursor-pointer text-lg leading-none"
          >
            ✕
          </button>
        </div>

        {/* 콘텐츠 */}
        <div className="p-6 flex flex-col items-center">
          {!userFileData ? (
            <div className="flex flex-col items-center py-12 gap-4">
              <div className="w-10 h-10 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-slate-500 text-sm">이미지를 불러오는 중...</p>
            </div>
          ) : isCopied ? (
            <div className="flex flex-col items-center py-8 animate-in fade-in zoom-in duration-300">
              <Lottie
                loop={false}
                animationData={lottieJson}
                play
                style={{ width: 120, height: 120 }}
              />
              <p className="text-white font-bold text-lg mt-2">복사 완료!</p>
              <p className="text-slate-400 text-sm mt-1">
                GitHub README에 붙여넣기 하세요.
              </p>
              <button
                onClick={handleClose}
                className="mt-6 px-6 py-2.5 rounded-lg border border-[#2a2a3a] text-slate-400
                  hover:text-slate-200 hover:border-[#3a3a4a] transition-all text-sm cursor-pointer"
              >
                닫기
              </button>
            </div>
          ) : (
            <>
              <div
                className={`w-full rounded-xl overflow-hidden bg-[#0d0d12] border border-[#1e1e2a] transition-opacity duration-300 ${
                  isImgLoaded ? "opacity-100" : "opacity-0"
                }`}
              >
                <Image
                  src={userFileData.url}
                  alt="crossStitch result"
                  onLoad={() => setIsImgLoaded(true)}
                  width={600}
                  height={400}
                  className="w-full object-contain"
                />
              </div>
              {!isImgLoaded && (
                <div className="flex items-center justify-center py-16">
                  <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                </div>
              )}
              <button
                className="mt-5 w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500
                  text-white font-medium text-sm transition-all cursor-pointer
                  shadow-lg shadow-indigo-900/30"
                onClick={handleCopy}
              >
                리드미 링크 복사하기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
