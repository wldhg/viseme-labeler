/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useState } from 'react';

export type GlobalContextItem = {
  srcFilePath: string;
  outputPath: string;
  isCompleted: boolean;
};

export type GlobalContextT = {
  readonly items: GlobalContextItem[];
  setItems: (items: GlobalContextItem[]) => void;
  readonly currentItemIndex: number;
  setCurrentItemIndex: (currentItemIndex: number) => void;
  readonly convertTargetPaths: string[];
  setConvertTargetPaths: (convertTargetPaths: string[]) => void;
  readonly doesCurrentItemHasChange: boolean;
  setDoesCurrentItemHasChange: (doesCurrentItemHasChange: boolean) => void;
  readonly baseDirectoryPath: string;
  setBaseDirectoryPath: (baseDirectoryPath: string) => void;
  readonly baseDirectoryRead: boolean;
  setBaseDirectoryRead: (baseDirectoryRead: boolean) => void;
  setCurrentItemCompleted: () => void;
  readonly isLightTheme: boolean;
  toggleTheme: () => void;
  reset: () => void;
};

const GlobalContextDefault: GlobalContextT = {
  items: [],
  setItems: (_items: GlobalContextItem[]) => {},
  currentItemIndex: -1,
  setCurrentItemIndex: (_currentItemIndex: number) => {},
  convertTargetPaths: [],
  setConvertTargetPaths: (_convertTargetPaths: string[]) => {},
  doesCurrentItemHasChange: false,
  setDoesCurrentItemHasChange: (_doesCurrentItemHasChange: boolean) => {},
  baseDirectoryPath: '',
  setBaseDirectoryPath: (_baseDirectoryPath: string) => {},
  baseDirectoryRead: false,
  setBaseDirectoryRead: (_baseDirectoryRead: boolean) => {},
  setCurrentItemCompleted: () => {},
  isLightTheme: false,
  toggleTheme: () => {},
  reset: () => {},
};
const GlobalContext = createContext<GlobalContextT>(GlobalContextDefault);
export default GlobalContext;

type GlobalContextProps = {
  children: React.ReactNode;
};
export const GlobalContextProvider = (props: GlobalContextProps) => {
  const { children } = props;

  const [items, setItems] = useState<GlobalContextItem[]>([]);
  const [currentItemIndex, setCurrentItemIndex] = useState<number>(-1);
  const [doesCurrentItemHasChange, setDoesCurrentItemHasChange] =
    useState<boolean>(false);
  const [baseDirectoryPath, setBaseDirectoryPath] = useState<string>('');
  const [baseDirectoryRead, setBaseDirectoryRead] = useState<boolean>(false);
  const [convertTargetPaths, setConvertTargetPaths] = useState<string[]>([]);
  const [isLightTheme, setIsLightTheme] = useState<boolean>(false);

  const reset = () => {
    setItems([]);
    setCurrentItemIndex(-1);
    setDoesCurrentItemHasChange(false);
    setBaseDirectoryPath('');
    setBaseDirectoryRead(false);
    setConvertTargetPaths([]);
  };

  const setCurrentItemCompleted = () => {
    const xitems = items;
    xitems[currentItemIndex].isCompleted = true;
    setItems(xitems);
  };

  const toggleTheme = () => {
    setIsLightTheme(!isLightTheme);
  };

  return (
    <GlobalContext.Provider
      value={{
        items,
        setItems,
        currentItemIndex,
        setCurrentItemIndex,
        doesCurrentItemHasChange,
        setDoesCurrentItemHasChange,
        baseDirectoryPath,
        setBaseDirectoryPath,
        baseDirectoryRead,
        setBaseDirectoryRead,
        convertTargetPaths,
        setConvertTargetPaths,
        setCurrentItemCompleted,
        isLightTheme,
        toggleTheme,
        reset,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};
