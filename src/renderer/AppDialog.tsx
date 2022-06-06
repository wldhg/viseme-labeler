import { useContext } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  LinearProgress,
  DialogActions,
  Button,
} from '@mui/material';
import DialogContext from '../context/dialog';

const AppDialog = () => {
  const dialog = useContext(DialogContext);

  return (
    <Dialog
      open={dialog.show}
      onClose={() => dialog.setButtonHandler(() => {})}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">{dialog.title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {dialog.content}
        </DialogContentText>
        {dialog.showProgress && <LinearProgress />}
      </DialogContent>
      {dialog.showButtons && (
        <DialogActions>
          <Button onClick={() => dialog.reset()}>Cancel</Button>
          <Button onClick={dialog.buttonHandler}>{dialog.buttonLabel}</Button>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default AppDialog;
