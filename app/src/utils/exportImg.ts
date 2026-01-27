import * as htmlToImage from "html-to-image";

// TODO: 이미지를 다운로드 하는것이 아닌 변환 후 이미지를 firebase strage 에 올린다음
//       firebase 링크 이용해 리드미 업로드 알리기
const exportImg = (element: HTMLElement, filename: string) => {
  htmlToImage
    .toPng(element)
    .then((image) => {
      const link = window.document.createElement("a");
      link.style = "display:none;";
      link.download = filename + ".png";
      link.href = image;
      link.click();
    })
    .catch((err) => {
      console.error("oops, something went wrong!", err);
    });
};

export { exportImg };
