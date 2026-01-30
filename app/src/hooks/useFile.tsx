import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  getStorage,
  listAll,
  ref,
} from "firebase/storage";
import { useStitch } from "../providers/StitchProvider";
import { uploadStitchImage } from "../utils/uploadStitchImage";
import { useCallback } from "react";

export const useFile = () => {
  const { gridRef } = useStitch();
  const storage = getStorage();

  const handleUpload = async (fileName: string) => {
    if (gridRef.current) {
      return uploadStitchImage(gridRef.current, fileName);
    }
  };

  const getFileInfo = async (filePath: string) => {
    const fileRef = ref(storage, filePath);

    try {
      const metaData = await getMetadata(fileRef);

      return metaData;
    } catch (e) {
      console.error(e);
    }
  };

  // useCallback 찾아보기
  const getAllFilesInfo = useCallback(async (path: string) => {
    const storage = getStorage();
    const listRef = ref(storage, path);

    try {
      const res = await listAll(listRef);

      const fileData = await Promise.all(
        res.items.map(async (itemRef) => {
          const metadata = await getMetadata(itemRef);
          const url = await getDownloadURL(itemRef);

          return {
            name: itemRef.name,
            size: metadata.size,
            url: url,
            updatedAt: metadata.updated,
          };
        }),
      );

      return fileData;
    } catch (error) {
      console.error("파일 정보를 가져오는데 실패했습니다:", error);
      return null;
    }
  }, []);

  const fileDelete = async (filePath: string): Promise<void> => {
    const fileRef = ref(storage, filePath);

    try {
      await deleteObject(fileRef);
    } catch (e) {
      console.error(e);
    }
  };

  return { handleUpload, getFileInfo, getAllFilesInfo, fileDelete, storage };
};
