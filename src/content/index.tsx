import React from 'react';
import ReactDOM from 'react-dom/client';
import Content from './Content';

const root = document.createElement('div');
root.className = 'container';
document.body.appendChild(root);
const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(<Content />);
