const compareWithoutExtension = (firstString: string, secondString: string) => {
  const removeExt = (name: string) => name.replace(/\.[^/.]+$/, "");

  return removeExt(firstString) === removeExt(secondString);
};

const generateReadmeMarkdown = (imageUrl: string): string => {
  return `
  <img src=${imageUrl} width="200" height="400"/>`;
};

export { compareWithoutExtension, generateReadmeMarkdown };
