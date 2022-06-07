/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useState, useRef } from 'react';

export type EditorVideoInfo = {
  readonly duration: number;
  readonly fps: number;
  readonly frames: number;
};

export type EditorLabelTrack = 0 | 1;
export type EditorLabelIndex = number;
export type EditorLabelExp = string;

export const EditorLabelTracks: ReadonlyArray<EditorLabelTrack> = [
  0, 1,
] as const;

export type MutableEditorSelection = {
  [key in EditorLabelTrack]: EditorLabelIndex[];
};
export type EditorSelection = {
  readonly [key in EditorLabelTrack]: readonly EditorLabelIndex[];
};

export type MutableEditorLabelContent = {
  [key in EditorLabelTrack]: {
    [key: EditorLabelIndex]: EditorLabelExp;
  };
};
export type EditorLabelContent = {
  readonly [key in EditorLabelTrack]: {
    readonly [key: EditorLabelIndex]: EditorLabelExp;
  };
};

export type MutableEditorLabelData = {
  timing: number[];
  label: MutableEditorLabelContent;
};
export type EditorLabelData = {
  readonly timing: readonly number[];
  readonly label: EditorLabelContent;
};

export type MutableEditorLabelLastIndex = {
  [key in EditorLabelTrack]: EditorLabelIndex;
};
export type EditorLabelLastIndex = {
  readonly [key in EditorLabelTrack]: EditorLabelIndex;
};

export const EditorLabelNotLabelled = '__not_labelled__';

export type EditorContextT = {
  readonly videoInfo: EditorVideoInfo;
  setVideoInfo: (videoInfo: EditorVideoInfo) => void;
  readonly labelData: EditorLabelData;
  readonly selection: EditorSelection;
  setSelection: (selection: EditorSelection) => void;
  readonly lastLabeled: EditorLabelLastIndex;
  label: (viseme: EditorLabelExp) => void;
  readonly banner: string;
  setBanner: (bannerCategory: string, banner: string, time?: number) => void;
  readonly isAnalyzed: boolean;
  setIsAnalyzed: (analyzed: boolean) => void;
  selectAndLabel: (selection: EditorSelection, viseme: EditorLabelExp) => void;
  forceSetLabelData: (timings: number[], labels: EditorLabelContent) => void;
  reset: () => void;
};

export const EditorContextDefault: EditorContextT = {
  videoInfo: {
    duration: 0,
    fps: 0,
    frames: 0,
  },
  setVideoInfo: (_videoInfo: EditorVideoInfo) => {},
  labelData: {
    timing: [],
    label: {
      0: {},
      1: {},
    },
  },
  selection: {
    0: [],
    1: [],
  },
  setSelection: (_selection: EditorSelection) => {},
  lastLabeled: {
    0: -1,
    1: -1,
  },
  label: (_viseme: EditorLabelExp) => {},
  banner: '',
  setBanner: (_bannerCategory: string, _banner: string, _time?: number) => {},
  isAnalyzed: false,
  setIsAnalyzed: (_analyzed: boolean) => {},
  selectAndLabel: (_selection: EditorSelection, _viseme: EditorLabelExp) => {},
  forceSetLabelData: (_timings: number[], _labels: EditorLabelContent) => {},
  reset: () => {},
};
const EditorContext = createContext<EditorContextT>(EditorContextDefault);
export default EditorContext;

type EditorContextProps = {
  children: React.ReactNode;
};
export const EditorContextProvider = (props: EditorContextProps) => {
  const { children } = props;

  const defaultBanners = {
    '1-select': 'Select frame box(es) to start labeling.',
  };

  const [videoInfo, setVideoInfo] = useState<EditorVideoInfo>(
    EditorContextDefault.videoInfo
  );
  const [labelData, setLabelData] = useState<EditorLabelData>(
    EditorContextDefault.labelData
  );
  const [selection, setSelection] = useState<EditorSelection>(
    EditorContextDefault.selection
  );
  const [lastLabeled, setLastLabeled] = useState<EditorLabelLastIndex>(
    EditorContextDefault.lastLabeled
  );
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);
  const [banner, setBannerInternal] = useState<string>('');
  const banners = useRef<{ [key: string]: string }>(defaultBanners);
  const bannerAutoRemoval = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const selectAndLabel = (selec: EditorSelection, viseme: EditorLabelExp) => {
    setSelection(selec);

    const ll: MutableEditorLabelLastIndex = lastLabeled;
    const cl: MutableEditorLabelContent = labelData.label;

    EditorLabelTracks.forEach((trackIdx) => {
      if (selec[trackIdx].length > 0) {
        const maxLabel = Math.max(...selec[trackIdx]);
        ll[trackIdx] = maxLabel;
        selec[trackIdx].forEach((i) => {
          cl[trackIdx][i] = viseme;
        });
      }
    });

    setLabelData({
      timing: labelData.timing,
      label: cl,
    });
    setLastLabeled(ll);
  };

  const label = (viseme: EditorLabelExp) => {
    return selectAndLabel(selection, viseme);
  };

  const calcBanner = () => {
    if (banners.current) {
      const bannerCategories = Object.keys(banners.current).sort();
      const bc = bannerCategories[bannerCategories.length - 1];
      setBannerInternal(banners.current[bc]);
    }
  };

  const setBanner = (bannerCategory: string, _banner: string, time = -1) => {
    if (banners.current && bannerAutoRemoval.current) {
      if (bannerAutoRemoval.current[bannerCategory]) {
        clearTimeout(bannerAutoRemoval.current[bannerCategory]);
      }
      banners.current[bannerCategory] = _banner;
      if (time > 0) {
        bannerAutoRemoval.current[bannerCategory] = setTimeout(() => {
          delete banners.current[bannerCategory];
          calcBanner();
        }, time);
      }
      calcBanner();
    }
  };

  const setVideoInfoWithTimings = (vi: EditorVideoInfo) => {
    setVideoInfo(vi);
    setLabelData({
      timing: Array<number>(vi.frames)
        .fill(0)
        .map((_, i) => i * (1 / vi.fps)),
      label: {
        0: Array<EditorLabelExp>(vi.frames).fill(EditorLabelNotLabelled),
        1: Array<EditorLabelExp>(vi.frames).fill(EditorLabelNotLabelled),
      },
    });
  };

  const reset = () => {
    setVideoInfo(EditorContextDefault.videoInfo);
    setLabelData(EditorContextDefault.labelData);
    setSelection(EditorContextDefault.selection);
    setLastLabeled(EditorContextDefault.lastLabeled);
    setIsAnalyzed(false);
    setBannerInternal('');
    banners.current = defaultBanners;
    bannerAutoRemoval.current = {};
    calcBanner();
  };

  const forceSetLabelData = (timings: number[], xlabel: EditorLabelContent) => {
    setLabelData({
      timing: timings,
      label: xlabel,
    });
  };

  return (
    <EditorContext.Provider
      value={{
        videoInfo,
        setVideoInfo: setVideoInfoWithTimings,
        labelData,
        selection,
        setSelection,
        lastLabeled,
        label,
        banner,
        setBanner,
        isAnalyzed,
        setIsAnalyzed,
        selectAndLabel,
        forceSetLabelData,
        reset,
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};
