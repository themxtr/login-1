import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'

const container = document.getElementById('root');
if (container) {
  console.log('Main: Root element found, mounting React...');
  const root = createRoot(container);
  root.render(<App />);
} else {
  console.error('Main: Root element NOT found!');
}
