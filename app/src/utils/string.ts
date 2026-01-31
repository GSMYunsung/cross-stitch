const compareWithoutExtension = (firstString: string, secondString: string) => {
  const removeExt = (name: string) => name.replace(/\.[^/.]+$/, "");

  return removeExt(firstString) === removeExt(secondString);
};

const generateReadmeMarkdown = (imageUrl: string): string => {
  return `![My Cross Stitch](${imageUrl})`;
};

export { compareWithoutExtension, generateReadmeMarkdown };
