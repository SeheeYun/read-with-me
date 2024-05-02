import { memo } from 'react';

interface Props {
  selectedVoice: SpeechSynthesisVoice;
  changeVoice: (voice: SpeechSynthesisVoice) => void;
}

const Voice = memo(({ selectedVoice, changeVoice }: Props) => {
  const voices = window.speechSynthesis.getVoices();

  const handleChangeVoice = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const voice = voices.find(voice => voice.name === e.target.value);
    !!voice && changeVoice(voice);
  };

  return (
    <div className="voice">
      <button className="button arrow">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          width="20px"
          height="20px"
        >
          <path
            fillRule="evenodd"
            d="M11.78 5.22a.75.75 0 0 1 0 1.06L8.06 10l3.72 3.72a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z"
            clipRule="evenodd"
          />
        </svg>
        <span className="button__text">{selectedVoice.name}</span>
      </button>
      <button className="button close">
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
      <div className="voice_selector">
        <select value={selectedVoice.name} onChange={handleChangeVoice}>
          {voices.map((voice, index) => (
            <option key={index} value={voice.name}>
              {voice.name} ({voice.lang})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
});

export default Voice;
