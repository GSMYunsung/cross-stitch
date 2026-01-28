import {
  deleteObject,
  getDownloadURL,
  getMetadata,
  getStorage,
  listAll,
  ref,
} from "firebase/storage";
import { useStitch } from "../providers/StitchProvider";
import { exportImg } from "../utils/exportImg";

export const useFile = () => {
  const { gridRef } = useStitch();
  const storage = getStorage();

  const handleExport = async (fileName: string) => {
    if (gridRef.current) {
      exportImg(gridRef.current, fileName);
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

  const getAllFilesInfo = async (filderPath: string) => {
    const listRef = ref(storage, filderPath);

    try {
      const res = await listAll(listRef);

      const filesData = await Promise.all(
        res.items.map(async (itemRef) => {
          const metadata = await getMetadata(itemRef);
          const url = await getDownloadURL(itemRef);

          return {
            name: metadata.name,
            size: metadata.size,
            url: url,
            createdAt: metadata.timeCreated,
          };
        }),
      );

      return filesData;
    } catch (e) {
      console.error(e);
    }
  };

  const fileDelete = async (filePath: string): Promise<void> => {
    const fileRef = ref(storage, filePath);

    try {
      await deleteObject(fileRef);
    } catch (e) {
      console.error(e);
    }
  };

  return { handleExport, getFileInfo, getAllFilesInfo, fileDelete, storage };
};
