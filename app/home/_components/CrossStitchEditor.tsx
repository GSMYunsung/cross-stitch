"use client";

import CrossTitch from "@/app/src/components/CrossTitch";
import { useAuth } from "@/app/src/hooks/useAuth";
import { useFile } from "@/app/src/hooks/useFile";
import { CustomModal } from "./modal/CustomModal";
import { useState } from "react";
import { useStitch } from "@/app/src/providers/StitchProvider";

// TODO: ~내 내 커밋수까지 포함시켜서 이미지 뽑으면 이쁘징할듯

export default function CrossStitchEditor() {
  const { handleUpload } = useFile();
  const { user } = useAuth();
  const { hasCheckedItem } = useStitch();

  const [modal, setModal] = useState<boolean>(false);

  return (
    <div className="flex flex-auto flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <CrossTitch />
      <CustomModal
        isOpen={modal}
        onClose={() => {
          setModal(false);
        }}
      />
      <button
        className="flex mt-8 rounded-md px-8 py-2 text-white bg-sky-500 hover:bg-sky-700 
             disabled:bg-gray-300 disabled:cursor-not-allowed disabled:opacity-60 
             transition-all cursor-pointer"
        disabled={!hasCheckedItem()}
        onClick={() => {
          if (user?.uid) {
            handleUpload(user?.uid).then((data) => {
              if (data?.metadata) {
                setModal(true);
              }
            });
          }
        }}
      >
        완성
      </button>
    </div>
  );
}
