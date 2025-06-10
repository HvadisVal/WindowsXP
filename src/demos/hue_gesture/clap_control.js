import * as speechCommands from "@tensorflow-models/speech-commands";
import * as tf from "@tensorflow/tfjs";

let recognizer;
let currentState = null;
let lastCommandTime = 0;
const DEBOUNCE_MS = 1000; // 1 second debounce to prevent rapid toggling
async function initAudioModel(setActionCallback) {
  recognizer = speechCommands.create(
    "BROWSER_FFT",
    null,
    `${window.location.origin}/audio_model/model.json`,
    `${window.location.origin}/audio_model/metadata.json`,
    tf
  );

  //console.log("Loading audio model...", recognizer);
  await recognizer.ensureModelLoaded();

 recognizer.listen(
    (result) => {
      const now = Date.now();
      if (now - lastCommandTime < DEBOUNCE_MS) return;

      const scores = result.scores;
      const words = recognizer.wordLabels();
      const highestScoreIndex = scores.indexOf(Math.max(...scores));
      const word = words[highestScoreIndex].toLowerCase();

      if (word === "one clapp" && currentState !== "on") {
        console.log("🟢 Disco Mode");
        currentState = "on";
        lastCommandTime = now;
        setActionCallback("disco");
      } else if (word === "two clapp" && currentState !== "off") {
        console.log("🔴 Stopping Disco Mode");
        currentState = "off";
        lastCommandTime = now;
        setActionCallback("stopDisco");
      }
    },
    {
      probabilityThreshold: 0.75,
      overlapFactor: 0.5
    }
  );
  return recognizer;
}

function stopAudioModel() {
  if (recognizer && recognizer.isListening()) {
    recognizer.stopListening();
  }
}

export { initAudioModel, stopAudioModel };
