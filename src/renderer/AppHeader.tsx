import { useContext } from 'react';
import { Typography } from '@mui/material';
import GlobalContext from '../context/global';

const AppHeader = () => {
  const ctx = useContext(GlobalContext);

  let header = 'Welcome to VisLab!';
  if (ctx.baseDirectoryRead) {
    if (ctx.currentItemIndex < 0) {
      header = 'Ready to start process.';
    } else {
      header = `📹 ${ctx.items[ctx.currentItemIndex].srcFilePath}`;
    }
  }

  return (
    <Typography variant="h6" noWrap component="div">
      {header}
    </Typography>
  );
};

export default AppHeader;
