import { useContext } from 'react';
import { Button, Stack, Tooltip } from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';
import Selecto from 'react-selecto';
import EditorContext, { EditorContextDefault } from '../context/editor';
import GlobalContext from '../context/global';

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
  const ctx = useContext(GlobalContext);

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
      }, ((1 / ed.videoInfo.fps) * 900) / ctx.playerSpeed);
      audioPlayer.play();
      videoPlayer.currentTime = seekTime;
    }
  };

  const back8F = () => {
    if (videoPlayer && audioPlayer) {
      emptySelection();
      const currentTime = (currentFrame - 8) / ed.videoInfo.fps;
      videoPlayer.currentTime = currentTime;
      audioPlayer.currentTime = currentTime;
    }
  };

  const go8F = () => {
    if (videoPlayer && audioPlayer) {
      audioPlayer.currentTime = videoPlayer.currentTime;
      emptySelection();
      const seekTime = (currentFrame + 8) / ed.videoInfo.fps;
      setTimeout(() => {
        if (audioPlayer) {
          audioPlayer.pause();
          audioPlayer.currentTime = seekTime;
        }
      }, ((8 / ed.videoInfo.fps) * 950) / ctx.playerSpeed);
      audioPlayer.play();
      videoPlayer.currentTime = seekTime;
    }
  };

  const back1s = () => {
    if (videoPlayer && audioPlayer) {
      emptySelection();
      videoPlayer.currentTime -= 1;
      audioPlayer.currentTime = videoPlayer.currentTime;
    }
  };

  const go1s = () => {
    if (videoPlayer && audioPlayer) {
      emptySelection();
      videoPlayer.currentTime += 1;
      audioPlayer.currentTime = videoPlayer.currentTime;
    }
  };

  const goToStart = () => {
    if (videoPlayer && audioPlayer) {
      emptySelection();
      videoPlayer.currentTime = 0;
      audioPlayer.currentTime = 0;
    }
  };

  const goToEnd = () => {
    if (videoPlayer && audioPlayer) {
      emptySelection();
      videoPlayer.currentTime = ed.videoInfo.duration;
      audioPlayer.currentTime = ed.videoInfo.duration;
    }
  };

  ctx.setShortcutFunction(' ', playPause);
  ctx.setShortcutFunction('arrowup', back8F);
  ctx.setShortcutFunction('arrowdown', go8F);
  ctx.setShortcutFunction('arrowleft', back1F);
  ctx.setShortcutFunction('arrowright', go1F);
  ctx.setShortcutFunction('pageup', back1s);
  ctx.setShortcutFunction('pagedown', go1s);
  ctx.setShortcutFunction('home', goToStart);
  ctx.setShortcutFunction('end', goToEnd);
  ctx.setShortcutFunction(',', () => {
    const newSpeed = ctx.playerSpeed - 0.1;
    ctx.setPlayerSpeed(newSpeed < 0.1 ? 0.1 : newSpeed);
  });
  ctx.setShortcutFunction('.', () => {
    const newSpeed = ctx.playerSpeed + 0.1;
    ctx.setPlayerSpeed(newSpeed > 2 ? 2 : newSpeed);
  });

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
      <Tooltip title="Space key">
        <Button size="small" variant="outlined" onClick={playPause}>
          {videoPlayer && videoPlayer.paused ? <PlayArrow /> : <Pause />}
        </Button>
      </Tooltip>
      <Tooltip title="Left Arrow key">
        <Button size="small" variant="outlined" onClick={back1F}>
          -1 frame
        </Button>
      </Tooltip>
      <Tooltip title="Right Arrow key">
        <Button size="small" variant="outlined" onClick={go1F}>
          +1 frame
        </Button>
      </Tooltip>
      <Tooltip title="Up Arrow key">
        <Button size="small" variant="outlined" onClick={back8F}>
          -8 frame
        </Button>
      </Tooltip>
      <Tooltip title="Down Arrow key">
        <Button size="small" variant="outlined" onClick={go8F}>
          +8 frame
        </Button>
      </Tooltip>
      <Tooltip title="Page Up key">
        <Button size="small" variant="outlined" onClick={back1s}>
          -1 sec
        </Button>
      </Tooltip>
      <Tooltip title="Page Down key">
        <Button size="small" variant="outlined" onClick={go1s}>
          +1 sec
        </Button>
      </Tooltip>
      <Tooltip title="Home key">
        <Button size="small" variant="text" onClick={goToStart}>
          To Start
        </Button>
      </Tooltip>
      <Tooltip title="End key">
        <Button size="small" variant="text" onClick={goToEnd}>
          To End
        </Button>
      </Tooltip>
    </Stack>
  );
};

EditorPlayerControl.defaultProps = {
  style: {},
};

export default EditorPlayerControl;
