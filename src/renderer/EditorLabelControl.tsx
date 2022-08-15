import { useContext } from 'react';
import { Stack, Button, Tooltip } from '@mui/material';
import { Save, FormatPaint } from '@mui/icons-material';
import Selecto from 'react-selecto';
import GlobalContext from '../context/global';
import EditorContext, {
  EditorLabelTrack,
  EditorContextDefault,
  MutableEditorSelection,
  EditorLabelIDExp,
  EditorLabelTracks,
  EditorLabelNotLabelled,
} from '../context/editor';
import visemes, { VisemeType } from '../visemes/visemes';

import './EditorLabelControl.scss';

type EditorLabelControlVisemeButtonColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'info'
  | 'error'
  | 'warning';
type EditorLabelControlVisemeButtonVariant = 'outlined' | 'contained';

const EditorLabelControlVisemeButtonStyle = {
  fontFamily: '"Nanum Gothic Coding", monospace',
  minWidth: '30px',
  fontWeight: 800,
  fontSize: '1em',
  padding: '0 8px',
};

const EditorLabelControlVisemeButtonColorMap: {
  [key in VisemeType]: EditorLabelControlVisemeButtonColor;
} = {
  typea: 'primary',
  typeb: 'secondary',
  typec: 'success',
  typed: 'warning',
  unknown: 'warning',
  empty_str: 'info',
  wrong: 'error',
};

const EditorLabelControlVisemeButtonVariantMap: {
  [key in VisemeType]: EditorLabelControlVisemeButtonVariant;
} = {
  typea: 'contained',
  typeb: 'contained',
  typec: 'contained',
  typed: 'contained',
  unknown: 'outlined',
  empty_str: 'outlined',
  wrong: 'outlined',
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

  const getVisemeButtonClickFn = (visemeID: EditorLabelIDExp) => {
    return () => {
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
        ed.selectAndLabel(selec, visemeID);
      } else {
        ctx.setDoesCurrentItemHasChange(true);
        ed.label(visemeID);
      }
    };
  };

  const getClickFunction = (elementID: string) => () => {
    const el = document.getElementById(elementID);
    if (el) {
      el.dispatchEvent(
        new MouseEvent('click', {
          view: window,
          bubbles: true,
          cancelable: true,
          buttons: 1,
        })
      );
      el.classList.add('visemelabelbutton-clicked');
      setTimeout(() => {
        el.classList.remove('visemelabelbutton-clicked');
      }, 500);
    }
  };

  const getVisemeButton = (
    visemeID: EditorLabelIDExp,
    color: EditorLabelControlVisemeButtonColor,
    variant: EditorLabelControlVisemeButtonVariant
  ) => {
    const vbutton = (
      <Button
        key={`visemelabelbutton-${visemeID}`}
        id={`visemelabelbutton-${visemeID}`}
        color={color}
        variant={variant}
        style={EditorLabelControlVisemeButtonStyle}
        size="small"
        onClick={getVisemeButtonClickFn(visemeID)}
      >
        {visemes.def[visemeID].disp}
      </Button>
    );
    if (visemes.def[visemeID].keybind) {
      ctx.setShortcutFunction(
        visemes.def[visemeID].keybind || '!ERROR!',
        getClickFunction(`visemelabelbutton-${visemeID}`)
      );
    }
    if (visemes.def[visemeID].desc || visemes.def[visemeID].keybind) {
      let tooltip = '';
      if (visemes.def[visemeID].desc) {
        tooltip += visemes.def[visemeID].desc;
      }
      if (visemes.def[visemeID].keybind) {
        if (visemes.def[visemeID].keybind_disp) {
          tooltip += ` ("${visemes.def[visemeID].keybind_disp}" key)`;
        } else {
          tooltip += ` ("${visemes.def[visemeID].keybind}" key)`;
        }
      }
      tooltip = tooltip.trim();
      return (
        <Tooltip title={tooltip} key={`visemelabelbutton-tt-${visemeID}`}>
          {vbutton}
        </Tooltip>
      );
    }
    return vbutton;
  };

  ctx.setShortcutFunction('ctrl+f', getClickFunction('visemelabel-fill-empty'));
  ctx.setShortcutFunction('ctrl+s', getClickFunction('visemelabel-save'));
  ctx.setShortcutFunction('delete', () => {
    ctx.setDoesCurrentItemHasChange(true);
    ed.label(EditorLabelNotLabelled);
  });
  ctx.setShortcutFunction('ctrl+z', () => {
    if (ed.undoLabelData()) {
      ctx.setDoesCurrentItemHasChange(true);
      ed.setBanner('8-do', 'Undo successful', 1000);
    } else {
      ed.setBanner('8-do', 'You can not undo anymore', 2000);
    }
  });
  ctx.setShortcutFunction('ctrl+y', () => {
    if (ed.redoLabelData()) {
      ctx.setDoesCurrentItemHasChange(true);
      ed.setBanner('8-do', 'Redo successful', 1000);
    } else {
      ed.setBanner('8-do', 'You can not redo anymore', 2000);
    }
  });

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
      {visemes.allIDs.map((visemeID) => {
        if (visemes.def[visemeID].type.indexOf('type') === -1) {
          return getVisemeButton(
            visemeID,
            EditorLabelControlVisemeButtonColorMap[visemes.def[visemeID].type],
            EditorLabelControlVisemeButtonVariantMap[visemes.def[visemeID].type]
          );
        }
        return null;
      })}
      <Stack spacing={1} direction="column">
        <Stack spacing={1} direction="row">
          {visemes.allIDs.map((visemeID) => {
            if (
              visemes.def[visemeID].type === 'typea' ||
              visemes.def[visemeID].type === 'typeb'
            ) {
              return getVisemeButton(
                visemeID,
                EditorLabelControlVisemeButtonColorMap[
                  visemes.def[visemeID].type
                ],
                EditorLabelControlVisemeButtonVariantMap[
                  visemes.def[visemeID].type
                ]
              );
            }
            return null;
          })}
        </Stack>
        <Stack spacing={1} direction="row">
          {visemes.allIDs.map((visemeID) => {
            if (visemes.def[visemeID].type === 'typec') {
              return getVisemeButton(
                visemeID,
                EditorLabelControlVisemeButtonColorMap[
                  visemes.def[visemeID].type
                ],
                EditorLabelControlVisemeButtonVariantMap[
                  visemes.def[visemeID].type
                ]
              );
            }
            return null;
          })}
        </Stack>
      </Stack>
      <Tooltip title="Fill Empty (ctrl+f key)">
        <Button
          style={{
            ...EditorLabelControlVisemeButtonStyle,
            marginLeft: '24px',
          }}
          id="visemelabel-fill-empty"
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
              ed.selectAndLabel(selec, visemes.emptyStrID);
            }
          }}
        >
          <FormatPaint />
        </Button>
      </Tooltip>
      <Tooltip title="Save (ctrl+s key)">
        <Button
          style={EditorLabelControlVisemeButtonStyle}
          size="small"
          id="visemelabel-save"
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
