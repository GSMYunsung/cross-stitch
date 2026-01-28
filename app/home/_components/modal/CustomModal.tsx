"use client";

import { Modal } from "@/app/src/components/modal";
import { useAuth } from "@/app/src/hooks/useAuth";
import { useFile } from "@/app/src/hooks/useFile";
import { StitchFileInfo } from "@/app/src/types/github";
import { useEffect, useState } from "react";
import Image from "next/image";
import { compareWithoutExtension } from "@/app/src/utils/string";

interface ModalProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const CustomModal = ({ isOpen, onClose }: ModalProps) => {
  const { getAllFilesInfo } = useFile();
  const { user } = useAuth();

  const [userFileData, setUserFileData] = useState<StitchFileInfo | null>(null);

  useEffect(() => {
    getAllFilesInfo("images").then((fileData) => {
      if (fileData && user) {
        fileData.map((metaData) => {
          if (compareWithoutExtension(metaData.name, user.uid)) {
            setUserFileData(metaData);
          }
        });
      }
    });
  }, [getAllFilesInfo, user, userFileData]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={"결과 확인"}>
      <div>
        {userFileData?.url ? (
          <Image
            src={`${userFileData?.url}`}
            alt="crossStitch picture"
            width={700}
            height={400}
          />
        ) : (
          <div />
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
