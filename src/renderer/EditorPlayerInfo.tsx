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

  return (
    <Card raised style={{ padding: '8px 16px' }}>
      <Breadcrumbs style={{ fontFamily: 'Inconsolata, monospace' }}>
        <span>Duration: {ed.videoInfo.duration}</span>
        <span>FPS: {ed.videoInfo.fps}</span>
        <span>Frames: {ed.videoInfo.frames}</span>
        <span>Current Frame: {currentFrame}</span>
        <span>Playback Speed: {ctx.playerSpeed.toFixed(1)}</span>
      </Breadcrumbs>
    </Card>
  );
};
export default EditorPlayerInfo;
