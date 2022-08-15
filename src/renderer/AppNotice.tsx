/* eslint-disable react/no-unescaped-entities */
import { Stack, Typography } from '@mui/material';
import { version } from '../../release/app/package.json';

const AppNotice = () => {
  return (
    <Stack spacing={2} style={{ margin: '12px 0' }}>
      <Typography>VisLab version {version}.</Typography>
      <Typography>
        별도의 보이는 버튼은 없지만, "delete" 버튼을 누르면 선택한 구간의 라벨을
        삭제할 수 있습니다.
      </Typography>
      <Typography>
        별도의 보이는 버튼은 없지만, "ctrl/cmd+z" 버튼을 누르면 실행 취소를 할
        수 있습니다.
      </Typography>
      <Typography>
        별도의 보이는 버튼은 없지만, "ctrl/cmd+y" 버튼을 누르면 다시 실행을 할
        수 있습니다.
      </Typography>
      <Typography>
        별도의 보이는 버튼은 없지만, "," 또는 "." 버튼을 눌러 재생 속도를 0.1배
        빠르거나 느리게 바꿀 수 있습니다.
      </Typography>
    </Stack>
  );
};

export default AppNotice;
