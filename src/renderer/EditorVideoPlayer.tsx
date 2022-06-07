/* eslint-disable jsx-a11y/media-has-caption */

import { useEffect, useState, useContext, useRef } from 'react';
import GlobalContext from '../context/global';
import EditorContext, { EditorLabelContent } from '../context/editor';

type EditorVideoPlayerProps = {
  playerRef: React.RefObject<HTMLVideoElement>;
  setProgress: React.Dispatch<React.SetStateAction<EditorVideoProgressInfo>>;
  style: React.CSSProperties;
};

const EditorVideoPlayerProgressEventInterval = 10;

const EditorVideoPlayer = (props: EditorVideoPlayerProps) => {
  const { playerRef, setProgress, style } = props;
  const ctx = useContext(GlobalContext);
  const ed = useContext(EditorContext);
  const [beforeItemIndex, setBeforeItemIndex] = useState<number>(-1);
  const [playerElement, setPlayerElement] = useState<React.ReactNode>(null);
  const videoProgressUpdateInterval = useRef<NodeJS.Timeout>();
  const fpsRef = useRef<number>(1);

  const updateProgress = (currentTime = -1) => {
    setProgress({
      currentTime:
        currentTime === -1 ? playerRef.current?.currentTime || 0 : currentTime,
      currentFrame: Math.round(
        (playerRef.current?.currentTime || 0) * fpsRef.current
      ),
    });
  };

  useEffect(() => {
    if (beforeItemIndex !== ctx.currentItemIndex) {
      ed.reset();
      ctx.setDoesCurrentItemHasChange(false);
      setProgress({
        currentTime: 0,
        currentFrame: 0,
      });
      setBeforeItemIndex(ctx.currentItemIndex);
      setPlayerElement(
        <video
          ref={playerRef}
          src={ctx.items[ctx.currentItemIndex].srcFilePath}
          onPlay={() => {
            if (videoProgressUpdateInterval.current) {
              clearInterval(videoProgressUpdateInterval.current);
            }
            videoProgressUpdateInterval.current = setInterval(() => {
              updateProgress();
            }, EditorVideoPlayerProgressEventInterval);
            updateProgress();
          }}
          onPause={() => {
            if (videoProgressUpdateInterval.current) {
              clearInterval(videoProgressUpdateInterval.current);
            }
            updateProgress();
          }}
          onSeeked={() => {
            updateProgress();
          }}
          onLoadedMetadata={() => {
            window.electron.ipcRenderer.once(
              'ffmpeg-probed',
              (pkts_, dur_, fps_) => {
                const realpkts = Number.parseInt(pkts_ as string, 10);
                const realfps = Number.parseFloat(
                  (fps_ as string).substring(0, (fps_ as string).indexOf('/'))
                );
                fpsRef.current = realfps;
                ed.setVideoInfo({
                  fps: realfps,
                  frames: realpkts,
                  duration: Number.parseFloat(dur_ as string),
                });
                if (ctx.items[ctx.currentItemIndex].isCompleted) {
                  window.electron.ipcRenderer.once(
                    'viseme-loaded',
                    (timings, labels) => {
                      ed.forceSetLabelData(
                        timings as number[],
                        labels as EditorLabelContent
                      );
                      ed.setIsAnalyzed(true);
                    }
                  );
                  window.electron.ipcRenderer.sendMessage('viseme-load', [
                    ctx.items[ctx.currentItemIndex].outputPath,
                  ]);
                } else {
                  ed.setIsAnalyzed(true);
                }
              }
            );
            window.electron.ipcRenderer.sendMessage('ffmpeg-probe', [
              ctx.items[ctx.currentItemIndex].srcFilePath,
            ]);
          }}
          style={style}
        />
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ctx.currentItemIndex]);

  return <>{playerElement}</>;
};

export default EditorVideoPlayer;
