import './Content.css';

import React from 'react';
import ReactDOM from 'react-dom/client';
import Content from './Content';

const root = document.createElement('div');
root.className = 'read_with_me-controller';
document.body.appendChild(root);
const rootDiv = ReactDOM.createRoot(root);
rootDiv.render(<Content />);
