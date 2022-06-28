import { useContext } from 'react';
import { Button, Stack, Tooltip } from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';
import { useHotkeys } from 'react-hotkeys-hook';
import Selecto from 'react-selecto';
import EditorContext, { EditorContextDefault } from '../context/editor';

type EditorPlayerControlProps = {
  videoPlayer: HTMLVideoElement | null;
  audioPlayer: HTMLAudioElement | null;
  currentFrame: number;
  selecto: Selecto | null;
  style?: React.CSSProperties;
};

const EditorPlayerControl = (props: EditorPlayerControlProps) => {
  const { videoPlayer, audioPlayer, currentFrame, style, selecto } = props;
  const ed = useContext(EditorContext);

  const emptySelection = () => {
    ed.setSelection(EditorContextDefault.selection);
    selecto?.setSelectedTargets([]);
  };

  const playPause = () => {
    if (videoPlayer) {
      emptySelection();
      if (videoPlayer.paused) {
        videoPlayer.play();
      } else {
        videoPlayer.pause();
      }
    }
  };

  const back1F = () => {
    if (videoPlayer && audioPlayer) {
      emptySelection();
      const currentTime = (currentFrame - 1) / ed.videoInfo.fps;
      videoPlayer.currentTime = currentTime;
      audioPlayer.currentTime = currentTime;
    }
  };

  const go1F = () => {
    if (videoPlayer && audioPlayer) {
      audioPlayer.currentTime = videoPlayer.currentTime;
      emptySelection();
      const seekTime = (currentFrame + 1) / ed.videoInfo.fps;
      setTimeout(() => {
        if (audioPlayer) {
          audioPlayer.pause();
          audioPlayer.currentTime = seekTime;
        }
      }, (1 / ed.videoInfo.fps) * 900);
      audioPlayer.play();
      videoPlayer.currentTime = seekTime;
    }
  };

  const back5s = () => {
    if (videoPlayer && audioPlayer) {
      emptySelection();
      videoPlayer.currentTime -= 5;
      audioPlayer.currentTime = videoPlayer.currentTime;
    }
  };

  const go5s = () => {
    if (videoPlayer && audioPlayer) {
      emptySelection();
      videoPlayer.currentTime += 5;
      audioPlayer.currentTime = videoPlayer.currentTime;
    }
  };

  useHotkeys('ctrl+space', playPause);
  useHotkeys('left', back5s);
  useHotkeys('right', go5s);
  useHotkeys(',', back1F);
  useHotkeys('.', go1F);

  return (
    <Stack spacing={1} direction="row" style={style}>
      <span
        style={{
          margin: '4px',
          fontFamily: 'Inconsolata, monospace',
        }}
      >
        Control :{' '}
      </span>
      <Tooltip title="Space">
        <Button size="small" variant="outlined" onClick={playPause}>
          {videoPlayer && videoPlayer.paused ? <PlayArrow /> : <Pause />}
        </Button>
      </Tooltip>
      <Tooltip title="< key">
        <Button size="small" variant="outlined" onClick={back1F}>
          -1 frame
        </Button>
      </Tooltip>
      <Tooltip title="> key">
        <Button size="small" variant="outlined" onClick={go1F}>
          +1 frame
        </Button>
      </Tooltip>
      <Tooltip title="Left Arrow">
        <Button size="small" variant="outlined" onClick={back5s}>
          -5 sec
        </Button>
      </Tooltip>
      <Tooltip title="Right Arrow">
        <Button size="small" variant="outlined" onClick={go5s}>
          +5 sec
        </Button>
      </Tooltip>
      <Button
        size="small"
        variant="text"
        onClick={() => {
          if (videoPlayer && audioPlayer) {
            emptySelection();
            videoPlayer.currentTime = 0;
            audioPlayer.currentTime = 0;
          }
        }}
      >
        To Start
      </Button>
      <Button
        size="small"
        variant="text"
        onClick={() => {
          if (videoPlayer && audioPlayer) {
            emptySelection();
            videoPlayer.currentTime = ed.videoInfo.duration;
            audioPlayer.currentTime = ed.videoInfo.duration;
          }
        }}
      >
        To End
      </Button>
    </Stack>
  );
};

EditorPlayerControl.defaultProps = {
  style: {},
};

export default EditorPlayerControl;
