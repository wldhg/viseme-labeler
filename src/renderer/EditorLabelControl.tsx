import { useContext } from 'react';
import { Stack, Button, Tooltip } from '@mui/material';
import { Save, FormatPaint } from '@mui/icons-material';
import Selecto from 'react-selecto';
import GlobalContext from '../context/global';
import EditorContext, {
  EditorLabelTrack,
  EditorContextDefault,
  MutableEditorSelection,
  EditorLabelExp,
  EditorLabelTracks,
  EditorLabelNotLabelled,
} from '../context/editor';
import visemes, { VisemeType } from '../visemes/visemes';

type EditorLabelControlVisemeButtonColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'error'
  | 'warning';
type EditorLabelControlVisemeButtonVariant = 'outlined' | 'contained';

const EditorLabelControlVisemeButtonStyle = {
  fontFamily: 'Inconsolata, monospace',
  minWidth: '30px',
  fontWeight: 800,
  fontSize: '1.2em',
  padding: '0 8px',
};

const EditorLabelControlVisemeButtonColorMap: {
  [key in VisemeType]: EditorLabelControlVisemeButtonColor;
} = {
  typea: 'primary',
  typeb: 'secondary',
  typec: 'success',
  typed: 'warning',
  empty_str: 'info',
};

const EditorLabelControlVisemeButtonVariantMap: {
  [key in VisemeType]: EditorLabelControlVisemeButtonVariant;
} = {
  typea: 'contained',
  typeb: 'contained',
  typec: 'contained',
  typed: 'contained',
  empty_str: 'outlined',
};

type EditorLabelControlProps = {
  currentFrame: number;
  selecto: Selecto | null;
  track: EditorLabelTrack;
  style?: React.CSSProperties;
};

const EditorLabelControl = (props: EditorLabelControlProps) => {
  const { style, currentFrame, selecto, track } = props;
  const ctx = useContext(GlobalContext);
  const ed = useContext(EditorContext);

  const registerSelectionToSelecto = (selec: MutableEditorSelection) => {
    const newSelected = selec[track]
      .map((it) => {
        const queried = document.querySelector(
          `.visemeblock[data-labelidx="${it}"]`
        );
        if (queried) {
          return queried;
        }
        return null;
      })
      .filter(Boolean) as HTMLElement[];
    selecto?.setSelectedTargets(newSelected);
  };

  const getVisemeButton = (
    viseme: EditorLabelExp,
    color: EditorLabelControlVisemeButtonColor,
    variant: EditorLabelControlVisemeButtonVariant
  ) => {
    const vbutton = (
      <Button
        key={`visemelabelbutton-${viseme}`}
        color={color}
        variant={variant}
        style={EditorLabelControlVisemeButtonStyle}
        size="small"
        onClick={() => {
          if (ed.selection[track].length === 0) {
            const sell = currentFrame - ed.lastLabeled[track] - 1;
            if (sell <= 0) {
              return;
            }
            const selec = structuredClone(
              EditorContextDefault.selection
            ) as MutableEditorSelection;
            selec[track] = Array(sell)
              .fill(0)
              .map((_, i) => {
                return ed.lastLabeled[track] + i + 1;
              });
            registerSelectionToSelecto(selec);
            ctx.setDoesCurrentItemHasChange(true);
            ed.selectAndLabel(selec, viseme);
          } else {
            ctx.setDoesCurrentItemHasChange(true);
            ed.label(viseme);
          }
        }}
      >
        {viseme}
      </Button>
    );
    if (viseme === visemes.emptyStr) {
      return (
        <Tooltip title="Empty" key={`visemelabelbutton-tt-${viseme}`}>
          {vbutton}
        </Tooltip>
      );
    }
    return vbutton;
  };

  return (
    <Stack spacing={1} direction="row" style={style}>
      <span
        style={{
          margin: '4px',
          fontFamily: 'Inconsolata, monospace',
        }}
      >
        Track {track} :{' '}
      </span>
      {visemes.all.map((viseme) =>
        getVisemeButton(
          viseme,
          EditorLabelControlVisemeButtonColorMap[visemes.type[viseme]],
          EditorLabelControlVisemeButtonVariantMap[visemes.type[viseme]]
        )
      )}
      <Tooltip title="Fill Empty">
        <Button
          style={{
            ...EditorLabelControlVisemeButtonStyle,
            marginLeft: '24px',
          }}
          size="small"
          variant="outlined"
          color="info"
          onClick={() => {
            const toBeFilled = [];
            for (
              let i = 0;
              i < Object.keys(ed.labelData.label[track]).length;
              i += 1
            ) {
              if (ed.labelData.label[track][i] === EditorLabelNotLabelled) {
                toBeFilled.push(i);
              }
            }
            if (toBeFilled.length === 0) {
              ed.setBanner(
                '8-tbf',
                'All visemes blocks on this track are already filled.',
                3000
              );
            } else {
              const selec = structuredClone(
                EditorContextDefault.selection
              ) as MutableEditorSelection;
              selec[track] = toBeFilled;
              registerSelectionToSelecto(selec);
              ed.selectAndLabel(selec, visemes.emptyStr);
            }
          }}
        >
          <FormatPaint />
        </Button>
      </Tooltip>
      <Tooltip title="Save">
        <Button
          style={EditorLabelControlVisemeButtonStyle}
          size="small"
          variant="outlined"
          color="error"
          onClick={() => {
            let notFilledCount = 0;
            for (let j = 0; j < EditorLabelTracks.length; j += 1) {
              const t = EditorLabelTracks[j];
              for (let i = 0; i < ed.labelData.timing.length; i += 1) {
                if (ed.labelData.label[t][i] === EditorLabelNotLabelled) {
                  notFilledCount += 1;
                }
              }
            }
            if (notFilledCount === 0) {
              window.electron.ipcRenderer.sendMessage('viseme-save', [
                ctx.items[ctx.currentItemIndex].outputPath,
                ed.labelData.timing,
                ed.labelData.label,
              ]);
              ctx.setCurrentItemCompleted();
              ed.setBanner(
                '9-save',
                `Saved to : ${ctx.items[ctx.currentItemIndex].outputPath}`,
                3000
              );
              ctx.setDoesCurrentItemHasChange(false);
            } else {
              ed.setBanner(
                '9-save',
                `Fill all labels before saving. ${notFilledCount} labels are not filled.`,
                3000
              );
            }
          }}
        >
          <Save />
        </Button>
      </Tooltip>
    </Stack>
  );
};

EditorLabelControl.defaultProps = {
  style: {},
};

export default EditorLabelControl;
