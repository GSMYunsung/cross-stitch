"use client";

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
          const myFile = fileData.find((m) => compareWithoutExtension(m.name, user.uid));
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
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      style={{ background: "rgba(245,238,230,0.92)", backdropFilter: "blur(4px)" }}
    >
      <div className="absolute inset-0" onClick={handleClose} />

      <div
        className="relative z-10 w-full max-w-lg"
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

        {/* 콘텐츠 */}
        <div className="p-5 flex flex-col items-center">
          {!userFileData ? (
            <div className="flex flex-col items-center py-12 gap-3">
              <div
                className="w-8 h-8 border-2 border-t-transparent animate-spin"
                style={{ borderColor: "#D5CFC7", borderTopColor: "#1A1A1A" }}
              />
              <span className="font-label text-[10px]" style={{ color: "#7A7A7A" }}>
                LOADING IMAGE...
              </span>
            </div>
          ) : isCopied ? (
            <div className="flex flex-col items-center py-8">
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
          ) : (
            <>
              <div
                className={`w-full transition-opacity duration-300 ${isImgLoaded ? "opacity-100" : "opacity-0"}`}
                style={{ border: "1.5px solid #1A1A1A", background: "#D5CFC7", padding: 2 }}
              >
                <Image
                  src={userFileData.url}
                  alt="crossStitch result"
                  onLoad={() => setIsImgLoaded(true)}
                  width={600}
                  height={400}
                  className="w-full object-contain"
                  style={{ display: "block" }}
                />
              </div>
              {!isImgLoaded && (
                <div className="flex items-center justify-center py-16">
                  <div
                    className="w-8 h-8 border-2 border-t-transparent animate-spin"
                    style={{ borderColor: "#D5CFC7", borderTopColor: "#1A1A1A" }}
                  />
                </div>
              )}
              <button
                className="mt-4 w-full py-3 font-label text-[11px] cursor-pointer transition-all"
                style={{
                  background: "#1A1A1A",
                  color: "#FFFFFF",
                  border: "1.5px solid #1A1A1A",
                  boxShadow: "3px 3px 0 #C41E3A",
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "1px 1px 0 #C41E3A"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.boxShadow = "3px 3px 0 #C41E3A"; }}
                onClick={handleCopy}
              >
                README 링크 복사하기
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
