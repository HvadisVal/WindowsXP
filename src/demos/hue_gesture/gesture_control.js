import * as handpose from "@tensorflow-models/handpose";
import "@tensorflow/tfjs-backend-webgl";
import { turnOn, turnOff, setLightState } from "../../services/hueService";
import { detectPowerGesture } from "./power_gestures.js";
import { detectColorGesture } from "./color_gestures.js";
import { initAudioModel, stopAudioModel } from "./clap_control.js";
import { cycleColor } from "./common.js";

// Status Text UI
let statusText = document.createElement("div");
statusText.style.position = "absolute";
statusText.style.top = "55px";
statusText.style.right = "25px";
statusText.style.padding = "10px";
statusText.style.background = "#00000087";
statusText.style.color = "#fff";
statusText.style.fontSize = "16px";
statusText.style.display = "none";
statusText.style.zIndex = "10001";
document.body.appendChild(statusText);

// Toggle Buttons UI
const controlsContainer = document.createElement("div");
controlsContainer.style.position = "absolute";
controlsContainer.style.bottom = "1px";
controlsContainer.style.right = "40px";
controlsContainer.style.display = "flex";
controlsContainer.style.gap = "10px";
controlsContainer.style.zIndex = "1000";
document.body.appendChild(controlsContainer);

// Single mode toggle button
const toggleModeBtn = document.createElement("span");
toggleModeBtn.innerText = "🎤";
toggleModeBtn.style.padding = "5px";
toggleModeBtn.style.background = "#0D8EE9";
toggleModeBtn.style.color = "#fff";
toggleModeBtn.style.border = "none";
toggleModeBtn.style.cursor = "pointer";
controlsContainer.appendChild(toggleModeBtn);

let currentMode = "video";
let discoInterval = null;
let model = await handpose.load();
let animationFrameId = null;

toggleModeBtn.onclick = async () => {
  if (currentMode === "video") {
    currentMode = "audio";
    stopCamera();
    await startAudioMode();
    toggleModeBtn.innerText = "📸";
  } else {
    currentMode = "video";
    stopAudioModel();
    await startVideoMode();
    toggleModeBtn.innerText = "🎤";
  }
};

function stopCamera() {
  const existingWrapper = document.getElementById("video-wrapper");
  if (existingWrapper) {
    existingWrapper.remove();
  }
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
  const existingAudioIcon = document.getElementById("audio-icon");
  if (existingAudioIcon) {
    existingAudioIcon.remove();
  }
}

async function startVideoMode() {
  const existingAudioIcon = document.getElementById("audio-icon");
  if (existingAudioIcon) {
    existingAudioIcon.remove();
  }
  const videoWrapper = document.createElement("div");
  videoWrapper.id = "video-wrapper";
  videoWrapper.style.position = "absolute";
  videoWrapper.style.right = "20px";
  videoWrapper.style.top = "20px";
  videoWrapper.style.width = "566px";
  videoWrapper.style.height = "350px";
  videoWrapper.style.backgroundImage = "url('/assets/webcamwindow.png')";
  videoWrapper.style.backgroundSize = "contain";
  videoWrapper.style.backgroundRepeat = "no-repeat";
  videoWrapper.style.backgroundPosition = "center";
  videoWrapper.style.display = "flex";
  videoWrapper.style.alignItems = "center";
  videoWrapper.style.justifyContent = "center";


  const video = document.createElement("video");
  video.id = "video-feed";
  video.width = 556;
  video.height = 315;
  video.autoplay = true;
  video.style.objectFit = "cover";
  video.style.border = "none";
  video.style.background = "transparent";
  video.style.paddingTop = "26px";
  video.style.transform = "scaleX(-1)";

  videoWrapper.appendChild(video);
  document.body.appendChild(videoWrapper);

  statusText.style.display = "block";
  await setupCamera();
  model = await handpose.load();
  statusText.innerText = "Handpose loaded";

  const runDetection = async () => {
    const predictions = await model.estimateHands(video);
    await detectGesture(predictions);
    animationFrameId = requestAnimationFrame(runDetection);
  };
  runDetection();
}

async function startAudioMode() {
  statusText.style.display = "none";
  const audioIcon = document.createElement("img");
  audioIcon.src = "/icons/Clapping.svg"; 
  audioIcon.id = "audio-icon";
  audioIcon.style.position = "absolute";
  audioIcon.style.top = "5%";
  audioIcon.style.right = "5%";
  audioIcon.style.width = "60px";
  audioIcon.style.height = "60px";
  audioIcon.style.zIndex = "10001";
  document.body.appendChild(audioIcon);
  await initAudioModel(async (action) => {
    if (action === "on") {
      console.log("🟢 Light ON triggered by voice");
      await turnOn();
    } else if (action === "stopDisco") {
      console.log("🛑 Disco mode stopped");
      if (discoInterval) {
        clearInterval(discoInterval);
        discoInterval = null;
      }
      await turnOff();
    } else if (action === "disco") {
      console.log("🌈 Disco mode triggered by voice");
      await turnOn();
      let hue = 0;
      discoInterval = setInterval(async () => {
        hue = (hue + 5000) % 65535;
        await cycleColor(hue);
      }, 300);
    }
  });
}

async function setupCamera() {
  const video = document.getElementById("video-feed");
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
    //await detectColorGesture(landmarks, statusText);
  } else {
    if (statusText) {
      statusText.innerText = "No hand detected";
    }
  }
}
