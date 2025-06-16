import { Hands } from '@mediapipe/hands';
import { Camera } from '@mediapipe/camera_utils';

let isHandOpen = false;

export function getHandStatus() {
  return isHandOpen;
}

function isOpenHand(landmarks) {
  const tipIds = [8, 12, 16, 20]; // index to pinky
  let openCount = 0;

  for (const id of tipIds) {
    if (landmarks[id].y < landmarks[id - 2].y) openCount++;
  }

  return openCount >= 3;
}

export function startHandTracking(videoEl) {
  const hands = new Hands({
    locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
  });

  hands.setOptions({
    maxNumHands: 1,
    modelComplexity: 1,
    minDetectionConfidence: 0.7,
    minTrackingConfidence: 0.7,
  });

  hands.onResults((results) => {
    if (results.multiHandLandmarks.length > 0) {
      isHandOpen = isOpenHand(results.multiHandLandmarks[0]);
    } else {
      isHandOpen = false;
    }
  });

  const camera = new Camera(videoEl, {
    onFrame: async () => await hands.send({ image: videoEl }),
    width: 640,
    height: 480,
  });

  camera.start();
}
