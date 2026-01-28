"use client";

import CrossTitch from "@/app/src/components/CrossTitch";
import { useExport } from "@/app/src/hooks/useExport";

// TODO: 버튼 디자인하기
//       버튼 디자인하고 marge ㄱㄱ
// TODO: ~내 내 커밋수까지 포함시켜서 이미지 뽑으면 이쁘징할듯

export default function CrossStitchEditor() {
  const { handleExport } = useExport();

  return (
    <div className="flex flex-auto flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <CrossTitch />
      <button onClick={() => handleExport("my-stitch")}>완성!!</button>
    </div>
  );
}
