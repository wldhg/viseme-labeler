import { useContext } from 'react';
import { Button, Stack, Tooltip } from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';
import { useHotkeys } from 'react-hotkeys-hook';
import Selecto from 'react-selecto';
import EditorContext, { EditorContextDefault } from '../context/editor';

type EditorVideoControlProps = {
  player: HTMLVideoElement | null;
  currentFrame: number;
  selecto: Selecto | null;
  style?: React.CSSProperties;
};

const EditorVideoControl = (props: EditorVideoControlProps) => {
  const { player, currentFrame, style, selecto } = props;
  const ed = useContext(EditorContext);

  const emptySelection = () => {
    ed.setSelection(EditorContextDefault.selection);
    selecto?.setSelectedTargets([]);
  };

  const playPause = () => {
    if (player) {
      emptySelection();
      if (player.paused) {
        player.play();
      } else {
        player.pause();
      }
    }
  };

  const back1F = () => {
    if (player) {
      emptySelection();
      player.currentTime = (currentFrame - 1) / ed.videoInfo.fps;
    }
  };

  const go1F = () => {
    if (player) {
      emptySelection();
      const seekTime = (currentFrame + 1) / ed.videoInfo.fps;
      setTimeout(() => {
        if (player) {
          player.pause();
          player.currentTime = seekTime;
        }
      }, (1 / ed.videoInfo.fps) * 1000);
      player.play();
    }
  };

  const back5s = () => {
    if (player) {
      emptySelection();
      player.currentTime -= 5;
    }
  };

  const go5s = () => {
    if (player) {
      emptySelection();
      player.currentTime += 5;
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
          {player && player.paused ? <PlayArrow /> : <Pause />}
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
          if (player) {
            emptySelection();
            player.currentTime = 0;
          }
        }}
      >
        To Start
      </Button>
      <Button
        size="small"
        variant="text"
        onClick={() => {
          if (player) {
            emptySelection();
            player.currentTime = ed.videoInfo.duration;
          }
        }}
      >
        To End
      </Button>
    </Stack>
  );
};

EditorVideoControl.defaultProps = {
  style: {},
};

export default EditorVideoControl;
