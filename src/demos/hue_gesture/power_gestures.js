import { turnOn, turnOff } from "../../services/hueService";

let lastState = null;

export async function detectPowerGesture(landmarks, statusText) {
  const wrist = landmarks[0];
  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const allExtended =
    indexTip[1] < wrist[1] &&
    middleTip[1] < wrist[1] &&
    ringTip[1] < wrist[1] &&
    pinkyTip[1] < wrist[1] &&
    thumbTip[1] < wrist[1];

  const isClosedPalm =
    indexTip[1] > wrist[1] - 10 &&
    middleTip[1] > wrist[1] - 10 &&
    ringTip[1] > wrist[1] - 10 &&
    pinkyTip[1] > wrist[1] - 10 &&
    thumbTip[1] > wrist[1] - 10;
    
  if (allExtended && lastState !== "open_palm") {
    lastState = "open_palm";
    statusText.innerText = "✋ Open Palm → Light ON (White)";
    await turnOn();
    setTimeout(() => (lastState = null), 1500);
  }

  if (isClosedPalm && lastState !== "closed_palm") {
    lastState = "closed_palm";
    statusText.innerText = "✊ Closed Palm → Light OFF";
    await turnOff();
    setTimeout(() => (lastState = null), 1500);
  }
}
