import React from 'react';
import './App.css';

function App() {
  return (
    <div className="text-3xl font-bold underline">
      Hello World
      <button
        onClick={() => {
          chrome.runtime.reload();
        }}
      >
        reload
      </button>
    </div>
  );
}
export default App;
