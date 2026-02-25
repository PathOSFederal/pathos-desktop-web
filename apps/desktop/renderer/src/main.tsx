import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { DesktopRouter } from './routes';
import './styles.css';

const rootElement = document.getElementById('root');
if (rootElement === null) {
  throw new Error('Root element not found');
}

const root = createRoot(rootElement);
root.render(
  <StrictMode>
    <DesktopRouter />
  </StrictMode>
);
