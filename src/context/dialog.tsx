/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { createContext, useState } from 'react';
import events from 'events';

export type DialogContextT = {
  readonly showProgress: boolean;
  setShowProgress: (showProgress: boolean) => void;
  readonly showButtons: boolean;
  setShowButtons: (showButtons: boolean) => void;
  readonly buttonLabel: string;
  setButtonLabel: (buttonLabel: string) => void;
  readonly buttonHandler: () => void;
  setButtonHandler: (buttonHandler: () => void) => void;
  readonly content: React.ReactNode | React.ReactNode[];
  setContent: (content: React.ReactNode | React.ReactNode[]) => void;
  readonly title: string;
  setTitle: (title: string) => void;
  readonly show: boolean;
  setShow: (show: boolean) => void;
  reset: () => void;
  once(
    eventName: string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (...args: any[]) => void
  ): events.EventEmitter;
  on(
    eventName: string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (...args: any[]) => void
  ): events.EventEmitter;
};

const DialogContextDefault: DialogContextT = {
  showProgress: false,
  setShowProgress: (_showProgress: boolean) => {},
  showButtons: false,
  setShowButtons: (_showButtons: boolean) => {},
  buttonLabel: '',
  setButtonLabel: (_buttonLabel: string) => {},
  buttonHandler: () => {},
  setButtonHandler: (_buttonHandler: () => void) => {},
  content: '',
  setContent: (_content: React.ReactNode | React.ReactNode[]) => {},
  title: '',
  setTitle: (_title: string) => {},
  show: false,
  setShow: (_show: boolean) => {},
  reset: () => {},
  once: (
    _eventName: string | symbol,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    _listener: (...args: any[]) => void
  ) => new events.EventEmitter(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: (_eventName: string | symbol, _listener: (...args: any[]) => void) =>
    new events.EventEmitter(),
};
const DialogContext = createContext<DialogContextT>(DialogContextDefault);
export default DialogContext;

type DialogContextProps = {
  children: React.ReactNode;
};
export const DialogContextProvider = (props: DialogContextProps) => {
  const { children } = props;

  const [showProgress, setShowProgress] = useState<boolean>(false);
  const [showButtons, setShowButtons] = useState<boolean>(false);
  const [buttonLabel, setButtonLabel] = useState<string>('');
  const [buttonHandler, setButtonHandler] = useState<() => void>(() => {});
  const [content, setContent] = useState<React.ReactNode | React.ReactNode[]>(
    ''
  );
  const [title, setTitle] = useState<string>('');
  const [show, setShow] = useState<boolean>(false);

  const dialogEventEmitter = new events.EventEmitter();

  const setShowWithEvent = (s: boolean) => {
    setShow(s);
    if (s === false) {
      dialogEventEmitter.emit('close');
    }
  };

  const reset = () => {
    dialogEventEmitter.removeAllListeners();
    setShowProgress(false);
    setShowButtons(false);
    setButtonLabel('');
    setButtonHandler(() => {});
    setContent('');
    setTitle('');
    setShow(false);
  };

  return (
    <DialogContext.Provider
      value={{
        showProgress,
        setShowProgress,
        showButtons,
        setShowButtons,
        buttonLabel,
        setButtonLabel,
        buttonHandler,
        setButtonHandler,
        content,
        setContent,
        title,
        setTitle,
        show,
        setShow: setShowWithEvent,
        reset,
        once: dialogEventEmitter.once,
        on: dialogEventEmitter.on,
      }}
    >
      {children}
    </DialogContext.Provider>
  );
};
