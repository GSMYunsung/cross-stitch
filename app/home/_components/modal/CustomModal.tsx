"use client";

import { Modal } from "@/app/src/components/modal";
import { useAuth } from "@/app/src/hooks/useAuth";
import { useFile } from "@/app/src/hooks/useFile";
import { StitchFileInfo } from "@/app/src/types/github";
import { useEffect, useState } from "react";
import Image from "next/image";
import { compareWithoutExtension } from "@/app/src/utils/string";
import { useStitch } from "@/app/src/providers/StitchProvider";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomModal = ({ isOpen, onClose }: ModalProps) => {
  const { getAllFilesInfo } = useFile();
  const { user } = useAuth();

  const [userFileData, setUserFileData] = useState<StitchFileInfo | null>(null);

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

  // TODO: 링크 복사로직 추가

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setUserFileData(null);
        onClose();
      }}
      title={"결과 확인"}
    >
      <div>
        {userFileData?.url ? (
          <Image
            src={`${userFileData?.url}`}
            alt="crossStitch picture"
            width={700}
            height={400}
          />
        ) : (
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-4 text-gray-500">이미지를 불러오는 중...</p>
          </div>
        )}

        <button
          className="flex bg-sky-500 justify-self-center hover:bg-sky-700 mt-8 rounded-md px-8 py-2 cursor-pointer"
          onClick={() => {}}
        >
          링크 복사하기
        </button>
      </div>
    </Modal>
  );
};
