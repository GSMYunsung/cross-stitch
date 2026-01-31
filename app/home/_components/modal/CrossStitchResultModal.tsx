"use client";

import { Modal } from "@/app/src/components/modal";
import { useAuth } from "@/app/src/hooks/useAuth";
import { useFile } from "@/app/src/hooks/useFile";
import { StitchFileInfo } from "@/app/src/types/github";
import { useEffect, useState } from "react";
import Image from "next/image";
import lottieJson from "../../../../public/check.json";
import {
  compareWithoutExtension,
  generateReadmeMarkdown,
} from "@/app/src/utils/string";
import Lottie from "react-lottie-player";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CrossStitchResultModal = ({ isOpen, onClose }: ModalProps) => {
  const { getAllFilesInfo } = useFile();
  const { user } = useAuth();

  const [userFileData, setUserFileData] = useState<StitchFileInfo | null>(null);
  const [isImgLoading, setIsImgLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && user) {
      getAllFilesInfo("images").then((fileData) => {
        if (fileData) {
          const myFile = fileData.find((metaData) =>
            compareWithoutExtension(metaData.name, user.uid),
          );
          if (myFile) {
            setUserFileData(myFile);
          }
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setUserFileData(null);
        setIsImgLoading(false);
        setIsCopied(false);
        onClose();
      }}
      title={"결과 확인"}
    >
      <div className="w-full max-w-[700px] aspect-[4/5] bg-black flex-col rounded-lg overflow-hidden flex items-center justify-center relative p-6">
        {userFileData?.url ? (
          <div
            className={`flex flex-col items-center w-full ${isImgLoading ? "opacity-100" : "opacity-0"}`}
          >
            {isCopied ? (
              <div className="flex flex-col items-center animate-in fade-in zoom-in duration-300">
                <Lottie
                  loop={false}
                  animationData={lottieJson}
                  play
                  style={{ width: 150, height: 150 }}
                />
                <p className="text-white text-lg font-bold mt-2">복사 완료!</p>
                <p className="text-gray-400 text-sm mt-1">
                  GitHub README에 붙여넣기 하세요.
                </p>
              </div>
            ) : (
              <>
                <Image
                  src={`${userFileData.url}`}
                  alt="crossStitch picture"
                  onLoad={() => setIsImgLoading(true)}
                  width={700}
                  height={400}
                  className="rounded-lg object-contain"
                />
                <button
                  className="bg-sky-500 hover:bg-sky-700 mt-8 rounded-md px-12 py-2 text-white font-medium transition-colors cursor-pointer"
                  onClick={handleCopy}
                >
                  리드미 링크 복사하기
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">이미지를 불러오는 중...</p>
          </div>
        )}
      </div>
    </Modal>
  );
};
