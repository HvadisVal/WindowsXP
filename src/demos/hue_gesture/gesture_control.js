import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs-backend-webgl";
import { turnOn, turnOff, setLightState } from "../../services/hueService";
import { detectPowerGesture } from "./power_gestures.js";
import { detectColorGesture } from "./color_gestures.js";
import { initAudioModel, stopAudioModel } from "./clap_control.js";

const video = document.createElement("video");
video.style.position = "fixed";
video.style.right = "0";
video.style.top = "0";
video.width = 640;
video.height = 480;
video.autoplay = true;
document.body.appendChild(video);

let videoEnabled = false;
let statusText = document.createElement("div");
statusText.style.position = "fixed";
statusText.style.top = "10px";
statusText.style.right = "10px";
statusText.style.padding = "10px";
statusText.style.background = "#000";
statusText.style.color = "#fff";
statusText.style.fontSize = "16px";
statusText.style.display = "none"; // Hide by default
document.body.appendChild(statusText);

// 🔘 Toggle Buttons UI
const controlsContainer = document.createElement("div");
controlsContainer.style.position = "fixed";
controlsContainer.style.top = "10px";
controlsContainer.style.right = "10px";
controlsContainer.style.display = "flex";
controlsContainer.style.gap = "10px";
controlsContainer.style.zIndex = "1000";
document.body.appendChild(controlsContainer);

// Single mode toggle button
const toggleModeBtn = document.createElement("button");
toggleModeBtn.innerText = "🎛️ Start";
toggleModeBtn.style.padding = "10px";
toggleModeBtn.style.background = "#444";
toggleModeBtn.style.color = "#fff";
toggleModeBtn.style.border = "none";
toggleModeBtn.style.cursor = "pointer";
controlsContainer.appendChild(toggleModeBtn);

let audioModelActive = false;
let recognizerInstance = null;
let lastState = null;
let model = await handpose.load();
let animationFrameId = null;

toggleModeBtn.onclick = async () => {
  audioModelActive = !audioModelActive;
  if (audioModelActive) {
    // Stop camera
    videoEnabled = false;
    if (video.srcObject) {
      video.srcObject.getTracks().forEach((track) => track.stop());
      video.srcObject = null;
    }
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    statusText.style.display = "block";
    toggleModeBtn.innerText = "🎤 Audio";

    recognizerInstance = await initAudioModel(async (action) => {
      if (action === "on" || action === "on-white") {
        console.log("🟢 Light ON triggered by voice");
        await turnOn();
        if (action === "on-white") {
          await setLightState({
            on: true,
            bri: 254,
            hue: 0,
            sat: 0,
            colormode: "hs",
          });
        }
      } else if (action === "off") {
        console.log("🔴 Light OFF triggered by voice");
        await turnOff();
      }
    });
  } else {
    // Stop audio
    stopAudioModel();
    console.log("🎤 Audio recognizer stopped");

    // Start camera
    await setupCamera();
    model = await handpose.load();
    statusText.style.display = "block";
    statusText.innerText = "Handpose loaded";
    toggleModeBtn.innerText = "📸 Video";

    const runDetection = async () => {
      const predictions = await model.estimateHands(video);
      await detectGesture(predictions);
      animationFrameId = requestAnimationFrame(runDetection);
    };
    runDetection();
  }
};

async function setupCamera() {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: false,
  });
  video.srcObject = stream;
  await new Promise((resolve) => {
    video.onloadedmetadata = () => {
      resolve(video);
    };
  });
}

async function detectGesture(predictions) {
  if (predictions.length > 0) {
    const landmarks = predictions[0].landmarks;
    await detectPowerGesture(landmarks, statusText);
    await detectColorGesture(landmarks, statusText);
  } else {
    if (statusText) {
      statusText.innerText = "No hand detected";
    }
  }
}

async function main() {
  statusText.style.display = "block";
  statusText.innerText = "Loading handpose...";

  await setupCamera();
  model = await handpose.load();
  if (statusText) {
    statusText.innerText = "Handpose loaded";
  }

  const runDetection = async () => {
    const predictions = await model.estimateHands(video);
    await detectGesture(predictions);
    animationFrameId = requestAnimationFrame(runDetection);
  };

  runDetection();
}
