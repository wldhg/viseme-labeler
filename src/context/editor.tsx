/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useState, useRef } from 'react';

export type EditorVideoInfo = {
  readonly duration: number;
  readonly fps: number;
  readonly frames: number;
};

export type EditorLabelData = {
  readonly timing: number[];
  readonly label: number[];
};

export type EditorContextT = {
  readonly videoInfo: EditorVideoInfo;
  setVideoInfo: (videoInfo: EditorVideoInfo) => void;
  readonly labelData: EditorLabelData;
  readonly selection: number[];
  setSelection: (selection: number[]) => void;
  lastLabeled: number;
  label: (viseme: number) => void;
  banner: string;
  setBanner: (bannerCategory: string, banner: string, time?: number) => void;
  isAnalyzed: boolean;
  setIsAnalyzed: (analyzed: boolean) => void;
  selectAndLabel: (selection: number[], viseme: number) => void;
  forceSetLabelData: (timings: number[], label: number[]) => void;
  reset: () => void;
};

const EditorContextDefault: EditorContextT = {
  videoInfo: {
    duration: 0,
    fps: 0,
    frames: 0,
  },
  setVideoInfo: (_videoInfo: EditorVideoInfo) => {},
  labelData: {
    timing: [],
    label: [],
  },
  selection: [],
  setSelection: (_selection: number[]) => {},
  lastLabeled: -1,
  label: (_viseme: number) => {},
  banner: '',
  setBanner: (_bannerCategory: string, _banner: string, _time?: number) => {},
  isAnalyzed: false,
  setIsAnalyzed: (_analyzed: boolean) => {},
  selectAndLabel: (_selection: number[], _viseme: number) => {},
  forceSetLabelData: (_timings: number[], _label: number[]) => {},
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

  const [videoInfo, setVideoInfo] = useState<EditorVideoInfo>({
    duration: 0,
    fps: 0,
    frames: 0,
  });
  const [labelData, setLabelData] = useState<EditorLabelData>({
    timing: [],
    label: [],
  });
  const [selection, setSelection] = useState<number[]>([]);
  const [lastLabeled, setLastLabeled] = useState<number>(-1);
  const [isAnalyzed, setIsAnalyzed] = useState<boolean>(false);
  const [banner, setBannerInternal] = useState<string>('');
  const banners = useRef<{ [key: string]: string }>(defaultBanners);
  const bannerAutoRemoval = useRef<{ [key: string]: NodeJS.Timeout }>({});

  const selectAndLabel = (selec: number[], viseme: number) => {
    setSelection(selec);
    if (selec.length > 0) {
      const maxLabel = Math.max(...selec);
      setLastLabeled(maxLabel);
      const currentLabel = labelData.label;
      selec.forEach((i) => {
        currentLabel[i] = viseme;
      });
      setLabelData({
        timing: labelData.timing,
        label: currentLabel,
      });
    }
  };

  const label = (viseme: number) => {
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
      label: Array<number>(vi.frames).fill(-1),
    });
  };

  const reset = () => {
    setVideoInfo({
      duration: 0,
      fps: 0,
      frames: 0,
    });
    setLabelData({
      timing: [],
      label: [],
    });
    setSelection([]);
    setLastLabeled(-1);
    setIsAnalyzed(false);
    setBannerInternal('');
    banners.current = defaultBanners;
    bannerAutoRemoval.current = {};
    calcBanner();
  };

  const forceSetLabelData = (timings: number[], xlabel: number[]) => {
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
