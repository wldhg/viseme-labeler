/* eslint-disable promise/no-nesting */
/* eslint-disable promise/no-promise-in-callback */
/* eslint-disable no-console */

import fs from 'fs';
import { BrowserWindow, shell, ipcMain, dialog } from 'electron';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegi from '@ffmpeg-installer/ffmpeg';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import ffprobei from '@ffprobe-installer/ffprobe';
import cmde from 'command-exists';
import { getFilesRecursively, Hermes } from './shared';
import {
  EditorLabelContent,
  EditorLabelNotLabelled,
  EditorLabelTracks,
} from '../context/editor';

ffmpeg.setFfmpegPath(ffmpegi.path.replace('app.asar', 'app.asar.unpacked'));
ffmpeg.setFfprobePath(ffprobei.path.replace('app.asar', 'app.asar.unpacked'));

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

  ipcMain.on('ffmpeg-bincheck', () => {
    const chkFFMPEG = new Promise((resolve) => {
      cmde('ffmpeg', (err, exists) => {
        if (err) {
          throw new Error(err);
        }
        resolve(exists);
      });
    });
    const chkFFPROBE = new Promise((resolve) => {
      cmde('ffprobe', (err, exists) => {
        if (err) {
          throw new Error(err);
        }
        resolve(exists);
      });
    });

    Promise.all([chkFFMPEG, chkFFPROBE])
      .then(([ffmpegExists, ffprobeExists]) => {
        getHermes()
          .then(({ hermes }) => {
            hermes(
              'ffmpeg-binchecked',
              ffmpegExists || ffmpegi.path !== '',
              ffprobeExists || ffprobei.path !== ''
            );
            console.log(`ffmpeg: ${ffmpegExists}`);
            console.log(`ffprobe: ${ffprobeExists}`);
            console.log(`ffmpegi: ${ffmpegi.path}`);
            console.log(`ffprobei: ${ffprobei.path}`);
            return null;
          })
          .catch(console.error);
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
};
