import { getStorage, ref, uploadString } from "firebase/storage";
import * as htmlToImage from "html-to-image";

// TODO: 이미지 변환 후 이미지를 firebase strage 에 올린다음
//       firebase 링크 이용해 리드미 업로드 알리기
const exportImg = (element: HTMLElement, filename: string) => {
  const storage = getStorage();

  htmlToImage
    .toPng(element)
    .then((image) => {
      const link = window.document.createElement("a");
      link.style = "display:none;";
      link.href = image;
      const storageRef = ref(storage, `${filename}.png`);

      uploadString(storageRef, image, "data_url").then((snapshot) => {
        console.log("Uploaded a base64url string!");
      });
    })
    .catch((err) => {
      console.error("oops, something went wrong!", err);
    });
};

export { exportImg };
