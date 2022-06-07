import { useContext } from 'react';
import { Button, Stack } from '@mui/material';
import { PlayArrow, Pause } from '@mui/icons-material';
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
      <Button
        size="small"
        variant="outlined"
        onClick={() => {
          if (player) {
            emptySelection();
            if (player.paused) {
              player.play();
            } else {
              player.pause();
            }
          }
        }}
      >
        {player && player.paused ? <PlayArrow /> : <Pause />}
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={() => {
          if (player) {
            emptySelection();
            player.currentTime = (currentFrame - 1) / ed.videoInfo.fps;
          }
        }}
      >
        -1 frame
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={() => {
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
        }}
      >
        +1 frame
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={() => {
          if (player) {
            emptySelection();
            player.currentTime -= 5;
          }
        }}
      >
        -5 sec
      </Button>
      <Button
        size="small"
        variant="outlined"
        onClick={() => {
          if (player) {
            emptySelection();
            player.currentTime += 5;
          }
        }}
      >
        +5 sec
      </Button>
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
