/* eslint-disable promise/no-nesting */
/* eslint-disable promise/no-promise-in-callback */
/* eslint-disable no-console */

import os from 'os';
import fs from 'fs';
import path from 'path';
import { BrowserWindow, shell, ipcMain, dialog } from 'electron';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegi from '@ffmpeg-installer/ffmpeg';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ffprobei from '@ffprobe-installer/ffprobe';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import trimImage from './trimImage';
import { getFilesRecursively, Hermes } from './shared';
import {
  EditorLabelContent,
  EditorLabelNotLabelled,
  EditorLabelTracks,
} from '../context/editor';

ffmpeg.setFfmpegPath(ffmpegi.path.replace('app.asar', 'app.asar.unpacked'));
ffmpeg.setFfprobePath(ffprobei.path.replace('app.asar', 'app.asar.unpacked'));

export default (
  getHermes: () => Promise<{
    hermes: Hermes;
    mainWindow: BrowserWindow;
  }>
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

  ipcMain.on('ffmpeg-wavespic', (_, [_filePath, width]) => {
    getHermes()
      .then(({ hermes }) => {
        const outputPath = path.join(
          os.tmpdir(),
          `wavespic-${new Date().getTime()}.png`
        );
        const outputTrimmedPath = path.join(
          os.tmpdir(),
          `wavespic-${new Date().getTime()}-trimmed.png`
        );
        ffmpeg(_filePath)
          .complexFilter(
            `aformat=channel_layouts=mono,compand,showwavespic=colors=#e44993:s=${width}x600`
          )
          .frames(1)
          .output(outputPath)
          .on('end', () => {
            trimImage(outputPath, outputTrimmedPath, (err) => {
              if (err) {
                throw err;
              }
              const imageB64 = fs.readFileSync(outputTrimmedPath, 'base64');
              hermes(
                'ffmpeg-wavespic-done',
                `data:image/png;base64,${imageB64}`
              );
            });
          })
          .on('error', console.error)
          .run();
        return null;
      })
      .catch(console.error);
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

  ipcMain.on('viseme-save', (_, [filename, _timelines, _visemes]) => {
    const timelines = _timelines as number[];
    const visemes = _visemes as EditorLabelContent;
    let fileContent = '';
    for (let i = 0; i < timelines.length; i += 1) {
      fileContent += `${timelines[i]},${EditorLabelTracks.map(
        (t) => visemes[t][i]
      ).join(',')}\n`;
    }
    fs.writeFileSync(filename, fileContent, { encoding: 'utf8' });
  });

  ipcMain.on('viseme-load', (_, [filename]) => {
    const fileContent = fs.readFileSync(filename, 'utf8');
    const lines = fileContent
      .split('\n')
      .filter((line) => (line.match(/,/g) || []).length === 1); // Length: track count
    const timelines: number[] = lines.map((line) =>
      Number.parseFloat(line.split(',')[0])
    );
    const visemesL: string[][] = lines.map((line) => line.split(',').slice(1));
    const visemes: EditorLabelContent = {
      0: visemesL.map((v) => v[0] || EditorLabelNotLabelled),
    };
    getHermes()
      .then(({ hermes }) => {
        hermes('viseme-loaded', timelines, visemes);
        return null;
      })
      .catch(console.error);
  });

  ipcMain.on('app-close', () => {
    getHermes()
      .then(({ mainWindow }) => {
        mainWindow.close();
        return null;
      })
      .catch(console.error);
  });

  ipcMain.on('app-unmaximize', () => {
    getHermes()
      .then(({ mainWindow }) => {
        mainWindow.setFullScreen(false);
        return null;
      })
      .catch(console.error);
  });

  ipcMain.on('app-maximize', () => {
    getHermes()
      .then(({ mainWindow }) => {
        mainWindow.setFullScreen(true);
        return null;
      })
      .catch(console.error);
  });
};
