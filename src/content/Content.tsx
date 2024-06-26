import { useCallback, useEffect, useRef, useState } from 'react';
import Speed from '../component/Speed';
import Voice from '../component/Voice';

const EXCLUDED_TAGS = ['FOOTER', 'NAV', 'A', 'BUTTON', 'ASIDE', 'TABLE'];
const TTS_RATE_STORAGE_KEY = 'tts-rate';
const TTS_VOICE_STORAGE_KEY = 'tts-voice';

export default function Content() {
  const currentIndexRef = useRef(0);
  const currSentenceIndexRef = useRef(0);
  const blocksRef = useRef<HTMLElement[]>([]);
  const colorHighlightRef = useRef<Highlight>(new Highlight());
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState<number>();
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice>();
  const [isVisible, setIsVisible] = useState(true);
  const [buttonPosition, setButtonPosition] = useState({
    top: -20,
    left: -20,
    index: 0,
  });

  const synth = window.speechSynthesis;

  const play = () => {
    if (blocksRef.current.length === 0) return;

    // 모든 블록이 끝나면 종료
    if (currentIndexRef.current >= blocksRef.current.length) {
      setIsPlaying(false);
      return;
    }

    const block = blocksRef.current[currentIndexRef.current];

    const sentences = getSentences(block);
    if (!sentences) {
      currentIndexRef.current++;
      play();
      return;
    }

    setIsPlaying(true);
    block.scrollIntoView({ behavior: 'smooth', block: 'center' });
    playSentenceText(sentences);
  };

  const playSentenceText = (sentences: Range[]) => {
    if (!speed || !selectedVoice) return;

    // 모든 문장 재생이 끝나면 다음 블록으로 넘어감
    if (currSentenceIndexRef.current >= sentences.length) {
      currSentenceIndexRef.current = 0;
      currentIndexRef.current++;
      play();
      return;
    }

    const sentence = sentences[currSentenceIndexRef.current];

    colorHighlightRef.current.add(sentence);
    CSS.highlights.set(
      'read-with-me-sentense-highlight',
      colorHighlightRef.current
    );

    const textToSpeak = sentence.toString();
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = speed;
    utterance.voice = selectedVoice;
    utterance.onend = function () {
      colorHighlightRef.current.delete(sentence);
      currSentenceIndexRef.current++;
      playSentenceText(sentences);
    };
    synth.speak(utterance);
  };

  const pause = () => {
    if (synth.speaking) {
      synth.cancel();
      setIsPlaying(false);
      colorHighlightRef.current.clear();
    }
  };

  const toggle = () => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  };

  const reset = () => {
    currentIndexRef.current = 0;
    currSentenceIndexRef.current = 0;
    blocksRef.current = getBlocks();
  };

  const playWithIndex = () => {
    pause();
    currentIndexRef.current = buttonPosition.index;
    currSentenceIndexRef.current = 0;
    play();
  };

  const close = () => {
    pause();
    setIsVisible(false);
  };

  const changeSpeed = useCallback(
    (direction: 'up' | 'down') => {
      if (!speed) return;

      let newSpeed = speed + (direction === 'up' ? 0.2 : -0.2);
      newSpeed = Math.min(newSpeed, 5);
      newSpeed = Math.max(newSpeed, 0.2);

      const rate = Number(newSpeed.toFixed(1));
      chrome.storage.local.set({ [TTS_RATE_STORAGE_KEY]: rate });
      setSpeed(rate);
    },
    [speed]
  );

  const changeVoice = useCallback((voice: SpeechSynthesisVoice) => {
    chrome.storage.local.set({ [TTS_VOICE_STORAGE_KEY]: voice.name });
    setSelectedVoice(voice);
  }, []);

  useEffect(() => {
    blocksRef.current = getBlocks();

    // 정의한 pause()를 쓰면 문장 재생이 다 끝난뒤에 cancel됨
    return () => synth.cancel();
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(request => {
      if (request.message === 'tab_updated') {
        pause();
        setTimeout(() => {
          reset();
        }, 1500);
      }
    });
  }, []);

  useEffect(() => {
    chrome.runtime.onMessage.addListener(request => {
      if (request.message === 'toggle_component') {
        setIsVisible(prev => !prev);
      }
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.get(TTS_RATE_STORAGE_KEY, result => {
      setSpeed(result[TTS_RATE_STORAGE_KEY] || 3);
    });
  }, []);

  useEffect(() => {
    synth.onvoiceschanged = () => {
      const voices = synth.getVoices();
      chrome.storage.local.get(TTS_VOICE_STORAGE_KEY, result => {
        const voice = voices.find(
          voice => voice.name === result[TTS_VOICE_STORAGE_KEY]
        );
        setSelectedVoice(voice || voices[0]);
      });
    };
    return () => {
      synth.onvoiceschanged = null;
    };
  }, []);

  useEffect(() => {
    if (isPlaying) {
      pause();
      play();
    }
  }, [speed, selectedVoice]);

  useEffect(() => {
    const handleMouseOver = (event: MouseEvent) => {
      const element = event.target as HTMLElement;
      if (blocksRef.current.includes(element)) {
        let currentElement = element;
        let totalOffsetTop = 0;
        let totalOffsetLeft = 0;

        while (currentElement) {
          totalOffsetTop += currentElement.offsetTop;
          totalOffsetLeft += currentElement.offsetLeft;
          currentElement = currentElement.offsetParent as HTMLElement;
        }

        setButtonPosition({
          left: totalOffsetLeft - 50,
          top: totalOffsetTop + 6,
          index: blocksRef.current.indexOf(element),
        });
      }
    };

    document.addEventListener('mouseover', handleMouseOver);
    return () => document.removeEventListener('mouseover', handleMouseOver);
  }, []);

  if (!isVisible || !speed || !selectedVoice) return null;

  return (
    <>
      <div className="controller_wrapper">
        <button
          className={`toggle ${isPlaying ? 'pause' : 'play'}`}
          onClick={toggle}
        >
          {isPlaying ? (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="26px"
              height="26px"
            >
              <path
                fillRule="evenodd"
                d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
                clipRule="evenodd"
              />
            </svg>
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 21 24"
              width="26px"
              height="26px"
            >
              <path
                fillRule="evenodd"
                d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                clipRule="evenodd"
              />
            </svg>
          )}
        </button>
        <Speed speed={speed} changeSpeed={changeSpeed} />
        <Voice selectedVoice={selectedVoice} changeVoice={changeVoice} />
        <button className="button close" onClick={close}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            width="20px"
            height="20px"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>

      <div
        className="block_play_button"
        style={{
          transform: `translate(${buttonPosition.left}px, ${buttonPosition.top}px)`,
        }}
      >
        <button className="toggle play button" onClick={playWithIndex}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 21 24"
            width="12px"
            height="12px"
          >
            <path
              fillRule="evenodd"
              d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
              clipRule="evenodd"
            />
          </svg>
        </button>
      </div>
    </>
  );
}

function visible(element: Element): boolean {
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
    if (!visible(element)) return;

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

    // div태그인데 자식노드중에 텍스트를 가진 텍스트노드가 없을 경우 건너뜀
    if (element.tagName === 'DIV') {
      let hasText = false;
      element.childNodes.forEach(childNode => {
        if (
          childNode.nodeType === Node.TEXT_NODE &&
          childNode.textContent?.trim()
        ) {
          hasText = true;
        }
      });
      if (!hasText) return;
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
    if (!firstChild.firstChild) {
      firstChild = firstChild.nextSibling;
      continue;
    }
    firstChild = firstChild.firstChild;
  }

  // 마지막 자식노드가 텍스트노드가 아닐경우 텍스트노드까지 찾아내야함
  let lastChild = block.lastChild;
  while (lastChild && lastChild.nodeType !== Node.TEXT_NODE) {
    if (!lastChild.lastChild) {
      lastChild = lastChild.previousSibling;
      continue;
    }
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
    let childNode = childNodes[offset.childIndex];
    while (childNode.nodeType !== Node.TEXT_NODE) {
      if (childNode.firstChild) {
        childNode = childNode.firstChild;
      }
    }

    if (!childNode) continue;
    if (childNode.textContent && !childNode.textContent[offset.offset]) {
      continue;
    }

    const range = new Range();
    range.setStart(startNode, startOffset);
    range.setEnd(childNode, offset.offset);
    ranges.push(range);
    startNode = childNode;
    startOffset = offset.offset;
  }

  const range = new Range();
  range.setStart(startNode, startOffset);
  range.setEnd(endNode, endOffset);
  ranges.push(range);

  return ranges;
}
