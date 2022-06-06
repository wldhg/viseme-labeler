import fs from 'fs';

export type R2MChannels =
  | 'ffmpeg-probe'
  | 'ffmpeg-convert'
  | 'dir-select'
  | 'open-url'
  | 'viseme-save'
  | 'viseme-load';

export type M2RChannels =
  | 'ffmpeg-probed'
  | 'ffmpeg-converted'
  | 'dir-selected'
  | 'viseme-loaded';

export type Hermes = (channel: M2RChannels, ...args: unknown[]) => void;

export const getFilesRecursively = (dirPath: string): string[] => {
  const files = fs.readdirSync(dirPath);
  const result: string[] = [];

  files.forEach((file) => {
    if (fs.statSync(`${dirPath}/${file}`).isDirectory()) {
      result.push(...getFilesRecursively(`${dirPath}/${file}`));
    } else {
      result.push(`${dirPath}/${file}`);
    }
  });

  return result;
};
