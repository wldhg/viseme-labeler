/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useState, useRef } from 'react';

export type EditorVideoInfo = {
  readonly duration: number;
  readonly fps: number;
  readonly frames: number;
  readonly fpc: number;
};

export type EditorLabelTrack = 0;
export type EditorLabelIndex = number;
export type EditorLabelIDExp = string;

export const EditorLabelTracks: ReadonlyArray<EditorLabelTrack> = [0] as const;

export type MutableEditorSelection = {
  [key in EditorLabelTrack]: EditorLabelIndex[];
};
export type EditorSelection = {
  readonly [key in EditorLabelTrack]: readonly EditorLabelIndex[];
};

export type MutableEditorLabelContent = {
  [key in EditorLabelTrack]: {
    [key: EditorLabelIndex]: EditorLabelIDExp;
  };
};
export type EditorLabelContent = {
  readonly [key in EditorLabelTrack]: {
    readonly [key: EditorLabelIndex]: EditorLabelIDExp;
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
  label: (visemeID: EditorLabelIDExp) => void;
  readonly banner: string;
  setBanner: (bannerCategory: string, banner: string, time?: number) => void;
  readonly isAnalyzed: boolean;
  setIsAnalyzed: (analyzed: boolean) => void;
  selectAndLabel: (
    selection: EditorSelection,
    visemeID: EditorLabelIDExp
  ) => void;
  undoLabelData: () => boolean;
  redoLabelData: () => boolean;
  readonly waveformOffset: number;
  setWaveformOffset: (offset: number) => void;
  readonly waveformVisiblity: boolean;
  setWaveformVisiblity: (visiblity: boolean) => void;
  forceSetLabelData: (timings: number[], labels: EditorLabelContent) => void;
  reset: () => void;
};

export const EditorContextDefault: EditorContextT = {
  videoInfo: {
    duration: 0,
    fps: 0,
    frames: 0,
    fpc: 1.0,
  },
  setVideoInfo: (_videoInfo: EditorVideoInfo) => {},
  labelData: {
    timing: [],
    label: {
      0: {},
    },
  },
  selection: {
    0: [],
  },
  setSelection: (_selection: EditorSelection) => {},
  lastLabeled: {
    0: -1,
  },
  label: (_visemeID: EditorLabelIDExp) => {},
  banner: '',
  setBanner: (_bannerCategory: string, _banner: string, _time?: number) => {},
  isAnalyzed: false,
  setIsAnalyzed: (_analyzed: boolean) => {},
  selectAndLabel: (
    _selection: EditorSelection,
    _visemeID: EditorLabelIDExp
  ) => {},
  undoLabelData: () => false,
  redoLabelData: () => false,
  waveformOffset: 0,
  setWaveformOffset: (_offset: number) => {},
  waveformVisiblity: true,
  setWaveformVisiblity: (_visiblity: boolean) => {},
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
  const [labelDataHistory, setLabelDataHistory] = useState<EditorLabelData[]>(
    []
  );
  const [lastLabeledHistory, setLastLabeledHistory] = useState<
    EditorLabelLastIndex[]
  >([]);
  const [labelDataFuture, setLabelDataFuture] = useState<EditorLabelData[]>([]);
  const [lastLabeledFuture, setLastLabeledFuture] = useState<
    EditorLabelLastIndex[]
  >([]);
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
  const [waveformOffset, setWaveformOffset] = useState<number>(0);
  const [waveformVisiblity, setWaveformVisiblity] = useState<boolean>(true);

  const selectAndLabel = (
    selec: EditorSelection,
    visemeID: EditorLabelIDExp
  ) => {
    const newLabelDataHistory = labelDataHistory.concat([
      JSON.parse(JSON.stringify(labelData)),
    ]);
    if (newLabelDataHistory.length > 50) {
      newLabelDataHistory.shift();
    }
    setLabelDataHistory(newLabelDataHistory);
    const newLastLabeledHistory = lastLabeledHistory.concat([
      JSON.parse(JSON.stringify(lastLabeled)),
    ]);
    if (newLastLabeledHistory.length > 50) {
      newLastLabeledHistory.shift();
    }
    setLastLabeledHistory(newLastLabeledHistory);

    setSelection(selec);

    const ll: MutableEditorLabelLastIndex = lastLabeled;
    const cl: MutableEditorLabelContent = labelData.label;

    EditorLabelTracks.forEach((trackIdx) => {
      if (selec[trackIdx].length > 0) {
        const maxLabel = Math.max(...selec[trackIdx]);
        ll[trackIdx] = maxLabel;
        selec[trackIdx].forEach((i) => {
          cl[trackIdx][i] = visemeID;
        });
      }
    });

    const nl = {
      timing: labelData.timing,
      label: cl,
    };

    setLabelData(nl);
    setLastLabeled(ll);

    setLabelDataFuture([]);
    setLastLabeledFuture([]);
  };

  const label = (visemeID: EditorLabelIDExp) => {
    return selectAndLabel(selection, visemeID);
  };

  const calcBanner = () => {
    if (banners.current) {
      const bannerCategories = Object.keys(banners.current).sort();
      const bc = bannerCategories[bannerCategories.length - 1];
      setBannerInternal(banners.current[bc]);
    }
  };

  const setBanner = (bannerCategory: string, _banner: string, time = 0) => {
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
      } else if (time === -1) {
        if (bannerCategory in banners.current) {
          delete banners.current[bannerCategory];
        }
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
        0: Array<EditorLabelIDExp>(vi.frames).fill(EditorLabelNotLabelled),
      },
    });
    setLastLabeledHistory([]);
    setLabelDataHistory([]);
    setLastLabeledFuture([]);
    setLabelDataFuture([]);
  };

  const reset = () => {
    setVideoInfo(EditorContextDefault.videoInfo);
    setLabelData(EditorContextDefault.labelData);
    setSelection(EditorContextDefault.selection);
    setLastLabeled(EditorContextDefault.lastLabeled);
    setLastLabeledHistory([]);
    setLabelDataHistory([]);
    setLastLabeledFuture([]);
    setLabelDataFuture([]);
    setWaveformOffset(0);
    setWaveformVisiblity(true);
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

  const undoLabelData = () => {
    if (labelDataHistory.length > 0) {
      const last = labelDataHistory.pop();
      if (last) {
        const newLabelDataFuture = labelDataFuture.concat([
          JSON.parse(JSON.stringify(labelData)),
        ]);
        setLabelDataFuture(newLabelDataFuture);
        setLabelData(last);
      }
      const lastL = lastLabeledHistory.pop();
      if (lastL) {
        const newLastLabeledFuture = lastLabeledFuture.concat([
          JSON.parse(JSON.stringify(lastLabeled)),
        ]);
        setLastLabeledFuture(newLastLabeledFuture);
        setLastLabeled(lastL);
      }
      return true;
    }
    return false;
  };

  const redoLabelData = () => {
    if (labelDataFuture.length > 0) {
      const next = labelDataFuture.pop();
      if (next) {
        const newLabelDataHistory = labelDataHistory.concat([
          JSON.parse(JSON.stringify(labelData)),
        ]);
        setLabelDataHistory(newLabelDataHistory);
        setLabelData(next);
      }
      const nextL = lastLabeledFuture.pop();
      if (nextL) {
        const newLastLabeledHistory = lastLabeledHistory.concat([
          JSON.parse(JSON.stringify(lastLabeled)),
        ]);
        setLastLabeledHistory(newLastLabeledHistory);
        setLastLabeled(nextL);
      }
      return true;
    }
    return false;
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
        undoLabelData,
        redoLabelData,
        waveformOffset,
        setWaveformOffset,
        waveformVisiblity,
        setWaveformVisiblity,
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
