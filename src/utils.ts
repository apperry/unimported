import { join } from 'path';

export const mapFilePath = (
  cwd: string,
  path: string,
  filePathMap: Record<string, string>,
) => {
  const keys = Object.keys(filePathMap);
  for (let keyIdx = 0; keyIdx < keys.length; keyIdx += 1) {
    const key = keys[keyIdx];
    const fromPath = join(cwd, key);
    if (path.startsWith(fromPath)) {
      return path.replace(fromPath, join(cwd, filePathMap[key]));
    }
  }
  return path;
};
