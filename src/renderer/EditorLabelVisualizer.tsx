import { useContext, useEffect } from 'react';
import Selecto, { OnSelect } from 'react-selecto';
import EditorContext from '../context/editor';

import './EditorLabelVisualizer.scss';
import _visemes from './visemes.json';

const visemes = _visemes as unknown as Viseme;

type EditorLabelVisualizerProps = {
  currentFrame: number;
  selectoRef: React.RefObject<Selecto>;
};

const EditorLabelVisualizer = (props: EditorLabelVisualizerProps) => {
  const { currentFrame, selectoRef } = props;
  const ed = useContext(EditorContext);

  const getVisemeString = (id: number) => {
    if (id < visemes.id_begin.mo) {
      return visemes.ja[id % visemes.id_begin.ja];
    }
    return visemes.mo[id % visemes.id_begin.mo];
  };

  const onSelect = (sel: OnSelect) => {
    const selectedIdxes = sel.selected.map((e) =>
      Number.parseInt((e as HTMLDivElement).dataset.labelno || '-1', 10)
    );
    ed.setSelection(selectedIdxes);
    if (sel.selected.length === 0) {
      ed.setBanner('1-select', 'Select frame box(es) to start labeling.');
    } else {
      ed.setBanner('1-select', `${sel.selected.length} frame(s) selected.`);
    }
  };

  useEffect(() => {
    if (ed.selection.length === 0) {
      selectoRef.current?.setSelectedTargets([]);
    }
  }, [ed.selection, selectoRef]);

  return (
    <div>
      <div id="visemewrap">
        <div
          id="visemecont"
          style={{ marginLeft: `${300 + currentFrame * -8}px` }}
        >
          {ed.labelData.timing.map((t, i) => {
            let state = 'labelled';
            if (ed.labelData.label[i] === -1) {
              state = 'unlabelled';
            } else if (ed.labelData.label[i] === 0) {
              state = 'noise';
            }
            return (
              <div
                data-label={
                  ed.labelData.label[i] === -1
                    ? ''
                    : getVisemeString(ed.labelData.label[i])
                }
                data-labelno={i}
                data-displabel={
                  ed.labelData.label.length - 1 === i ||
                  (ed.labelData.label.length - 1 >= i + 1 &&
                    ed.labelData.label[i + 1] !== ed.labelData.label[i])
                }
                data-selected={ed.selection.includes(i) ? 'true' : 'false'}
                data-timeline={
                  i % Math.round(ed.videoInfo.fps) === 0
                    ? `${Math.floor(t / 60)}:${String(
                        Math.round(t % 60)
                      ).padStart(2, '0')}`
                    : ''
                }
                data-state={state}
                key={`visemelabeller-${ed.videoInfo.duration}-${t}`}
                className="visemeblock"
              >
                <span
                  data-label={
                    ed.labelData.label[i] === -1
                      ? ''
                      : getVisemeString(ed.labelData.label[i])
                  }
                />
              </div>
            );
          })}
        </div>
        <div id="visemeline" />
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
