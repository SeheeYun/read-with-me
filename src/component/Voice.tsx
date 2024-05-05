import { memo, useState } from 'react';

interface Props {
  selectedVoice: SpeechSynthesisVoice;
  changeVoice: (voice: SpeechSynthesisVoice) => void;
}

const Voice = memo(({ selectedVoice, changeVoice }: Props) => {
  const [isVisible, setIsVisible] = useState(false);
  const voices = window.speechSynthesis.getVoices();

  const toggle = () => {
    setIsVisible(prev => !prev);
  };

  const handleChangeVoice = (voice: SpeechSynthesisVoice) => {
    changeVoice(voice);
    toggle();
  };

  return (
    <div className="voice">
      <button className="button" onClick={toggle}>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          width="20px"
          height="20px"
          style={{ transform: isVisible ? 'rotate(180deg)' : 'rotate(0deg)' }}
        >
          <path
            fillRule="evenodd"
            d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
        <span className="button__text">{selectedVoice.name.slice(0, 2)}</span>
      </button>
      <ul className={`voice_selector ${isVisible ? 'visible' : 'hidden'}`}>
        {voices.map((voice, index) => (
          <li
            className="voice_selector__item"
            key={index}
            onClick={() => handleChangeVoice(voice)}
          >
            <span className="voice_selector__icon">
              {selectedVoice.name === voice.name && (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  width="14px"
                  height="14px"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </span>
            {voice.name} ({voice.lang})
          </li>
        ))}
      </ul>
    </div>
  );
});

export default Voice;
