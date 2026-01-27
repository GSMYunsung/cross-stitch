"use client";

import CrossTitch from "@/app/src/components/CrossTitch";
import { useExport } from "@/app/src/hooks/useExport";

// TODO: 버튼 디자인하기
//       버튼 디자인하고 marge ㄱㄱ

export default function CrossStitchEditor() {
  const { handleExport } = useExport();

  return (
    <div className="flex flex-auto flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <CrossTitch />
      <button onClick={() => handleExport("my-stitch")}>완성!!</button>
    </div>
  );
}
