const compareWithoutExtension = (firstString: string, secondString: string) => {
  const removeExt = (name: string) => name.replace(/\.[^/.]+$/, "");

  return removeExt(firstString) === removeExt(secondString);
};

const generateReadmeMarkdown = (uid: string, origin: string): string => {
  return `<img src="${origin}/api/readme-card/${uid}" width="500" height="215"/>`;
};

export { compareWithoutExtension, generateReadmeMarkdown };
