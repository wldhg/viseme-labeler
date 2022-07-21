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

const visibleFrameCountPrev = 60;
const visibleFrameCountPost = 90;

const EditorLabelVisualizerTrack = (props: EditorLabelVisualizerTrackProps) => {
  const { currentFrame, track } = props;
  const ed = useContext(EditorContext);

  const sliceMin = Math.max(0, currentFrame - visibleFrameCountPrev);
  const sliceMax = Math.min(
    ed.labelData.timing.length,
    currentFrame + visibleFrameCountPost
  );

  const currentCursor = Math.min(currentFrame, visibleFrameCountPrev);

  return (
    <div
      className="visemecont"
      style={
        {
          '--current-frame': currentCursor,
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
