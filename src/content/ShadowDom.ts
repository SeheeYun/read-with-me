import React, { useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';

export function ShadowDom({ children }: { children: React.ReactNode }) {
  const shadowHost = document.createElement('read-with-me-shadow-host');
  const shadowRoot = shadowHost.attachShadow({ mode: 'open' });

  useLayoutEffect(() => {
    const parentElement = document.querySelector('body');
    if (parentElement) {
      parentElement.appendChild(shadowHost);
    }

    return () => {
      shadowHost.remove();
    };
  }, []);

  return ReactDOM.createPortal(children, shadowRoot);
}
