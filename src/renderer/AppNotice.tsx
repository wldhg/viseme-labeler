import { Stack, Typography } from '@mui/material';
import { version } from '../../release/app/package.json';

const AppNotice = () => {
  return (
    <Stack spacing={2} style={{ margin: '12px 0' }}>
      <Typography>VisLab version {version}.</Typography>
    </Stack>
  );
};

export default AppNotice;
