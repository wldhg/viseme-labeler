/* eslint-disable promise/no-nesting */
/* eslint-disable promise/no-promise-in-callback */
/* eslint-disable no-console */

import fs from 'fs';
import { BrowserWindow, shell, ipcMain, dialog } from 'electron';
import ffmpeg from 'fluent-ffmpeg';
import { getFilesRecursively, Hermes } from './shared';

export default (
  getHermes: () => Promise<{ hermes: Hermes; mainWindow: BrowserWindow }>
) => {
  ipcMain.on('ffmpeg-probe', (_, _inputPaths) => {
    const inputPaths = _inputPaths as string[];
    ffmpeg(inputPaths[0])
      .input(inputPaths[0])
      .ffprobe((err, data) => {
        if (err) {
          throw err;
        } else {
          getHermes()
            .then(({ hermes }) => {
              hermes(
                'ffmpeg-probed',
                data.streams[0].nb_frames,
                data.streams[0].duration,
                data.streams[0].r_frame_rate
              );
              return null;
            })
            .catch(console.error);
        }
      });
  });

  ipcMain.on('ffmpeg-convert', (_, _filePaths) => {
    const filePaths = _filePaths as string[];
    filePaths.forEach((f: string) => {
      ffmpeg(f)
        .output(`${f.substring(0, f.length - 4)}.mp4`)
        .on('end', () => {
          getHermes()
            .then(({ hermes }) => {
              hermes('ffmpeg-converted', f, 'converted');
              console.log(`${f}: converted`);
              return null;
            })
            .catch(console.error);
        })
        .on('error', (err) => {
          getHermes()
            .then(({ hermes }) => {
              hermes('ffmpeg-converted', f, err.message);
              console.log(`${f}: an error occurred: ${err.message}`);
              return null;
            })
            .catch(console.error);
        })
        .run();
    });
  });

  ipcMain.on('dir-select', () => {
    getHermes()
      .then(({ hermes, mainWindow }) => {
        dialog
          .showOpenDialog(mainWindow, {
            properties: ['openDirectory'],
          })
          .then((dir) => {
            if (dir.filePaths.length === 1) {
              const [selectedDir] = dir.filePaths;
              const fileList = getFilesRecursively(selectedDir);
              hermes('dir-selected', selectedDir, fileList);
              return null;
            }
            throw new Error('directory selection error occurred');
          })
          .catch((err) => {
            console.error(err);
            hermes('dir-selected', 'FAILED', []);
          });
        return null;
      })
      .catch(console.error);
  });

  ipcMain.on('open-url', (_, _url) => {
    const url = _url[0] as string;
    shell.openExternal(url);
  });

  ipcMain.on('viseme-save', (_, [filename, timelines, visemes]) => {
    let fileContent = '';
    for (let i = 0; i < timelines.length; i += 1) {
      fileContent += `${timelines[i]},${visemes[i]}\n`;
    }
    fs.writeFileSync(filename, fileContent, { encoding: 'utf8' });
  });

  ipcMain.on('viseme-load', (_, [filename]) => {
    const fileContent = fs.readFileSync(filename, 'utf8');
    const lines = fileContent
      .split('\n')
      .filter((line) => line.indexOf(',') > 0);
    const timelines = lines.map((line) => line.split(',')[0]);
    const visemes = lines.map((line) => line.split(',')[1]);
    getHermes()
      .then(({ hermes }) => {
        hermes('viseme-loaded', timelines, visemes);
        return null;
      })
      .catch(console.error);
  });
};
