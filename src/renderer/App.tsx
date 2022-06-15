import { useContext, useEffect } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import {
  ThemeProvider,
  createTheme,
  Box,
  Drawer,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  Divider,
} from '@mui/material';
import GlobalContext, { GlobalContextProvider } from '../context/global';
import DialogContext, { DialogContextProvider } from '../context/dialog';
import { EditorContextProvider } from '../context/editor';
import { FFMPEGContextProvider } from '../context/ffmpeg';

import './App.scss';
import AppDialog from './AppDialog';
import AppEditList from './AppEditList';
import AppToolbar from './AppToolbar';
import AppHeader from './AppHeader';
import Editor from './Editor';
import AppNotice from './AppNotice';

const drawerWidth = 300;
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});

const AppMain = () => {
  const ctx = useContext(GlobalContext);
  const dialog = useContext(DialogContext);

  useEffect(() => {
    window.electron?.ipcRenderer.on('destroy-ask', () => {
      if (ctx.doesCurrentItemHasChange) {
        dialog.setButtonHandler(() => {
          window.electron.ipcRenderer.sendMessage('destroy-force', []);
        });
        dialog.setTitle('Do you want to close VisLab?');
        dialog.setContent(
          <span>If you close VisLab, you will lose all changes.</span>
        );
        dialog.setButtonLabel('Close VisLab');
        dialog.setShow(true);
      } else {
        window.electron.ipcRenderer.sendMessage('destroy-force', []);
      }
    });
    return () => {
      window.electron?.ipcRenderer.removeAllListeners('destroy-ask');
    };
  }, [ctx.doesCurrentItemHasChange, dialog]);

  let bodyText = 'Please specify a working directory to load target file list.';
  if (ctx.baseDirectoryRead) {
    if (ctx.currentItemIndex < 0) {
      bodyText = 'Select a file at left menu to start processing.';
    } else {
      bodyText = '';
    }
  }

  return (
    <div className="container">
      <Box sx={{ display: 'flex' }}>
        <CssBaseline />
        <AppBar
          position="fixed"
          sx={{
            width: `calc(100% - ${drawerWidth}px)`,
            ml: `${drawerWidth}px`,
          }}
        >
          <Toolbar>
            <AppHeader />
          </Toolbar>
        </AppBar>
        <Drawer
          sx={{
            width: drawerWidth,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
            },
          }}
          variant="permanent"
          anchor="left"
        >
          <AppToolbar />
          <Divider />
          {ctx.baseDirectoryRead && <AppEditList />}
        </Drawer>
        <Box
          component="main"
          sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}
        >
          <Toolbar />
          <EditorContextProvider>
            {ctx.baseDirectoryRead && ctx.currentItemIndex >= 0 ? (
              <Editor />
            ) : (
              <>
                <Typography paragraph>{bodyText}</Typography>
                <Divider />
                <FFMPEGContextProvider>
                  <AppNotice />
                </FFMPEGContextProvider>
                <Divider />
                <Typography paragraph style={{ marginTop: '12px' }}>
                  &copy; 2022 POSTECH AIoT Laboratory.
                </Typography>
              </>
            )}
          </EditorContextProvider>
        </Box>
      </Box>
      <AppDialog />
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/"
          element={
            <GlobalContextProvider>
              <DialogContextProvider>
                <ThemeProvider theme={darkTheme}>
                  <AppMain />
                </ThemeProvider>
              </DialogContextProvider>
            </GlobalContextProvider>
          }
        />
      </Routes>
    </Router>
  );
}
