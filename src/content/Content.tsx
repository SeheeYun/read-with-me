import { useEffect, useRef } from 'react';

const EXCLUDED_TAGS = ['HEADER', 'FOOTER', 'NAV', 'A', 'BUTTON', 'ASIDE'];

function isVisible(element: Element): boolean {
  let currentElement = element;
  while (currentElement) {
    const styles = window.getComputedStyle(currentElement);
    if (styles.display === 'none' || styles.visibility === 'hidden') {
      return false;
    }
    currentElement = currentElement.parentElement as Element;
  }
  return true;
}

function hasExcludedTag(element: Element) {
  let parentNode = element.parentNode as Element;
  while (parentNode) {
    if (EXCLUDED_TAGS.includes(parentNode.tagName)) {
      return true;
    }
    parentNode = parentNode.parentNode as Element;
  }
  return false;
}

// 1. 중복되지않아야함 - 부모요소가 set에 이미있으면 건너뜀
// 2. div는 텍스트노드를 포함하는 것들만 추출 - div의 자식노드들을 순회하며 텍스트노드가 있으면 set에 추가
// 3. header, footer, nav, a, button, aside는 읽지않아야하므로 제외
function getBlocks() {
  console.log('run getBlocks!');
  const elements = Array.from(
    document.querySelectorAll('div, h1, h2, h3, h4, h5, h6, p, li')
  );
  const elementsSet = new Set();

  elements.forEach(element => {
    // 부모요소가 이미 set에 있으면 건너뜀
    const parent = element.parentNode;
    if (elementsSet.has(parent)) return;

    // 텍스트가 없는 요소는 건너뜀
    if (element.textContent?.trim() === '') return;

    // 보이지 않는 요소는 건너뜀
    if (!isVisible(element)) return;

    // 제외할 태그는 건너뜀
    if (hasExcludedTag(element)) return;

    // p태그나 div태그인데 텍스트가 10자 이하면 건너뜀
    const text = element.textContent?.trim();
    if (
      (element.tagName === 'P' || element.tagName === 'DIV') &&
      text?.length &&
      text.length < 10
    )
      return;

    // div태그인데 텍스트노드가 firstChild가 아니면 건너뜀
    if (element.tagName === 'DIV') {
      if (element.firstChild?.nodeType !== Node.TEXT_NODE) return;
    }

    elementsSet.add(element);
  });

  return Array.from(elementsSet) as HTMLElement[];
}

type Offset = {
  childIndex: number;
  offset: number;
};

function getSentences(block: HTMLElement) {
  // 첫번째 자식노드가 텍스트노드가 아닐경우 텍스트노드까지 찾아내야함
  let firstChild = block.firstChild;
  while (firstChild && firstChild.nodeType !== Node.TEXT_NODE) {
    firstChild = firstChild.firstChild;
  }

  // 마지막 자식노드가 텍스트노드가 아닐경우 텍스트노드까지 찾아내야함
  let lastChild = block.lastChild;
  while (lastChild && lastChild.nodeType !== Node.TEXT_NODE) {
    lastChild = lastChild.lastChild;
  }

  let startNode = firstChild;
  let endNode = lastChild;

  if (!startNode || !endNode) return;

  const childNodes = block.childNodes;
  const offsets: Offset[] = [];

  for (let i = 0; i < childNodes.length; i++) {
    const text = childNodes[i].textContent;
    if (text?.includes('. ')) {
      const sentences = text.split('. ');
      for (let j = 0; j < sentences.length; j++) {
        const offset = text.indexOf(sentences[j]);
        offsets.push({ childIndex: i, offset });
      }
    }
  }

  const ranges = [];

  let startOffset = 0;
  let endOffset = endNode.textContent?.length || 0;

  for (let i = 0; i < offsets.length; i++) {
    const offset = offsets[i];
    const range = new Range();
    range.setStart(startNode, startOffset);
    range.setEnd(childNodes[offset.childIndex], offset.offset);
    ranges.push(range);
    startNode = childNodes[offset.childIndex];
    startOffset = offset.offset;
  }

  const range = new Range();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  ranges.push(range);

  return ranges;
}

export default function Content() {
  let currentIndex = 0;
  let currSentenceIndex = 0;
  const blocksRef = useRef<HTMLElement[]>([]);
  let isPlaying = false;

  const colorHighlight = new Highlight();
  const synth = window.speechSynthesis;

  // 1. 재생을 누르면 해당 블록을 포커싱
  // 2. 블록에서 문장 Ranges를 구함
  // 3. 문장을 tts로 순차적으로 재생
  // 4. 모든 문장을 다 읽었으면 다음 블록으로 넘어감
  const playText = () => {
    if (currentIndex >= blocksRef.current.length) {
      isPlaying = false;
      return;
    }

    const block = blocksRef.current[currentIndex];
    block.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const sentences = getSentences(block);
    if (!sentences) {
      currentIndex++;
      playText();
      return;
    }

    isPlaying = true;
    playSentenceText(sentences);
  };

  const playSentenceText = (sentences: Range[]) => {
    if (currSentenceIndex >= sentences.length) {
      // 다음 블록으로 넘어감
      currSentenceIndex = 0;
      currentIndex++;
      playText();
      return;
    }

    const sentence = sentences[currSentenceIndex];
    console.log('range text', sentence.toString());

    colorHighlight.add(sentence);
    CSS.highlights.set('read-with-me-sentense-highlight', colorHighlight);

    const textToSpeak = sentence.toString();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 2;
    utterance.onend = function () {
      colorHighlight.delete(sentence);
      currSentenceIndex++;
      playSentenceText(sentences);
    };
    synth.speak(utterance);
  };

  const play = () => {
    if (!isPlaying) {
      playText();
    }
  };

  const pause = () => {
    if (synth.speaking) {
      synth.cancel();
      isPlaying = false;
    }
  };

  const setBlocks = () => {
    pause();
    currentIndex = 0;
    blocksRef.current = getBlocks();
    console.log(blocksRef.current);
  };

  useEffect(() => {
    console.log('fist setBlocks!');
    setBlocks();
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(function (request) {
      if (request.message === 'tab_updated') {
        console.log('tab updated! and setBlocks!');
        setBlocks();
      }
    });
  }, []);

  return (
    <div className="read-with-me__controller">
      <button className="read-with-me__button" onClick={play}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="24"
          height="24"
        >
          <path
            fillRule="evenodd"
            d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      <button className="read-with-me__button" onClick={pause}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="currentColor"
          width="24"
          height="24"
        >
          <path
            fillRule="evenodd"
            d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </div>
  );
}
