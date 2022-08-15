import _visemes from './visemedef.json';

export type VisemeType =
  | 'typea'
  | 'typeb'
  | 'typec'
  | 'typed'
  | 'empty_str'
  | 'unknown'
  | 'wrong';

export type VisemeDefMap = {
  readonly [key: string]: {
    type: VisemeType;
    disp: string;
    desc?: string;
    keybind?: string;
    keybind_disp?: string;
    track_disp?: string;
  };
};

export type VisemeTypeDefMap = {
  readonly [key in VisemeType]: {
    disp: string;
  };
};

const allVisemes = [...Object.keys(_visemes.visemes)] as const;

let emptyStrID = 'ERROR!';
let unknownStrID = 'ERROR!';
let wrongStrID = 'ERROR!';
const vismap = _visemes.visemes as unknown as VisemeDefMap;
allVisemes.forEach((v) => {
  if (vismap[v].type === 'empty_str') {
    emptyStrID = v;
  } else if (vismap[v].type === 'unknown') {
    unknownStrID = v;
  } else if (vismap[v].type === 'wrong') {
    wrongStrID = v;
  }
});

export default {
  emptyStrID,
  unknownStrID,
  wrongStrID,
  def: vismap,
  allIDs: allVisemes,
  typeDef: _visemes.types as unknown as VisemeTypeDefMap,
} as const;
