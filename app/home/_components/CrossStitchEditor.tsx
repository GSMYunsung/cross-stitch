"use client";

import CrossTitch from "@/app/src/components/CrossTitch";
import { useAuth } from "@/app/src/hooks/useAuth";
import { useFile } from "@/app/src/hooks/useFile";
import { CrossStitchResultModal } from "./modal/CrossStitchResultModal";
import { useState } from "react";
import { useStitch } from "@/app/src/providers/StitchProvider";
import { ColorPicker, useColor } from "react-color-palette";
import "react-color-palette/css";
import { CROSSTITCH_DEFAULT_SELECT_COLOR } from "@/app/src/constant";

// TODO: ~내 내 커밋수까지 포함시켜서 이미지 뽑으면 이쁘징할듯

export default function CrossStitchEditor() {
  const { handleUpload } = useFile();
  const { user } = useAuth();
  const { hasCheckedItem, updateSelectColor, resetGridState } = useStitch();

  const [modal, setModal] = useState<boolean>(false);
  const [color, setColor] = useColor(CROSSTITCH_DEFAULT_SELECT_COLOR);

  return (
    <div className="flex flex-auto flex-row items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <ColorPicker
        color={color}
        onChange={(color) => {
          setColor(color);
          updateSelectColor(color.hex);
        }}
      />
      <div className="flex flex-col items-center ml-13">
        <CrossTitch />
        <div className="flex flex-row gap-4">
          <button
            className="flex mt-8 rounded-md px-8 py-2 text-slate-500 border border-slate-300 
      hover:bg-slate-50 hover:text-slate-700 transition-all cursor-pointer"
            onClick={resetGridState}
          >
            초기화
          </button>
          <button
            className="flex mt-8 rounded-md px-8 py-2 text-white bg-indigo-600 
      hover:bg-indigo-700 active:bg-indigo-800
      disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
      transition-all cursor-pointer shadow-sm"
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
      </div>
      <CrossStitchResultModal
        isOpen={modal}
        onClose={() => {
          setModal(false);
        }}
      />
    </div>
  );
}
