import { useContext } from 'react';
import { IconButton, Tooltip, Toolbar } from '@mui/material';
import {
  RotateLeft,
  FolderOpen,
  SentimentVeryDissatisfied,
  ChangeCircleOutlined,
  Help,
} from '@mui/icons-material';
import GlobalContext, { GlobalContextItem } from '../context/global';
import DialogContext from '../context/dialog';

const AppToolbar = () => {
  const ctx = useContext(GlobalContext);
  const dialog = useContext(DialogContext);

  const resetContextWithConfirm = () => {
    return new Promise<void>((resolve, reject) => {
      if (ctx.doesCurrentItemHasChange) {
        dialog.setButtonHandler(() => {
          ctx.reset();
          dialog.reset();
          resolve();
        });
        dialog.setTitle('Do you want to discard changes?');
        dialog.setContent(
          <span>If you discard changes, you will lose all changes.</span>
        );
        dialog.setButtonLabel('Discard Changes');
        dialog.on('close', () => {
          reject();
        });
        dialog.setShow(true);
      } else {
        ctx.reset();
        dialog.reset();
        resolve();
      }
    });
  };

  const loadFolderUsingDialog = () => {
    resetContextWithConfirm()
      .then(() => {
        dialog.setTitle('Loading the working directory...');
        dialog.setContent(
          <>
            <span>Press </span>
            <kbd>Ctrl + R</kbd> or <kbd>Cmd + Shift + R</kbd>
            <span>if this dialog does not disappear.</span>
          </>
        );
        dialog.setShowProgress(true);
        dialog.setShow(true);
        window.electron.ipcRenderer.once('dir-selected', (dir, files) => {
          if (dir === 'FAILED') {
            dialog.reset();
            return;
          }
          if (files) {
            const movPathCandidates: string[] = [];
            (files as string[]).forEach((f) => {
              if (f.endsWith('.mov')) {
                movPathCandidates.push(f);
              }
            });
            const items: GlobalContextItem[] = [];
            (files as string[]).forEach((f) => {
              if (f.endsWith('.mp4')) {
                items.push({
                  srcFilePath: f,
                  outputPath: `${f.substring(0, f.length - 4)}.vis.csv`,
                  isCompleted: false,
                });
                const movChecker = movPathCandidates.indexOf(
                  `${f.substring(0, f.length - 4)}.mov`
                );
                if (movChecker > -1) {
                  movPathCandidates.splice(movChecker, 1);
                }
              }
            });
            items.forEach((i) => {
              if ((files as string[]).includes(i.outputPath)) {
                i.isCompleted = true;
              }
            });
            items.sort((a, b) => {
              if (a.isCompleted === b.isCompleted) {
                return a.srcFilePath.localeCompare(b.srcFilePath);
              }
              return a.isCompleted ? 1 : -1;
            });
            ctx.setItems(items);
            ctx.setConvertTargetPaths(movPathCandidates);
          }
          ctx.setBaseDirectoryPath(String(dir));
          ctx.setBaseDirectoryRead(true);
          dialog.reset();
        });
        window.electron.ipcRenderer.sendMessage('dir-select', []);
        return null;
      })
      .catch(() => null);
  };

  const openComfort = () => {
    window.electron.ipcRenderer.sendMessage('open-url', [
      'https://youtu.be/xjq-se5UZ-0?t=43',
    ]);
  };

  const convertMOV = () => {
    dialog.setTitle(
      `Do you want to convert ${ctx.convertTargetPaths.length} files?`
    );
    dialog.setContent(
      <span>MP4 files will be saved on the same directory as MOV files.</span>
    );
    dialog.setButtonLabel('Convert');
    dialog.setShow(true);
    dialog.setButtonHandler(() => {
      resetContextWithConfirm()
        .then(() => {
          let currentItemCnt = 0;
          const convertedItems: string[][] = [];
          const generateDialogContent = () => (
            <>
              {convertedItems.map((i) => {
                return (
                  <>
                    <span>
                      {i[0]} : {i[1]}
                    </span>
                    <br />
                  </>
                );
              })}
            </>
          );
          window.electron.ipcRenderer.on(
            'ffmpeg-converted',
            (filePath, message) => {
              convertedItems.push([filePath as string, message as string]);
              currentItemCnt += 1;
              if (currentItemCnt === ctx.convertTargetPaths.length) {
                dialog.setTitle('Conversion finished!');
                dialog.setContent(
                  <>
                    {generateDialogContent()}
                    <br />
                    <p>
                      Click below button to reset. Select the same directory
                      after then.
                    </p>
                  </>
                );
                dialog.setShowProgress(false);
                dialog.setButtonLabel('Reset');
                dialog.setShowButtons(true);
                dialog.setButtonHandler(() => {
                  if (currentItemCnt === ctx.convertTargetPaths.length) {
                    ctx.reset();
                    dialog.reset();
                  }
                });
                window.electron.ipcRenderer.removeAllListeners(
                  'ffmpeg-converted'
                );
              } else {
                dialog.setContent(generateDialogContent());
              }
            }
          );
          dialog.setTitle(
            `Converting ${ctx.convertTargetPaths.length} MOV files...`
          );
          dialog.setContent(<></>);
          dialog.setShowButtons(false);
          dialog.setShowProgress(true);
          window.electron.ipcRenderer.sendMessage(
            'ffmpeg-convert',
            ctx.convertTargetPaths
          );

          return null;
        })
        .catch(() => {
          dialog.reset();
        });
    });
  };

  const openHelp = () => {
    window.electron.ipcRenderer.sendMessage('open-url', [
      'https://wldh.notion.site/Viseme-ed252c234e204ffbb2179c0262fcd5f4',
    ]);
  };

  const mainMenuItem = [
    {
      text: 'Reset',
      icon: <RotateLeft />,
      handler: resetContextWithConfirm,
    },
    {
      text: 'Load Folder',
      icon: <FolderOpen />,
      handler: loadFolderUsingDialog,
    },
    {
      text: 'You Sad?',
      icon: <SentimentVeryDissatisfied />,
      handler: openComfort,
    },
    {
      text: 'Convert MOV Files',
      icon: <ChangeCircleOutlined />,
      handler: convertMOV,
      disabled: ctx.convertTargetPaths.length === 0,
    },
    {
      text: 'Viseme Help Table',
      icon: <Help />,
      handler: openHelp,
    },
  ];

  return (
    <Toolbar>
      {mainMenuItem.map((m) =>
        m.disabled ? (
          <IconButton disabled onClick={m.handler} key={m.text}>
            {m.icon}
          </IconButton>
        ) : (
          <Tooltip title={m.text} key={m.text}>
            <IconButton onClick={m.handler}>{m.icon}</IconButton>
          </Tooltip>
        )
      )}
    </Toolbar>
  );
};

export default AppToolbar;
