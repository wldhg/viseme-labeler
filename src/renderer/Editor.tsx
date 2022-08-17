import { useContext, useState, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  LinearProgress,
  Divider,
  Stack,
} from '@mui/material';
import Selecto from 'react-selecto';
import EditorContext from '../context/editor';
import EditorPlayerInfo from './EditorPlayerInfo';
import EditorPlayerProgress from './EditorPlayerProgress';
import EditorPlayer from './EditorPlayer';
import EditorPlayerControl from './EditorPlayerControl';
import EditorLabelControl from './EditorLabelControl';
import EditorLabelVisualizer from './EditorLabelVisualizer';
import EditorBanner from './EditorBanner';
import EditorNotice from './EditorNotice';

const Editor = () => {
  const ed = useContext(EditorContext);

  const selecto = useRef<Selecto>(null);
  const videoPlayer = useRef<HTMLVideoElement>(null);
  const audioPlayer = useRef<HTMLAudioElement>(null);
  const [progress, setProgress] = useState<EditorPlayerProgressInfo>({
    currentFrame: 0,
  });

  return (
    <>
      <Stack direction="row" spacing={4}>
        <EditorPlayer
          videoPlayerRef={videoPlayer}
          audioPlayerRef={audioPlayer}
          setProgress={setProgress}
          style={{
            width: 'auto',
            maxWidth: 'calc(100% - 900px)',
            marginBottom: '10px',
            height: 'calc(100vh - 140px)',
          }}
        />
        <Box>
          <EditorPlayerInfo currentFrame={progress.currentFrame} />
          <Divider light style={{ margin: '12px 0' }} />
          <EditorPlayerProgress player={videoPlayer.current} />
          <EditorPlayerControl
            videoPlayer={videoPlayer.current}
            audioPlayer={audioPlayer.current}
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
          <Divider light style={{ margin: '12px 0' }} />
          <EditorBanner />
          <Divider light style={{ margin: '12px 0' }} />
          <EditorNotice />
        </Box>
      </Stack>
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
    </>
  );
};

export default Editor;
