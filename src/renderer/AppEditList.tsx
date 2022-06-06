import { useContext } from 'react';
import {
  List,
  ListItem,
  ListItemText,
  ListItemButton,
  ListItemIcon,
} from '@mui/material';
import { Check, MoreHoriz } from '@mui/icons-material';
import GlobalContext from '../context/global';

const EditList = () => {
  const ctx = useContext(GlobalContext);
  return (
    <List>
      <ListItem key="MainHeader">
        <ListItemText
          primary="Labeling Targets"
          primaryTypographyProps={{
            fontWeight: '600',
          }}
        />
      </ListItem>
      {ctx.items.length === 0 && (
        <ListItem key="MainBody">
          <ListItemText primary="No target file found." />
        </ListItem>
      )}
      {ctx.items.map((i, idx) => (
        <ListItem dense key={i.srcFilePath} disablePadding>
          <ListItemButton
            onClick={() => {
              ctx.setCurrentItemIndex(idx);
            }}
            selected={idx === ctx.currentItemIndex}
            dense
          >
            <ListItemIcon>
              {i.isCompleted ? <Check /> : <MoreHoriz />}
            </ListItemIcon>
            <ListItemText
              primary={i.srcFilePath}
              secondary={i.isCompleted ? 'Completed' : 'Not Completed'}
              primaryTypographyProps={{
                style: {
                  wordBreak: 'break-all',
                },
              }}
            />
          </ListItemButton>
        </ListItem>
      ))}
    </List>
  );
};

export default EditList;
