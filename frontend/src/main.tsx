import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { audioEngine } from './audio/AudioEngine'

// One-time global user-gesture audio hardware unlock for iOS Safari and mobile WebKit
const unlockAudioHardware = () => {
  audioEngine.unlockAudio();
  ['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown'].forEach((evt) => {
    window.removeEventListener(evt, unlockAudioHardware);
  });
};

['touchstart', 'touchend', 'pointerdown', 'mousedown', 'keydown'].forEach((evt) => {
  window.addEventListener(evt, unlockAudioHardware, { passive: true, once: true });
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
