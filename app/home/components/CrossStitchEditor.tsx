"use client";

import CrossTitch from "@/app/src/components/CrossTitch";
import { useAuth } from "@/app/src/hooks/useAuth";
import { useFile } from "@/app/src/hooks/useFile";
import { useEffect } from "react";

// TODO: ~내 내 커밋수까지 포함시켜서 이미지 뽑으면 이쁘징할듯

export default function CrossStitchEditor() {
  const { handleExport } = useFile();
  const { user } = useAuth();

  return (
    <div className="flex flex-auto flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <CrossTitch />
      <button
        className="flex bg-sky-500 hover:bg-sky-700 mt-8 rounded-md px-8 py-2 cursor-pointer"
        onClick={() => {
          if (user?.uid) handleExport(user?.uid);
        }}
      >
        완성
      </button>
    </div>
  );
}
