export const isValidFilePath = (filepath: string): boolean => {
  if (!filepath) return false;
  const filePathRegex = /^([a-zA-Z]:|\/)[^<>"|?*]+\.[a-zA-Z0-9]+$/i;
  return filePathRegex.test(filepath);
};
