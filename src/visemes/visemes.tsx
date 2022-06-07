import _visemes from './visemedef.json';

export type VisemeType = 'typea' | 'typeb' | 'typec' | 'typed' | 'empty_str';

export type VisemeTypeMap = {
  readonly [key: string]: VisemeType;
};

const allVisemes = [...Object.keys(_visemes.visemes)] as const;

let emptyStr = 'ERROR!';
allVisemes.forEach((v) => {
  if ((_visemes.visemes as unknown as VisemeTypeMap)[v] === 'empty_str') {
    emptyStr = v;
  }
});

export default {
  emptyStr,
  type: _visemes.visemes as unknown as VisemeTypeMap,
  all: allVisemes,
} as const;
