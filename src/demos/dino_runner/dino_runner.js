import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import {
  getHandStatus,
  startHandTracking,
} from "../dino_runner/gesture_controller";
import { setLightState } from "../../services/hueService";
import errorSoundFile from "/assets/sound/Windows XP Error.wav";

export async function init(containerId) {
  const container = document.getElementById(containerId);

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.set(0, 3, 7);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
  scene.add(ambientLight);

  const clock = new THREE.Clock();
  let mixer = null;
  let player = null;
  let cactus = null;
  let isRunning = false;
  let isJumping = false;
  let isDead = false;
  let jumpVelocity = 0;
  let score = 0;

  const loader = new GLTFLoader();
  let runAnimation, jumpAnimation, deathAnimation;

  const scoreElement = document.createElement("div");
  scoreElement.style.position = "absolute";
  scoreElement.style.top = "20px";
  scoreElement.style.left = "50%";
  scoreElement.style.transform = "translateX(-50%)";
  scoreElement.style.color = "black";
  scoreElement.style.fontSize = "24px";
  scoreElement.innerText = "Score: 0";
  container.appendChild(scoreElement);

  const idleGLB = await loader.loadAsync("/models/idle.glb");
  const runGLB = await loader.loadAsync("/models/running.glb");
  const jumpGLB = await loader.loadAsync("/models/jumping.glb");
  const deathGLB = await loader.loadAsync("/models/standing death.glb");

  player = idleGLB.scene;
  scene.add(player);
  player.position.set(-3, -1, 0);
  player.rotation.y = Math.PI / 2;

  mixer = new THREE.AnimationMixer(player);
  const idleAction = mixer.clipAction(idleGLB.animations[0]);
  runAnimation = runGLB.animations[0];
  jumpAnimation = jumpGLB.animations[0];
  deathAnimation = deathGLB.animations[0];
  idleAction.play();

  loader.load("/models/cactus.glb", (gltf) => {
    cactus = gltf.scene;
    scene.add(cactus);
    cactus.position.set(10, -2, 0);
    cactus.visible = false;
  });

  const startButton = document.createElement("button");
  startButton.innerText = "Start";
  startButton.style.position = "absolute";
  startButton.style.top = "500px";
  startButton.style.left = "50%";
  startButton.style.transform = "translateX(-50%)";
  startButton.style.padding = "10px 20px";
  startButton.style.fontSize = "1.2rem";
  startButton.style.cursor = "pointer";
  container.appendChild(startButton);

  startButton.addEventListener("click", () => {
    if (!player) return;

    startButton.style.display = "none";
    isRunning = true;

    mixer.stopAllAction();
    const runAction = mixer.clipAction(runAnimation);
    runAction.play();

    cactus.visible = true;
    cactus.position.set(10, -1, 0);
  });

  const video = document.createElement("video");
  video.style.display = "none";
  document.body.appendChild(video);
  startHandTracking(video);

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    if (isRunning && !isDead) {
      if (cactus) {
        cactus.position.x -= delta * 5;

        if (cactus.position.x < -10) {
          cactus.position.x = 10 + Math.random() * 5;
          score++;
          scoreElement.innerText = `Score: ${score}`;
          setLightState({ on: true, bri: 254, hue: 20662, sat: 225 }); // green on
          setTimeout(() => {
            setLightState({ on: false });
          }, 200);
          setTimeout(() => {
            setLightState({ on: true, bri: 254, hue: 20662, sat: 225 });
          }, 400);
          setTimeout(() => {
            setLightState({ on: false });
          }, 600);
        }
      }

      if (!isJumping && getHandStatus()) {
        isJumping = true;
        jumpVelocity = 6;

        mixer.stopAllAction();
        const jumpAction = mixer.clipAction(jumpAnimation);
        jumpAction.setLoop(THREE.LoopOnce);
        jumpAction.clampWhenFinished = true;
        jumpAction.play();
      }

      if (isJumping) {
        player.position.y += jumpVelocity * delta;
        jumpVelocity -= 9.8 * delta;

        const groundY = -1;
        if (player.position.y <= groundY) {
          player.position.y = groundY;
          isJumping = false;

          mixer.stopAllAction();
          const runAction = mixer.clipAction(runAnimation);
          runAction.play();
        }
      }

      if (cactus && player) {
        const playerBox = new THREE.Box3().setFromObject(player);
        const cactusBox = new THREE.Box3().setFromObject(cactus);

        if (playerBox.intersectsBox(cactusBox)) {
          if (!isJumping && !isDead) {
            death();
          }
        }
      }
    }

    renderer.render(scene, camera);
  }
  animate();

  function showGameOverModal(score) {
    const existingModal = document.getElementById('gameOverModal');
    if (existingModal) {
      existingModal.style.display = 'flex';
      document.getElementById('gameOverText').innerText = `Final Score: ${score}`;
      const errorSound = new Audio(errorSoundFile);
      errorSound.play();
      return;
    }

    const modal = document.createElement('div');
    modal.id = 'gameOverModal';
    modal.style.position = 'absolute';
    modal.style.top = '0';
    modal.style.left = '0';
    modal.style.width = '100%';
    modal.style.height = '100%';
    modal.style.background = 'rgba(0,0,0,0.6)';
    modal.style.zIndex = '9999';
    modal.style.display = 'flex';
    modal.style.justifyContent = 'center';
    modal.style.alignItems = 'center';

    const content = document.createElement('div');
    content.id = 'gameOverContent';
    content.style.width = '450px';
    content.style.height = '244px';
    content.style.background = "url('/assets/GameOver.svg') no-repeat center";
    content.style.backgroundSize = 'contain';
    content.style.position = 'relative';
    content.style.color = 'black';
    content.style.fontFamily = 'Arial, sans-serif';

    const text = document.createElement('p');
    text.id = 'gameOverText';
    text.innerText = `Final Score: ${score}`;
    text.style.position = 'absolute';
    text.style.top = '30%';
    text.style.left = '50%';
    text.style.transform = 'translateX(-50%)';
    text.style.fontSize = '22px';

    const button = document.createElement('button');
    button.innerText = 'OK';
    button.onclick = () => window.location.reload();
    button.style.position = 'absolute';
    button.style.bottom = '15%';
    button.style.left = '50%';
    button.style.transform = 'translateX(-50%)';
    button.style.width = '80px';
    button.style.height = '30px';
    button.style.fontSize = '16px';
    button.style.background = '#ccc';
    button.style.border = '2px solid #888';
    button.style.boxShadow = '2px 2px #444';
    button.style.cursor = 'pointer';

    content.appendChild(text);
    content.appendChild(button);
    modal.appendChild(content);
    const errorSound = new Audio(errorSoundFile);
    errorSound.play();
    document.body.appendChild(modal);
  }

  function death() {
    isRunning = false;
    isDead = true;

    mixer.stopAllAction();
    const deathAction = mixer.clipAction(deathAnimation);
    deathAction.setLoop(THREE.LoopOnce);
    deathAction.clampWhenFinished = true;
    deathAction.play();

    setLightState({ on: true, bri: 254, hue: 0, sat: 254 });
    setTimeout(() => {
      setLightState({ on: false }); 
    }, 2000);

    setTimeout(() => {
      showGameOverModal(score);
    }, 2000);
  }

  return {
    dispose() {
      renderer.dispose();
      container.innerHTML = "";
    },
  };
}
