import { useContext } from 'react';
import { Breadcrumbs, Card } from '@mui/material';
import GlobalContext from '../context/global';
import EditorContext from '../context/editor';

type EditorPlayerInfoProps = {
  currentFrame: number;
};

const EditorPlayerInfo = (props: EditorPlayerInfoProps) => {
  const ctx = useContext(GlobalContext);
  const ed = useContext(EditorContext);
  const { currentFrame } = props;

  let waveformOffsetString = `${ed.waveformOffset}`;
  if (ed.waveformOffset > 0) {
    waveformOffsetString = `→${Math.abs(ed.waveformOffset)}`;
  } else if (ed.waveformOffset < 0) {
    waveformOffsetString = `←${Math.abs(ed.waveformOffset)}`;
  }

  return (
    <Card raised style={{ padding: '8px 16px' }}>
      <Breadcrumbs style={{ fontFamily: 'Inconsolata, monospace' }}>
        <span>Duration: {ed.videoInfo.duration}</span>
        <span>FPS: {ed.videoInfo.fps}</span>
        <span>Frames: {ed.videoInfo.frames}</span>
        <span>Current Frame: {currentFrame}</span>
        <span>Speed: {ctx.playerSpeed.toFixed(1)}</span>
        <span>Wave Offset: {waveformOffsetString}</span>
      </Breadcrumbs>
    </Card>
  );
};
export default EditorPlayerInfo;
