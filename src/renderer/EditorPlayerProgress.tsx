import { useContext } from 'react';
import { Stack, LinearProgress } from '@mui/material';
import EditorContext from '../context/editor';

type EditorPlayerProgressProps = {
  player: HTMLVideoElement | null;
};

type EditorPlayerProgressTextStyleType = {
  minWidth: string;
  textAlign: 'center';
};
const EditorPlayerProgressTextStyle: EditorPlayerProgressTextStyleType = {
  minWidth: '11ex',
  textAlign: 'center',
};

const EditorPlayerProgress = (props: EditorPlayerProgressProps) => {
  const { player } = props;
  const ed = useContext(EditorContext);

  const currentTime = player ? player.currentTime / ed.videoInfo.fpc : 0;

  return (
    <Stack
      spacing={1}
      direction="row"
      style={{ fontFamily: 'Inconsolata, monospace' }}
    >
      <span style={EditorPlayerProgressTextStyle}>
        {Math.floor(currentTime / 60)}:
        {String(Math.floor(currentTime % 60)).padStart(2, '0')}:
        {String(
          Math.ceil(1000 * (currentTime - Math.floor(currentTime)))
        ).padStart(3, '0')}
      </span>
      <LinearProgress
        style={{ width: '100%', margin: '10px' }}
        variant="determinate"
        value={(currentTime / ed.videoInfo.duration) * 100}
      />
      <span style={EditorPlayerProgressTextStyle}>
        -{Math.max(0, Math.floor((ed.videoInfo.duration - currentTime) / 60))}:
        {String(
          Math.max(0, Math.floor((ed.videoInfo.duration - currentTime) % 60))
        ).padStart(2, '0')}
        :
        {String(
          Math.ceil(
            1000 *
              (ed.videoInfo.duration -
                currentTime -
                Math.floor(ed.videoInfo.duration - currentTime))
          ) % 1000
        ).padStart(3, '0')}
      </span>
    </Stack>
  );
};

export default EditorPlayerProgress;
