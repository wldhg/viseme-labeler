import { useEffect, useContext, useState } from 'react';
import GlobalContext from '../context/global';
import EditorContext from '../context/editor';

type EditorLabelVisualizerWaveformProps = {
  currentFrame: number;
};

const transparent1x1PNGB64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVQYV2NgYAAAAAMAAWgmWQ0AAAAASUVORK5CYII=';

const EditorLabelVisualizerWaveform = (
  props: EditorLabelVisualizerWaveformProps
) => {
  const { currentFrame } = props;
  const ctx = useContext(GlobalContext);
  const ed = useContext(EditorContext);
  const [beforeAnalyzed, setBeforeAnalyzed] = useState<boolean>(true);
  const [imgSrc, setImgSrc] = useState<string>(transparent1x1PNGB64);
  const [imgWidth, setImgWidth] = useState<number>(0);

  useEffect(() => {
    ctx.setShortcutFunction('shift+arrowleft', () => {
      ed.setWaveformOffset(ed.waveformOffset - 1);
    });

    ctx.setShortcutFunction('shift+arrowright', () => {
      ed.setWaveformOffset(ed.waveformOffset + 1);
    });

    ctx.setShortcutFunction('shift+)', () => {
      ed.setWaveformOffset(0);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ed.waveformOffset]);

  useEffect(() => {
    ctx.setShortcutFunction('`', () => {
      ed.setWaveformVisiblity(!ed.waveformVisiblity);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ed.waveformVisiblity]);

  useEffect(() => {
    if (
      ctx.currentItemIndex >= 0 &&
      ed.videoInfo.frames > 0 &&
      beforeAnalyzed === false &&
      ed.isAnalyzed
    ) {
      setImgSrc(transparent1x1PNGB64);

      window.electron.ipcRenderer.once('ffmpeg-wavespic-done', (srcStr) => {
        setImgSrc(srcStr as string);
        ed.setBanner('9-wavespic', 'Waveform generated successfully.', 1000);
      });

      const waveformWidth = ed.videoInfo.frames * 6 - 3;
      setImgWidth(waveformWidth);
      window.electron.ipcRenderer.sendMessage('ffmpeg-wavespic', [
        ctx.items[ctx.currentItemIndex].srcFilePath,
        waveformWidth,
      ]);
      ed.setBanner('9-wavespic', 'Generating waveform...');
    }
    setBeforeAnalyzed(ed.isAnalyzed);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ed.videoInfo.frames, ctx.currentItemIndex, ed.isAnalyzed]);

  return (
    <img
      id="viseme-waveform"
      src={imgSrc}
      alt="waveform"
      style={
        {
          visibility: ed.waveformVisiblity ? 'visible' : 'hidden',
          '--waveform-offset': ed.waveformOffset + 17,
          '--width-base': `${imgWidth}px`,
          '--current-frame': currentFrame,
        } as React.CSSProperties
      }
    />
  );
};

export default EditorLabelVisualizerWaveform;
