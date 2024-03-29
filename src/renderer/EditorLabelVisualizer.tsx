import React, { useContext, useRef } from 'react';
import Selecto, { OnSelect } from 'react-selecto';
import EditorLabelVisualizerTrack from './EditorLabelVisualizerTrack';
import EditorLabelVisualizerWaveform from './EditorLabelVisualizerWaveform';
import EditorContext, {
  MutableEditorSelection,
  EditorLabelTracks,
} from '../context/editor';

import './EditorLabelVisualizer.scss';

type EditorLabelVisualizerProps = {
  currentFrame: number;
  selectoRef: React.RefObject<Selecto>;
};

const visibleFrameCountPrev = 60;
const visibleFrameCountPost = 90;

const EditorLabelVisualizer = (props: EditorLabelVisualizerProps) => {
  const { currentFrame, selectoRef } = props;
  const ed = useContext(EditorContext);
  const wrap = useRef<HTMLDivElement>(null);

  const onSelect = (sel: OnSelect) => {
    const selectedIdxes = sel.selected.map((e) =>
      Number.parseInt((e as HTMLDivElement).dataset.labelidx || '-1', 10)
    );
    const selectedTracks = sel.selected.map((e) =>
      Number.parseInt((e as HTMLDivElement).dataset.track || '-1', 10)
    );
    const selected: MutableEditorSelection = {
      0: [],
    };
    for (let i = 0; i < selectedIdxes.length; i += 1) {
      if (selectedIdxes[i] !== -1) {
        if (selectedTracks[i] === 0) {
          selected[0].push(selectedIdxes[i]);
        }
      }
    }
    ed.setSelection(selected);
    if (sel.selected.length === 0) {
      ed.setBanner('1-select', 'Select frame box(es) to start labeling.');
    } else {
      ed.setBanner('1-select', `${sel.selected.length} frame(s) selected.`);
    }
  };

  const sliceMin = Math.max(0, currentFrame - visibleFrameCountPrev);
  const sliceMax = Math.min(
    ed.labelData.timing.length,
    currentFrame + visibleFrameCountPost
  );
  const currentCursor = Math.min(currentFrame, visibleFrameCountPrev);

  return (
    <div id="visemetrackcont">
      <div
        id="visemewrap"
        ref={wrap}
        onScroll={(e) => {
          e.preventDefault();
          if (wrap.current) {
            wrap.current.scrollTo(0, 0);
          }
          return false;
        }}
        style={
          {
            '--current-frame': currentCursor,
            '--track-cnt': EditorLabelTracks.length,
          } as React.CSSProperties
        }
      >
        {EditorLabelTracks.map((t) => (
          <EditorLabelVisualizerTrack
            key={`visualizetrack-${t}`}
            track={t}
            sliceMin={sliceMin}
            sliceMax={sliceMax}
          />
        ))}
        <div id="visemeline" />
        <EditorLabelVisualizerWaveform currentFrame={currentFrame} />
      </div>
      <Selecto
        container={document.getElementById('visemewrap')}
        boundContainer={document.getElementById('visemewrap')}
        keyContainer={document.getElementById('visemewrap')}
        rootContainer={document.getElementById('visemewrap')}
        selectableTargets={['.visemeblock']}
        onSelect={onSelect}
        hitRate={0}
        ref={selectoRef}
      />
    </div>
  );
};

export default EditorLabelVisualizer;
