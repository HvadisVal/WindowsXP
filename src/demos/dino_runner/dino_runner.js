import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

export async function init(containerId) {
  const container = document.getElementById(containerId);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x222222);

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
  camera.position.set(0, 3, 7);
  camera.lookAt(0, 1, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
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

  // Animations
  let runAnimation, jumpAnimation, deathAnimation;

  // Score Display
  const scoreElement = document.createElement('div');
  scoreElement.style.position = 'absolute';
  scoreElement.style.top = '20px';
  scoreElement.style.left = '20px';
  scoreElement.style.color = 'white';
  scoreElement.style.fontSize = '24px';
  scoreElement.innerText = 'Score: 0';
  container.appendChild(scoreElement);

  // Preload all GLBs
  const idleGLB = await loader.loadAsync('/models/idle.glb');
  const runGLB = await loader.loadAsync('/models/running.glb');
  const jumpGLB = await loader.loadAsync('/models/jumping.glb');
  const deathGLB = await loader.loadAsync('/models/standing death.glb');

  // Setup player
  player = idleGLB.scene;
  scene.add(player);
  player.position.set(-3, 0, 0);
  player.rotation.y = Math.PI / 2;

  mixer = new THREE.AnimationMixer(player);
  const idleAction = mixer.clipAction(idleGLB.animations[0]);
  runAnimation = runGLB.animations[0];
  jumpAnimation = jumpGLB.animations[0];
  deathAnimation = deathGLB.animations[0];

  idleAction.play();

  // Load cactus
  loader.load('/assets/models/cactus.glb', (gltf) => {
    cactus = gltf.scene;
    scene.add(cactus);
    cactus.position.set(10, 0, 0);
    cactus.visible = false;
  });

  // Start Button
  const startButton = document.createElement('button');
  startButton.innerText = 'Start';
  startButton.style.position = 'absolute';
  startButton.style.top = '500px';
  startButton.style.left = '50%';
  startButton.style.transform = 'translateX(-50%)';
  startButton.style.padding = '10px 20px';
  startButton.style.fontSize = '1.2rem';
  startButton.style.cursor = 'pointer';
  container.appendChild(startButton);

  startButton.addEventListener('click', () => {
    if (!player) return;

    startButton.style.display = 'none';
    isRunning = true;

    mixer.stopAllAction();
    const runAction = mixer.clipAction(runAnimation);
    runAction.play();

    cactus.visible = true;
    cactus.position.set(10, 0, 0);
  });

  function animate() {
    requestAnimationFrame(animate);

    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);

    if (isRunning && !isDead) {
      if (cactus) {
        cactus.position.x -= delta * 5;

        if (!isJumping && cactus.position.x < 2 && cactus.position.x > 0) {
          isJumping = true;
          jumpVelocity = 6;

          // Switch to jumping animation
          mixer.stopAllAction();
          const jumpAction = mixer.clipAction(jumpAnimation);
          jumpAction.setLoop(THREE.LoopOnce);
          jumpAction.clampWhenFinished = true;
          jumpAction.play();
        }

        if (cactus.position.x < -10) {
          cactus.position.x = 10 + Math.random() * 5;

          score++;
          scoreElement.innerText = `Score: ${score}`;
        }
      }

      if (isJumping) {
        player.position.y += jumpVelocity * delta;
        jumpVelocity -= 9.8 * delta;

        if (player.position.y <= 0) {
          player.position.y = 0;
          isJumping = false;

          // Switch back to running animation
          mixer.stopAllAction();
          const runAction = mixer.clipAction(runAnimation);
          runAction.play();
        }
      }

      // Check collision
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

  function death() {
    isRunning = false;
    isDead = true;

    // Play death animation
    mixer.stopAllAction();
    const deathAction = mixer.clipAction(deathAnimation);
    deathAction.setLoop(THREE.LoopOnce);
    deathAction.clampWhenFinished = true;
    deathAction.play();

    // After 2 seconds show Game Over
    setTimeout(() => {
      alert(`💀 Game Over! Final Score: ${score}`);
      window.location.reload();
    }, 2000);
  }

  return {
    dispose() {
      renderer.dispose();
      container.innerHTML = '';
    }
  };
}
