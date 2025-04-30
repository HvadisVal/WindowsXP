import * as THREE from 'three';
import { Vehicle, EntityManager, SeekBehavior, Vector3 as YukaVector3 } from 'yuka';

export async function init(containerId) {
  const container = document.getElementById(containerId);

  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(75, container.clientWidth/container.clientHeight, 0.1, 1000);
  camera.position.set(15, 15, 15);
  camera.lookAt(new THREE.Vector3(0, 0, 0));

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
  scene.add(ambientLight);

  const dirLight = new THREE.DirectionalLight(0xffffff, 0.6);
  dirLight.position.set(5, 10, 7.5);
  scene.add(dirLight);

  const groundGeometry = new THREE.PlaneGeometry(50, 50);
  const groundMaterial = new THREE.MeshStandardMaterial({ color: 0x555555 });
  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  const npcGeometry = new THREE.BoxGeometry(1, 1, 1);
  const npcMaterial = new THREE.MeshStandardMaterial({ color: 0x00ffcc });
  const npcMesh = new THREE.Mesh(npcGeometry, npcMaterial);
  scene.add(npcMesh);

  const vehicle = new Vehicle();
  vehicle.maxSpeed = 1;
  vehicle.position.set(0, 0, 0);

  const target = new YukaVector3(5, 0, 5);
  const seekBehavior = new SeekBehavior(target);
  vehicle.steering.add(seekBehavior);

  const entityManager = new EntityManager();
  entityManager.add(vehicle);

  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    entityManager.update(delta);
    npcMesh.position.set(vehicle.position.x, 0.5, vehicle.position.z);
    renderer.render(scene, camera);
  }
  animate();

  return {
    dispose() {
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }
  };
}
