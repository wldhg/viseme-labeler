/* eslint-disable react/no-unescaped-entities */
import { Stack, Typography } from '@mui/material';
import { version } from '../../release/app/package.json';

const AppNotice = () => {
  return (
    <Stack spacing={2} style={{ margin: '12px 0' }}>
      <Typography>VisLab version {version}.</Typography>
      <hr />
      <Typography variant="h6">
        <strong>단축키로만 사용할 수 있는 기능</strong>
      </Typography>
      <Typography>
        아래는 별도의 보이는 버튼이 없고, 지정된 키 조합을 눌러야 동작하는
        기능입니다.
      </Typography>
      <ul>
        <li>
          <Typography>
            <b>라벨 삭제 : </b>
            편집기에서 프레임 블럭을 선택 후 <kbd>delete</kbd> 키를 누르면 해당
            구간의 라벨을 삭제할 수 있습니다.
          </Typography>
        </li>
        <li>
          <Typography>
            <b>편집 되돌리기 : </b>
            편집기에서 <kbd>ctrl/cmd+z</kbd> 로 되돌리기를,{' '}
            <kbd>ctrl/cmd+y</kbd> 로 되돌리기를 취소할 수 있습니다.
          </Typography>
        </li>
        <li>
          <Typography>
            <b>재생 속도 조절 : </b>
            편집기에서 <kbd>,</kbd> 키로 재생 속도를 낮출 수 있고, <kbd>.</kbd>{' '}
            키로 높일 수 있습니다.
          </Typography>
        </li>
        <li>
          <Typography>
            <b>Waveform 토글 : </b>
            편집기에서 <kbd>`</kbd> (백틱) 키로 Waveform을 보이거나 보이지 않게
            할 수 있습니다.
          </Typography>
        </li>
        <li>
          <Typography>
            <b>Waveform 시작점 좌우 이동 : </b>
            음성 파형이 들리는 소리와 맞지 않으면 파형의 시작점을{' '}
            <kbd>shift+←</kbd> 또는 <kbd>shift+→</kbd> 키로 조정할 수 있습니다.{' '}
            <kbd>shift+0</kbd> 키를 누르면 시작점 오프셋을 초기화합니다.
          </Typography>
        </li>
      </ul>
    </Stack>
  );
};

export default AppNotice;
