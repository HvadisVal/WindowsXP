import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export async function init(containerId) {
  const container = document.getElementById(containerId);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x6e6b6b);

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.style.overflow = "hidden";
  container.appendChild(renderer.domElement);

  // Create a hidden button to load 3D model
  const loadButton = document.createElement("button");
  loadButton.innerText = "Load 3D Model";
  loadButton.style.position = "absolute";
  loadButton.style.backgroundColor = "gray";
  loadButton.style.top = "20%";
  loadButton.style.left = "50%";
  loadButton.style.transform = "translate(-50%, -50%)";
  loadButton.style.zIndex = "100";
  loadButton.style.display = "none";
  container.appendChild(loadButton);

  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
  const cube = new THREE.Mesh(geometry, material);
  scene.add(cube);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(0xffffff, 1);
  pointLight.position.set(10, 10, 10);
  scene.add(pointLight);

  window.addEventListener("resize", () => {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  });

  // Raycaster and mouse for interaction
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();
  let loadedModel = null;
  let isModelActive = false;
  
  function animate() {
    requestAnimationFrame(animate);
    if (loadedModel) {
      loadedModel.rotation.y += 0.01; 
      loadedModel.rotation.x += 0.01;
    } else {
      cube.rotation.x += 0.01;
      cube.rotation.y += 0.01;
    }
    renderer.render(scene, camera);
  }
  animate();

  setInterval(() => {
    cube.scale.set(
      0.8 + Math.random() * 1.4,
      0.8 + Math.random() * 1.4,
      0.8 + Math.random() * 1.4
    );
    cube.material.color.setHex(Math.random() * 0xffffff);
  }, 10000);

  window.addEventListener("click", (event) => {
    const rect = container.getBoundingClientRect();
    mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
    mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects([cube]);

    if (intersects.length > 0) {
      // Show the load button
      loadButton.style.display = "block"; 
    } else {
      // Change cube color on any other click
      cube.material.color.setHex(Math.random() * 0xffffff);
    }
  });

  // GLTFLoader for loading models
  const loader = new GLTFLoader();

  loadButton.addEventListener("click", () => {
    if (!isModelActive) {
      // Load model and hide cube
      loader.load(
        "/models/idle.glb",
        (gltf) => {
          loadedModel = gltf.scene;
          scene.add(loadedModel);
          loadedModel.position.set(0, 0, 0);
          loadedModel.scale.set(1, 1, 1);

          cube.visible = false; // Hide cube
          isModelActive = true;
          loadButton.innerText = "Switch to Cube"; // Change button text
        },
        undefined,
        (error) => {
          console.error("Error loading model:", error);
        }
      );
    } else {
      // Switch back to cube
      if (loadedModel) {
        scene.remove(loadedModel); // Remove model
        loadedModel = null;
      }
      cube.visible = true; 
      isModelActive = false;
      loadButton.innerText = "Load 3D Model"; 
    }
  });

  return {
    dispose() {
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    },
  };
}
