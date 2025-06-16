import { updateStatus, cycleColor } from './common.js';
import { setLightState } from '../../services/hueService';

let lastState = null;

export async function detectColorGesture(landmarks, statusText) {
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  const wrist = landmarks[0];

  const allFolded =
    indexTip[1] > wrist[1] &&
    middleTip[1] > wrist[1] &&
    ringTip[1] > wrist[1] &&
    pinkyTip[1] > wrist[1];

  const isPeaceSign =
    indexTip[1] < wrist[1] &&
    middleTip[1] < wrist[1] &&
    ringTip[1] > wrist[1] + 20 &&
    pinkyTip[1] > wrist[1] + 20 &&
    thumbTip[0] < indexTip[0] && 
    thumbTip[1] > wrist[1];

  if (allFolded) {
    if (thumbTip[1] < wrist[1] && lastState !== 'thumbs_up') {
      lastState = 'thumbs_up';
      updateStatus(statusText, 'Gesture: 👍 → Green');
      await setLightState({ on: true, bri: 254, hue: 25500, sat: 200 });
      setTimeout(() => (lastState = null), 1500);
    } else if (thumbTip[1] > wrist[1] && lastState !== 'thumbs_down') {
      lastState = 'thumbs_down';
      updateStatus(statusText, 'Gesture: 👎 → Red');
      await setLightState({ on: true, bri: 254, hue: 0, sat: 254 });
      setTimeout(() => (lastState = null), 1500);
    }
  } else if (isPeaceSign && lastState !== 'peace_sign') {
    lastState = 'peace_sign';
    updateStatus(statusText, 'Gesture: ✌️ → Blue');
    await cycleColor();
    setTimeout(() => (lastState = null), 1500);
  }
}
