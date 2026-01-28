const compareWithoutExtension = (firstString: string, secondString: string) => {
  const removeExt = (name: string) => name.replace(/\.[^/.]+$/, "");

  return removeExt(firstString) === removeExt(secondString);
};

export { compareWithoutExtension };
