import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
// Initializes Firebase and, where supported, Google Analytics (page_view etc.).
import './integrations/firebase/config'

createRoot(document.getElementById("root")!).render(<App />);
