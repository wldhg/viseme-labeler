import React, { useContext } from 'react';
import EditorContext, {
  EditorLabelTrack,
  EditorLabelNotLabelled,
} from '../context/editor';
import visemes from '../visemes/visemes';

type EditorLabelVisualizerTrackProps = {
  currentFrame: number;
  track: EditorLabelTrack;
};

const EditorLabelVisualizerTrack = (props: EditorLabelVisualizerTrackProps) => {
  const { currentFrame, track } = props;
  const ed = useContext(EditorContext);

  return (
    <div
      className="visemecont"
      style={
        {
          '--current-frame': currentFrame,
          '--track-no': track,
        } as React.CSSProperties
      }
    >
      {ed.labelData.timing.map((t, i) => {
        let state = 'labelled';
        if (ed.labelData.label[track][i] === EditorLabelNotLabelled) {
          state = 'unlabelled';
        } else if (ed.labelData.label[track][i] === visemes.emptyStrID) {
          state = 'noise';
        } else if (ed.labelData.label[track][i] === visemes.unknownStrID) {
          state = 'unknown';
        }
        let dispLabel = '';
        if (
          ed.labelData.label[track][i] !== EditorLabelNotLabelled &&
          ed.labelData.label[track][i] !== visemes.emptyStrID
        ) {
          if (ed.labelData.timing.length - 1 === i) {
            // Last tick
            dispLabel = visemes.def[ed.labelData.label[track][i]]?.disp;
          } else if (
            ed.labelData.label[track][i + 1] !== ed.labelData.label[track][i]
          ) {
            // Different label
            dispLabel = visemes.def[ed.labelData.label[track][i]]?.disp;
          }
        }

        return (
          <div
            data-labelidx={i}
            data-track={track}
            data-selected={ed.selection[track].includes(i) ? 'true' : 'false'}
            data-timeline={
              i % Math.round(ed.videoInfo.fps) === 0
                ? `${Math.floor(t / 60)}:${String(Math.round(t % 60)).padStart(
                    2,
                    '0'
                  )}`
                : ''
            }
            data-state={state}
            data-type={
              visemes.def[ed.labelData.label[track][i]]?.type || 'notype'
            }
            data-strongtick={dispLabel !== ''}
            key={`visemelabeller-${track}-${ed.videoInfo.duration}-${t}`}
            className="visemeblock"
          >
            <span
              style={
                {
                  '--label-margin':
                    visemes.allIDs.indexOf(ed.labelData.label[track][i]) * 2,
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
