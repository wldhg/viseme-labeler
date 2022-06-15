import { useContext, useEffect, useState } from 'react';
import { Stack, Typography, Button, CircularProgress } from '@mui/material';
import FFMPEGContext from '../context/ffmpeg';

const AppNotice = () => {
  const ffmpeg = useContext(FFMPEGContext);
  const [isOnChecking, setIsOnChecking] = useState(false);

  const checkFFMPEG = () => {
    if (!isOnChecking) {
      setIsOnChecking(true);
      window.electron.ipcRenderer.once('ffmpeg-binchecked', (mpeg, probe) => {
        ffmpeg.setChecked(mpeg as boolean, probe as boolean);
        setIsOnChecking(false);
      });
      window.electron.ipcRenderer.sendMessage('ffmpeg-bincheck', []);
    }
  };

  useEffect(() => {
    if (!ffmpeg.isCheckedOnce) {
      checkFFMPEG();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openWindowsInstallGuide = () => {
    window.electron.ipcRenderer.sendMessage('open-url', [
      'https://gumu.kr/blog/1091/ffmpeg-%EC%84%A4%EC%B9%98-%EB%B0%A9%EB%B2%95/',
    ]);
  };

  const openMacOSInstallGuide = () => {
    window.electron.ipcRenderer.sendMessage('open-url', [
      'https://wikidocs.net/127635',
    ]);
  };

  const openLinuxInstallGuide = () => {
    window.electron.ipcRenderer.sendMessage('open-url', [
      'https://logger.one/entry/%EB%A6%AC%EB%88%85%EC%8A%A4%EC%97%90%EC%84%9C-ffmpeg-install-%EC%9D%84-%ED%86%B5%ED%95%B4%EC%84%9C-FFMPEG-%EC%89%BD%EA%B2%8C-%EC%84%A4%EC%B9%98%ED%95%98%EA%B8%B0',
    ]);
  };

  const ffmpegStatus = ffmpeg.ffmpegChecked ? (
    <span style={{ color: 'lime' }}>Available</span>
  ) : (
    <span style={{ fontWeight: 900, color: 'red' }}>Unavailable</span>
  );

  const ffprobeStatus = ffmpeg.ffprobeChecked ? (
    <span style={{ color: 'lime' }}>Available</span>
  ) : (
    <span style={{ fontWeight: 900, color: 'red' }}>Unavailable</span>
  );

  const ffChecking = (
    <Stack direction="row" spacing={1} style={{ display: 'inline-block' }}>
      <CircularProgress size={12} />
      <span>Checking</span>
    </Stack>
  );

  return (
    <Stack spacing={2} style={{ margin: '12px 0' }}>
      <Typography variant="h5">FFMPEG/FFPROBE Installation Check</Typography>
      <Typography>Be sure to install the two programs below.</Typography>
      <Stack spacing={1} direction="row">
        <Button
          size="small"
          variant="contained"
          color="primary"
          onClick={checkFFMPEG}
          disabled={isOnChecking}
        >
          Check
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          onClick={openWindowsInstallGuide}
        >
          Windows Guide
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          onClick={openMacOSInstallGuide}
        >
          macOS Guide
        </Button>
        <Button
          size="small"
          variant="outlined"
          color="secondary"
          onClick={openLinuxInstallGuide}
        >
          Linux Guide
        </Button>
      </Stack>
      <ul style={{ fontFamily: 'Inconsolata, monospace' }}>
        <li>
          <code style={{ fontFamily: 'Inconsolata, monospace' }}>ffmpeg</code>
          &nbsp;&nbsp;:&nbsp;
          {isOnChecking ? ffChecking : ffmpegStatus}
        </li>
        <li>
          <code style={{ fontFamily: 'Inconsolata, monospace' }}>ffprobe</code>
          &nbsp;:&nbsp;
          {isOnChecking ? ffChecking : ffprobeStatus}
        </li>
      </ul>
    </Stack>
  );
};

export default AppNotice;
