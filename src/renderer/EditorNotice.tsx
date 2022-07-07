import { Stack } from '@mui/material';

import './EditorNotice.scss';

const EditorNotice = () => {
  return (
    <Stack
      spacing={1}
      style={{
        fontFamily: '"Nanum Gothic Coding", monospace',
        fontSmooth: 'always',
      }}
    >
      <h3 className="exception-title">주의/예외 사항</h3>
      <ul className="exception-class">
        <li>
          <strong>A타입</strong> 자음&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;: ㄴ, ㄷ, ㄸ,
          ㅌ, ㅅ, ㅆ, ㅈ, ㅉ, ㅊ
        </li>
        <li>
          <strong>B타입</strong> 단모음&nbsp;&nbsp;&nbsp;: ㅏ, ㅐ, ㅓ, ㅔ
        </li>
        <li>
          <strong>C타입</strong> 이중모음&nbsp;: ㅑ, ㅒ, ㅕ, ㅖ, ㅘ, ㅙ, ㅚ, ㅝ,
          ㅞ
        </li>
      </ul>
      <ul className="exception-list">
        <li>
          <span>
            [초성] A타입 자음&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;+ [중성] B타입 단모음
          </span>
          &nbsp;&mdash;&nbsp;
          <span className="exception-strong">
            모음 앞에 <i className="unk-btn-mock btn-mock">XX</i> 추가
          </span>
        </li>
        <li>
          <span>[중성] B타입 단모음&nbsp;&nbsp;&nbsp;+ [종성] A타입 자음</span>
          &nbsp;&nbsp;&nbsp;&mdash;&nbsp;
          <span className="exception-strong">
            모음 뒤에 <i className="unk-btn-mock btn-mock">XX</i> 추가
          </span>
        </li>
        <li>
          <span>[중성] C타입 이중모음 + [종성] A타입 자음</span>
          &nbsp;&nbsp;&nbsp;&mdash;&nbsp;
          <span className="exception-strong">
            모음 뒤에 <i className="unk-btn-mock btn-mock">XX</i> 추가
          </span>
        </li>
      </ul>
      <ul className="exception-class">
        <li>
          <span>
            말을 하지 않는데 입이 움직일 때는{' '}
            <i className="wrn-btn-mock btn-mock">오류</i> 로 라벨링
          </span>
        </li>
        <li>
          <span>
            첫 음소가 A타입인 음절의 &apos;ㅢ&apos; 중성은{' '}
            <i className="suc-btn-mock btn-mock">ㅢ[A]</i> 로 라벨링{' '}
          </span>
        </li>
      </ul>
    </Stack>
  );
};

export default EditorNotice;
