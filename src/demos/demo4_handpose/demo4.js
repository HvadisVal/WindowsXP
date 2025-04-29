import * as THREE from 'three';
import * as handpose from '@tensorflow-models/handpose';
import '@tensorflow/tfjs-backend-webgl';

export async function init(containerId) {
  const container = document.getElementById(containerId);

  const handStatus = document.createElement('div');
  handStatus.style.position = 'absolute';
  handStatus.style.bottom = '0%'; 
  handStatus.style.left = '50%'; 
  handStatus.style.transform = 'translate(-50%, -50%)';
  handStatus.style.textAlign = 'center';
  handStatus.style.color = 'gray';
  handStatus.style.fontFamily = 'segoe ui, sans-serif';
  handStatus.style.fontSize = '24px';
  handStatus.style.opacity = '0';
  handStatus.style.transition = 'opacity 0.5s';
  container.appendChild(handStatus);

  const video = document.createElement('video');
  video.style.display = 'none'; // hide webcam video
  container.appendChild(video);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x202020);

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let avatar;
  let isAvatarLoaded = false;
  let mixer;
  let actions = [];

  // Add ambient light for soft, overall illumination
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5); // soft white light
  scene.add(ambientLight);

  // Add point light for localized lighting
  const pointLight = new THREE.PointLight(0xffffff, 1, 100);  // white point light with intensity 1 and distance of 100
  pointLight.position.set(10, 10, 10);  
  scene.add(pointLight);

  // Add a directional light for stronger, more focused lighting (like sunlight)
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);  
  directionalLight.position.set(5, 5, 5).normalize();  
  scene.add(directionalLight);

  window.addEventListener('click', (event) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects([cube]);

    if (intersects.length > 0 && !isAvatarLoaded) {
      loadAvatar();
    }
  });

  async function loadAvatar() {
    const { GLTFLoader } = await import('three/examples/jsm/loaders/GLTFLoader.js');
    const loader = new GLTFLoader();
    loader.load('/models/waving.glb', (gltf) => {
      avatar = gltf.scene;
      scene.add(avatar);
      avatar.position.set(0, -2, -4);
      avatar.scale.set(3, 3, 3);
      
      cube.visible = false;
      isAvatarLoaded = true;
      console.log('Avatar loaded');
      mixer = new THREE.AnimationMixer(avatar); 
      actions = gltf.animations.map((clip) => mixer.clipAction(clip));
      // Set clampWhenFinished and loop mode for all actions
      actions.forEach(action => {
        action.clampWhenFinished = true;
        action.setLoop(THREE.LoopRepeat); // Repeat animation
        action.timeScale = 0.5;
      });
      // Assign to outer scope variables
      window.mixer = mixer;
      window.actions = actions;
    }, undefined, (error) => {
      console.error('Error loading avatar:', error);
    });
  }

  // Load Handpose model
  const model = await handpose.load();

  navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
    video.srcObject = stream;
    video.play();
    console.log("Webcam feed is playing...");
  });

  window.addEventListener('resize', onResize);

  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  function animate() {
    requestAnimationFrame(animate);

    if (mixer) mixer.update(0.016);

    cube.rotation.x += 0.01;
    cube.rotation.y += 0.01;
    renderer.render(scene, camera);
  }
  animate();

  let targetScale = 1; // Default scale 
  let scaleSpeed = 0.05; // Speed of scale change
  
  setInterval(async () => {
    if (video.readyState >= 2) {
      const predictions = await model.estimateHands(video);
      if (predictions.length > 0) {
        const landmarks = predictions[0].landmarks;
        const palmBase = predictions[0].annotations.palmBase;
  
        if (palmBase) {
          handStatus.textContent = 'Hand Detected!';
          handStatus.style.opacity = '1';

          if (isAvatarLoaded && avatar && actions.length > 0) {
            const wristY = palmBase[0][1];

            if (wristY < 200) {
              actions[0].reset().fadeIn(0.2).play();
              handStatus.textContent = 'Hand Up!';
            } else {
              actions[0].fadeOut(0.2);
              handStatus.textContent = 'Hand Down!';
            }
          }
  
          // Hand gesture logic: open hand vs closed fist
          const isOpenHand = landmarks[4][0] > palmBase[0][0] + 50;  // Heuristic for open hand
  
          if (isOpenHand) {
            handStatus.textContent = 'Hand Open!';
            cube.material.color.setHex(0x0000ff); // Blue for open hand
            targetScale = 2; // Set target scale when hand is open
          } else {
            cube.material.color.setHex(0xff0000); // Red for closed fist
            handStatus.textContent = 'Hand Closed!';
            targetScale = 0.5; 
          }
        }
  
        // Smoothly interpolate the scale over time
        cube.scale.x += (targetScale - cube.scale.x) * scaleSpeed;
        cube.scale.y += (targetScale - cube.scale.y) * scaleSpeed;
        cube.scale.z += (targetScale - cube.scale.z) * scaleSpeed;
  
      } else {
        cube.material.color.setHex(0x00ff00); // Reset to green when no hand detected
        handStatus.textContent = '';
        handStatus.style.opacity = '0';
      }
    }
  }, 200);

  return {
    dispose() {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }
  };
}