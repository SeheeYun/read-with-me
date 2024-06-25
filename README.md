# Read With Me

<img alt="gif" src="https://github.com/SeheeYun/read-with-me/assets/77285472/6a810087-93b0-4389-b12f-e5743b3da128">

웹페이지의 본문 텍스트를 추출하여 TTS로 재생하는 크롬 확장프로그램입니다. [링크](https://chromewebstore.google.com/detail/read-with-me/faldnhgdjcliknmlnncabndhobjigcel)

## Features

- 본문 내용 추출
- 텍스트 음성변환
- 발화 속도, 발화 음성 변경
- storage 설정 저장
- UI가 깨지지않는 텍스트 하이라이트
- 사이드에 표시되는 버튼으로 원하는 위치에서부터 재생

## Tech Stack

- React
- Typescript
- Chrome Extensions API
- Web API (SpeechSynthesis, Range, HighlightRegistry)
- Shadow DOM

## 주요 기능 구현사항

### 본문 내용 음성 변환 (TTS)

<img alt="tts-flow" src="https://github.com/SeheeYun/read-with-me/assets/77285472/76873fd9-f963-4a6e-a872-8fa02d488d3e">
웹페이지내의 요소들을 시맨틱 태그로 구분해서 읽을거리인 본문 내용을 추출하고 본문을 각 문단(block)으로 나누고 문단을 다시 문장(sentence)으로 나눠서 순서대로 재생. 모든 문장 재생이 완료되면 종료된다.

### 문장 하이라이트 (Range / Highlight API)

현재 재생중인 문장이 하이라이트되는 기능을 구현하려는데 요소를 기준으로 문장을 나누지않고 마침표를 기준으로 나눴기때문에 단순히 요소에 style을 적용하는 방법으로는 구현할 수 없었고 요소들을 별도의 태그로 감싸서 style을 적용하게되면 기존 페이지의 UI가 깨지는 경우가 생기기때문에 이 방법도 사용할 수 없었다.

DOM 구조에 영향을 주지않고 원하는 범위에만 style을 적용시킬 수 있는 방법을 생각하다가 웹페이지를 드래그 했을 때 드래그한 부분에만 style이 적용되는 가상요소 ::selection을 이용하면되겠다싶었고 ::selection과 동일하게 특정 부분에 style을 적용할 수 있고 그 범위를 직접 지정할 수 있는 ::highlight 가상요소를 알게되어 이것을 이용해서 구현했다.

Range 객체로 범위를 만들고 범위에대한 Higtlight 객체를 만들어서 등록한 뒤 등록된 Higtlight에 style을 적용하기만 하면되는데 요소내의 특정 문자로 범위를 지정하려면 text node를 인자로해서 범위를 지정해야한다. 때문에 여러 자식요소들이 겹쳐있는 중첩된 요소일 경우 요소를 순회하며 정확한 text node를 찾아내는 로직이 필요하다.

```typescript
let childNode = childNodes[offset.childIndex];
while (childNode.nodeType !== Node.TEXT_NODE) {
  if (childNode.firstChild) {
    childNode = childNode.firstChild;
  }
}

const range = new Range();
range.setStart(startNode, startOffset);
range.setEnd(childNode, offset.offset);
```

> 범위를 설정하는 함수인 `setStart`, `setEnd`는 첫번째 인자인 node의 타입에따라 두번째 인자인 offset의 값의 정의가 달라진다.
> 첫번째 인자 node가 element node일 경우 offset은 해당 node의 childNodes 중 몇번째 childNode인지를 나타내는 값이되고 node가 text node일 경우엔 해당 text node에서 몇번째 순서의 글자인지를 나타낸다.
