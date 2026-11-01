import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';

import './styles/styles.css';
import './styles/menu.css';
import './styles/characters.css';
import './styles/arena.css';
import './styles/responsive.css';
import './styles/survival.css';
import './styles/pwa.css';

const rootElement = document.getElementById('root');
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
