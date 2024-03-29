/* eslint-disable jsx-a11y/media-has-caption */

import { useEffect, useState, useContext, useRef } from 'react';
import GlobalContext from '../context/global';
import EditorContext, { EditorLabelContent } from '../context/editor';

type EditorPlayerProps = {
  videoPlayerRef: React.RefObject<HTMLVideoElement>;
  audioPlayerRef: React.RefObject<HTMLAudioElement>;
  setProgress: React.Dispatch<React.SetStateAction<EditorPlayerProgressInfo>>;
  style: React.CSSProperties;
};

const EditorPlayerProgressEventInterval = 10;

const EditorPlayer = (props: EditorPlayerProps) => {
  const { videoPlayerRef, audioPlayerRef, setProgress, style } = props;
  const ctx = useContext(GlobalContext);
  const ed = useContext(EditorContext);
  const [beforeItemIndex, setBeforeItemIndex] = useState<number>(-1);
  const [videoPlayerElement, setVideoPlayerElement] =
    useState<React.ReactNode>(null);
  const [audioPlayerElement, setAudioPlayerElement] =
    useState<React.ReactNode>(null);
  const videoProgressUpdateInterval = useRef<NodeJS.Timeout>();
  const fpsRef = useRef<number>(1);
  const updateProgressRef = useRef<() => void>(() => () => {});

  useEffect(() => {
    updateProgressRef.current = () => {
      setProgress({
        currentFrame: Math.round(
          ((videoPlayerRef.current?.currentTime || 0) / ed.videoInfo.fpc) *
            fpsRef.current
        ),
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setProgress, ed.videoInfo.fpc]);

  useEffect(() => {
    const a = audioPlayerRef.current;
    const v = videoPlayerRef.current;
    if (a) {
      a.playbackRate = ctx.playerSpeed * ed.videoInfo.fpc;
    }
    if (v) {
      v.playbackRate = ctx.playerSpeed * ed.videoInfo.fpc;
    }
  }, [ctx.playerSpeed, audioPlayerRef, videoPlayerRef, ed.videoInfo.fpc]);

  useEffect(() => {
    if (beforeItemIndex !== ctx.currentItemIndex) {
      ed.reset();
      ctx.setDoesCurrentItemHasChange(false);
      setProgress({
        currentFrame: 0,
      });
      setBeforeItemIndex(ctx.currentItemIndex);
      setAudioPlayerElement(
        <audio
          ref={audioPlayerRef}
          onLoadedMetadata={(e) => {
            if (e.target) {
              (e.target as HTMLAudioElement).playbackRate = ctx.playerSpeed;
            }
          }}
        >
          <source src={ctx.items[ctx.currentItemIndex].srcFilePath} />
        </audio>
      );
      setVideoPlayerElement(
        <video
          ref={videoPlayerRef}
          src={ctx.items[ctx.currentItemIndex].srcFilePath}
          onPlay={() => {
            if (videoProgressUpdateInterval.current) {
              clearInterval(videoProgressUpdateInterval.current);
            }
            videoProgressUpdateInterval.current = setInterval(() => {
              updateProgressRef.current();
            }, EditorPlayerProgressEventInterval);
            updateProgressRef.current();
          }}
          onPause={() => {
            if (videoProgressUpdateInterval.current) {
              clearInterval(videoProgressUpdateInterval.current);
            }
            updateProgressRef.current();
            if (audioPlayerRef.current) {
              audioPlayerRef.current.currentTime =
                videoPlayerRef.current?.currentTime || 0;
            }
          }}
          onSeeked={() => {
            updateProgressRef.current();
          }}
          onLoadedMetadata={(e) => {
            let elDuration = 0;
            if (e.target) {
              elDuration = (e.target as HTMLVideoElement).duration;
            }
            window.electron.ipcRenderer.once(
              'ffmpeg-probed',
              (pkts_, dur_, fps_) => {
                const realpkts = Number.parseInt(pkts_ as string, 10);
                const realfps = Number.parseFloat(
                  (fps_ as string).substring(0, (fps_ as string).indexOf('/'))
                );
                const realduration = Number.parseFloat(dur_ as string);
                fpsRef.current = realfps;
                ed.setVideoInfo({
                  fps: realfps,
                  frames: realpkts,
                  duration: realduration,
                  fpc: elDuration === 0 ? 1.0 : elDuration / realduration,
                });
                if (e.target) {
                  (e.target as HTMLVideoElement).playbackRate =
                    ctx.playerSpeed *
                    (elDuration === 0 ? 1.0 : elDuration / realduration);
                }
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

  return (
    <>
      {videoPlayerElement}
      {audioPlayerElement}
    </>
  );
};

export default EditorPlayer;
