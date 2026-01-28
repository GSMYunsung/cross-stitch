import { getStorage, ref, uploadString } from "firebase/storage";
import * as htmlToImage from "html-to-image";

const uploadStitchImage = async (element: HTMLElement, filename: string) => {
  const storage = getStorage();

  try {
    const imageDataUrl = await htmlToImage.toPng(element);

    const storageRef = ref(storage, `images/${filename}.png`);

    const snapshot = await uploadString(storageRef, imageDataUrl, "data_url");

    return snapshot;
  } catch (e) {
    return null;
  }
};

export { uploadStitchImage };
