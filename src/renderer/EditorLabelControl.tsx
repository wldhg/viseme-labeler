import { useContext } from 'react';
import { Stack, Button } from '@mui/material';
import Selecto from 'react-selecto';
import GlobalContext from 'context/global';
import EditorContext from 'context/editor';

import _visemes from './visemes.json';

const visemes = _visemes as unknown as Viseme;

type EditorVideoControlProps = {
  currentFrame: number;
  selectoRef: React.RefObject<Selecto>;
  style?: React.CSSProperties;
};

type EditorVideoControlVisemeButtonColor =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'error';
type EditorVideoControlVisemeButtonVariant = 'outlined' | 'contained';

const EditorVideoControlVisemeButtonStyle = {
  fontFamily: 'Inconsolata, monospace',
  minWidth: '30px',
  fontWeight: 800,
  fontSize: '1.2em',
  padding: '0 8px',
};

const EditorLabelControl = (props: EditorVideoControlProps) => {
  const { style, currentFrame, selectoRef } = props;
  const ctx = useContext(GlobalContext);
  const ed = useContext(EditorContext);

  const getVisemeID = (viseme: string) => {
    const isJa = visemes.ja.includes(viseme);
    const baseID = isJa ? visemes.id_begin.ja : visemes.id_begin.mo;
    const immeID = (isJa ? visemes.ja : visemes.mo).indexOf(viseme);
    if (immeID === -1) {
      throw new Error(`Viseme ${viseme} is not found.`);
    }
    const id = baseID + immeID;
    return id;
  };

  const getVisemeButton = (
    viseme: string,
    color: EditorVideoControlVisemeButtonColor,
    variant: EditorVideoControlVisemeButtonVariant
  ) => (
    <Button
      key={`visemelabelbutton-${viseme}`}
      color={color}
      variant={variant}
      style={EditorVideoControlVisemeButtonStyle}
      size="small"
      onClick={() => {
        if (ed.selection.length === 0) {
          const sell = currentFrame - ed.lastLabeled - 1;
          if (sell <= 0) {
            return;
          }
          const selec = Array(sell)
            .fill(0)
            .map((_, i) => {
              return ed.lastLabeled + i + 1;
            });
          ctx.setDoesCurrentItemHasChange(true);
          ed.selectAndLabel(selec, getVisemeID(viseme));
          const newSelected = selec
            .map((it) => {
              const queried = document.querySelector(
                `.visemeblock[data-labelno="${it}"]`
              );
              if (queried) {
                return queried;
              }
              return null;
            })
            .filter(Boolean) as HTMLElement[];
          selectoRef.current?.setSelectedTargets(newSelected);
        } else {
          ctx.setDoesCurrentItemHasChange(true);
          ed.label(getVisemeID(viseme));
        }
      }}
    >
      {viseme}
    </Button>
  );

  return (
    <Stack spacing={1} direction="row" style={style}>
      <span
        style={{
          margin: '4px',
          fontFamily: 'Inconsolata, monospace',
        }}
      >
        Visemes :{' '}
      </span>
      {getVisemeButton(visemes.empty_str, 'primary', 'outlined')}
      {visemes.ja.map((viseme) =>
        getVisemeButton(viseme, 'success', 'contained')
      )}
      {visemes.mo.map((viseme) =>
        getVisemeButton(viseme, 'error', 'contained')
      )}
      <Button
        style={{
          ...EditorVideoControlVisemeButtonStyle,
          marginLeft: '24px',
          padding: '0 24px',
        }}
        size="small"
        variant="outlined"
        color="warning"
        onClick={() => {
          let notFilledCount = 0;
          for (let i = 0; i < ed.labelData.label.length; i += 1) {
            if (ed.labelData.label[i] === -1) {
              notFilledCount += 1;
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
        Save
      </Button>
    </Stack>
  );
};

EditorLabelControl.defaultProps = {
  style: {},
};

export default EditorLabelControl;
