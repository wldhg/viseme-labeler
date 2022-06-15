/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useState } from 'react';

export type FFMPEGContextT = {
  ffmpegChecked: boolean;
  ffprobeChecked: boolean;
  isCheckedOnce: boolean;
  setChecked: (ffmpeg: boolean, ffprobe: boolean) => void;
};

const FFMPEGContextDefault: FFMPEGContextT = {
  ffmpegChecked: false,
  ffprobeChecked: false,
  isCheckedOnce: false,
  setChecked: (_ffmpeg: boolean, _ffprobe: boolean) => {},
};
const FFMPEGContext = createContext<FFMPEGContextT>(FFMPEGContextDefault);
export default FFMPEGContext;

type FFMPEGContextProps = {
  children: React.ReactNode;
};
export const FFMPEGContextProvider = (props: FFMPEGContextProps) => {
  const { children } = props;

  const [ffmpegChecked, setFfmpegChecked] = useState<boolean>(false);
  const [ffprobeChecked, setFfprobeChecked] = useState<boolean>(false);
  const [isCheckedOnce, setIsCheckedOnce] = useState<boolean>(false);

  const setChecked = (ffmpeg: boolean, ffprobe: boolean) => {
    setFfmpegChecked(ffmpeg);
    setFfprobeChecked(ffprobe);
    setIsCheckedOnce(true);
  };

  return (
    <FFMPEGContext.Provider
      value={{
        ffmpegChecked,
        ffprobeChecked,
        isCheckedOnce,
        setChecked,
      }}
    >
      {children}
    </FFMPEGContext.Provider>
  );
};
