function Content() {
  let currentIndex = 0;
  let textElements: HTMLParagraphElement[] = [];
  let isPlaying = false;

  function getTextElements() {
    return Array.from(document.querySelectorAll('p')).filter(
      el => el.innerText.trim().length > 0
    );
  }

  function playText() {
    if (currentIndex < textElements.length) {
      console.log(currentIndex, textElements[currentIndex].innerText);
      const currentElement = textElements[currentIndex];
      currentElement.style.backgroundColor = 'blue';
      currentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const textToSpeak = currentElement.innerText;
      const utterance = new SpeechSynthesisUtterance(textToSpeak);
      utterance.rate = 1.5;
      utterance.onend = function () {
        currentIndex++;
        playText();
      };
      window.speechSynthesis.speak(utterance);

      currentIndex++;
      isPlaying = true;
    } else {
      isPlaying = false;
    }
  }

  function onClick() {
    if (!isPlaying) {
      textElements = getTextElements();
      currentIndex = 0;
      playText();
    }
  }

  console.log('Content Script Loaded'); // <console>

  return (
    <div>
      <h1>Content Script is Here!</h1>
      <button onClick={onClick}>play</button>
    </div>
  );
}

export default Content;
