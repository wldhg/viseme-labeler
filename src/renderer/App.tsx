import { useContext, useEffect, useState } from 'react';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { styled } from '@mui/material/styles';
import {
  ThemeProvider,
  createTheme,
  Box,
  Drawer,
  CssBaseline,
  Toolbar,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import MuiAppBar, { AppBarProps as MuiAppBarProps } from '@mui/material/AppBar';
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import GlobalContext, { GlobalContextProvider } from '../context/global';
import DialogContext, { DialogContextProvider } from '../context/dialog';
import { EditorContextProvider } from '../context/editor';

import './App.scss';
import AppDialog from './AppDialog';
import AppEditList from './AppEditList';
import AppToolbar from './AppToolbar';
import AppHeader from './AppHeader';
import Editor from './Editor';
import AppNotice from './AppNotice';

const drawerWidth = 420;
const darkTheme = createTheme({
  palette: {
    mode: 'dark',
  },
});
const lightTheme = createTheme({
  palette: {
    mode: 'light',
  },
});

interface AppBarProps extends MuiAppBarProps {
  open?: boolean;
}

const AppBar = styled(MuiAppBar, {
  shouldForwardProp: (prop) => prop !== 'open',
})<AppBarProps>(({ theme, open }) => ({
  transition: theme.transitions.create(['margin', 'width'], {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  ...(open && {
    width: `calc(100% - ${drawerWidth}px)`,
    marginLeft: `${drawerWidth}px`,
    transition: theme.transitions.create(['margin', 'width'], {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
  }),
}));

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme, open }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  bgcolor: 'background.default',
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  ...(open && {
    transition: theme.transitions.create('margin', {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: 0,
  }),
}));

const AppMain = () => {
  const ctx = useContext(GlobalContext);
  const dialog = useContext(DialogContext);
  const [open, setOpen] = useState(true);

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

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  return (
    <ThemeProvider theme={ctx.isLightTheme ? lightTheme : darkTheme}>
      <div
        className={`container ${ctx.isLightTheme ? 'light' : 'dark'}-container`}
      >
        <Box sx={{ display: 'flex' }}>
          <CssBaseline />
          <AppBar position="fixed" open={open} className="app-bar">
            <Toolbar>
              <IconButton
                color="inherit"
                aria-label="open drawer"
                onClick={handleDrawerOpen}
                edge="start"
                className="no-appbar-drag"
                sx={{ mr: 2, ...(open && { display: 'none' }) }}
              >
                <MenuIcon />
              </IconButton>
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
            variant="persistent"
            anchor="left"
            open={open}
          >
            <AppToolbar>
              <IconButton onClick={handleDrawerClose}>
                <ChevronLeftIcon />
              </IconButton>
            </AppToolbar>
            <Divider />
            {ctx.baseDirectoryRead && <AppEditList />}
          </Drawer>
          <Main open={open}>
            <Toolbar />
            <EditorContextProvider>
              {ctx.baseDirectoryRead && ctx.currentItemIndex >= 0 ? (
                <Editor />
              ) : (
                <>
                  <Typography paragraph>{bodyText}</Typography>
                  <Divider />
                  <AppNotice />
                  <Divider />
                  <Typography paragraph style={{ marginTop: '12px' }}>
                    &copy; 2022 POSTECH AIoT Laboratory.
                  </Typography>
                </>
              )}
            </EditorContextProvider>
          </Main>
        </Box>
        <AppDialog />
      </div>
    </ThemeProvider>
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
                <AppMain />
              </DialogContextProvider>
            </GlobalContextProvider>
          }
        />
      </Routes>
    </Router>
  );
}
