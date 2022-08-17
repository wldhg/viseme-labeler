import React, { useContext } from 'react';
import EditorContext, {
  EditorLabelTrack,
  EditorLabelNotLabelled,
} from '../context/editor';
import visemes from '../visemes/visemes';

type EditorLabelVisualizerTrackProps = {
  sliceMin: number;
  sliceMax: number;
  track: EditorLabelTrack;
};

const EditorLabelVisualizerTrack = (props: EditorLabelVisualizerTrackProps) => {
  const { sliceMin, sliceMax, track } = props;
  const ed = useContext(EditorContext);

  return (
    <div
      className="visemecont"
      style={
        {
          '--track-no': track,
        } as React.CSSProperties
      }
    >
      {ed.labelData.timing.slice(sliceMin, sliceMax).map((t, i) => {
        const ri = i + sliceMin;

        let state = 'labelled';
        if (ed.labelData.label[track][ri] === EditorLabelNotLabelled) {
          state = 'unlabelled';
        } else if (ed.labelData.label[track][ri] === visemes.emptyStrID) {
          state = 'noise';
        } else if (ed.labelData.label[track][ri] === visemes.unknownStrID) {
          state = 'unknown';
        } else if (ed.labelData.label[track][ri] === visemes.wrongStrID) {
          state = 'wrong';
        }
        let dispLabel = '';
        if (
          ed.labelData.label[track][ri] !== EditorLabelNotLabelled &&
          ed.labelData.label[track][ri] !== visemes.emptyStrID
        ) {
          const tracklabData = visemes.def[ed.labelData.label[track][ri]];
          if (ed.labelData.timing.length - 1 === ri) {
            // Last tick
            dispLabel = tracklabData?.track_disp || tracklabData?.disp;
          } else if (
            ed.labelData.label[track][ri + 1] !== ed.labelData.label[track][ri]
          ) {
            // Different label
            dispLabel = tracklabData?.track_disp || tracklabData?.disp;
          }
        }

        return (
          <div
            data-labelidx={ri}
            data-track={track}
            data-selected={ed.selection[track].includes(ri) ? 'true' : 'false'}
            data-timeline={
              ri % Math.round(ed.videoInfo.fps) === 0
                ? `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(
                    2,
                    '0'
                  )}`
                : ''
            }
            data-state={state}
            data-type={
              visemes.def[ed.labelData.label[track][ri]]?.type || 'notype'
            }
            data-strongtick={dispLabel !== ''}
            key={`visemelabeller-${track}-${ed.videoInfo.duration}-${t}`}
            className="visemeblock"
          >
            <span
              style={
                {
                  '--label-margin':
                    visemes.allIDs.indexOf(ed.labelData.label[track][ri]) * 2,
                  '--label-content': `"${dispLabel}"`,
                } as React.CSSProperties
              }
            />
          </div>
        );
      })}
    </div>
  );
};

export default EditorLabelVisualizerTrack;
