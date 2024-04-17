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

export default function Content() {
  let currentIndex = 0;
  let blocks: HTMLElement[] = [];
  let isPlaying = false;

  const synth = window.speechSynthesis;

  // 1. 중복되지않아야함 - 부모요소가 set에 이미있으면 건너뜀
  // 2. div는 텍스트노드를 포함하는 것들만 추출 - div의 자식노드들을 순회하며 텍스트노드가 있으면 set에 추가
  // 3. header, footer, nav, a, button, aside는 읽지않아야하므로 제외
  function getBlocks() {
    const elements = Array.from(
      document.querySelectorAll('div, h1, h2, h3, p, li')
    );
    const elementsSet = new Set();

    elements.forEach(element => {
      const parent = element.parentNode;
      if (elementsSet.has(parent)) return;

      if (element.textContent?.trim() === '') return;

      if (!isVisible(element)) return;

      if (hasExcludedTag(element)) return;

      const text = element.textContent?.trim();
      if (element.tagName === 'P' && text?.length && text.length < 10) return;

      if (element.tagName !== 'DIV') {
        elementsSet.add(element);
        return;
      }

      element.childNodes.forEach(childNode => {
        if (
          childNode.nodeType === Node.TEXT_NODE &&
          childNode.textContent?.trim() !== ''
        ) {
          elementsSet.add(element);
        }
      });
    });

    return Array.from(elementsSet) as HTMLElement[];
  }

  function playText() {
    if (currentIndex < blocks.length) {
      console.log(currentIndex, blocks[currentIndex].innerText);
      const currentElement = blocks[currentIndex];
      currentElement.style.backgroundColor = 'blue';
      currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      const textToSpeak = currentElement.innerText;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 5;
      utterance.onend = function () {
        currentIndex++;
        playText();
      };
      synth.speak(utterance);
      isPlaying = true;
    } else {
      isPlaying = false;
    }
  }

  const play = () => {
    if (!isPlaying) {
      blocks = getBlocks();
      console.log(blocks);
      currentIndex = 0;
      playText();
    }
  };

  const pause = () => {
    synth.cancel();
    isPlaying = false;
  };

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
