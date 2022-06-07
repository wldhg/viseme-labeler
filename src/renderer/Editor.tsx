import { useContext, useState, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Divider,
} from '@mui/material';
import Selecto from 'react-selecto';
import EditorContext from '../context/editor';
import EditorVideoInfo from './EditorVideoInfo';
import EditorVideoProgress from './EditorVideoProgress';
import EditorVideoPlayer from './EditorVideoPlayer';
import EditorVideoControl from './EditorVideoControl';
import EditorLabelControl from './EditorLabelControl';
import EditorLabelVisualizer from './EditorLabelVisualizer';
import EditorBanner from './EditorBanner';

const Editor = () => {
  const ed = useContext(EditorContext);

  const selecto = useRef<Selecto>(null);
  const player = useRef<HTMLVideoElement>(null);
  const [progress, setProgress] = useState<EditorVideoProgressInfo>({
    currentTime: 0,
    currentFrame: 0,
  });

  return (
    <Box>
      <EditorVideoInfo currentFrame={progress.currentFrame} />
      <Divider light style={{ margin: '12px 0' }} />
      <EditorVideoPlayer
        playerRef={player}
        setProgress={setProgress}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      <EditorVideoProgress player={player.current} />
      <EditorVideoControl
        player={player.current}
        selecto={selecto.current}
        currentFrame={progress.currentFrame}
        style={{
          marginTop: '1rem',
        }}
      />
      <EditorLabelControl
        selecto={selecto.current}
        track={0}
        currentFrame={progress.currentFrame}
        style={{
          marginTop: '1rem',
        }}
      />
      <EditorLabelVisualizer
        currentFrame={progress.currentFrame}
        selectoRef={selecto}
      />
      <EditorLabelControl
        selecto={selecto.current}
        track={1}
        currentFrame={progress.currentFrame}
      />
      <Divider light style={{ margin: '12px 0' }} />
      <EditorBanner />
      <Dialog
        open={!ed.isAnalyzed}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          Analyzing Video File...
        </DialogTitle>
        <DialogContent>
          <LinearProgress />
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Editor;
