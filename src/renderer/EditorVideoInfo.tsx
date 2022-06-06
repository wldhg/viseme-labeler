import { useContext } from 'react';
import { Breadcrumbs, Card } from '@mui/material';
import EditorContext from '../context/editor';

type EditorVideoInfoProps = {
  currentFrame: number;
};

const EditorVideoInfo = (props: EditorVideoInfoProps) => {
  const ed = useContext(EditorContext);
  const { currentFrame } = props;

  return (
    <Card raised style={{ padding: '8px 16px' }}>
      <Breadcrumbs style={{ fontFamily: 'Inconsolata, monospace' }}>
        <span>Duration: {ed.videoInfo.duration}</span>
        <span>FPS: {ed.videoInfo.fps}</span>
        <span>Frames: {ed.videoInfo.frames}</span>
        <span>Current Frame: {currentFrame}</span>
      </Breadcrumbs>
    </Card>
  );
};
export default EditorVideoInfo;
