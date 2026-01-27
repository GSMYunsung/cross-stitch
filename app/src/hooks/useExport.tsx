"use client";

import { useStitch } from "../providers/StitchProvider";
import { exportImg } from "../utils/exportImg";

export const useExport = () => {
  const { gridRef } = useStitch();

  const handleExport = async (fileName: string) => {
    if (gridRef.current) {
      exportImg(gridRef.current, fileName);
    }
  };

  return { handleExport };
};
