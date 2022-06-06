import { useContext } from 'react';
import { Stack } from '@mui/material';
import EditorContext from 'context/editor';

const EditorBanner = () => {
  const ed = useContext(EditorContext);

  return (
    <Stack
      spacing={1}
      direction="row"
      style={{
        fontFamily: 'Inconsolata, monospace',
      }}
    >
      <span>{ed.banner}</span>
    </Stack>
  );
};

export default EditorBanner;
