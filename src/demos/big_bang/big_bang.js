import * as THREE from 'three';

export async function init(containerId) {
  const container = document.getElementById(containerId);
  
  const title = document.createElement('div');
  title.id = 'big-bang-title';
  title.innerHTML = `
    <h1>AI & 3D</h1>
    <p style="font-size:25px; margin-top:-15px;">Welcome to the future of Web 3D</p>
    <p style="font-size:16px; margin-top:10px;">Valeria & Jónína</p>
  `;
  const names = title.querySelector('p:last-child');
  names.style.opacity = '0';
  names.style.transition = 'opacity 2s';
  title.style.position = 'absolute';
  title.style.top = '40%';
  title.style.width = '100%';
  title.style.textAlign = 'center';
  title.style.color = 'white';
  title.style.fontFamily = 'Segoe UI, sans-serif';
  title.style.pointerEvents = 'none';
  title.style.opacity = '0';
  title.style.transition = 'opacity 1.5s';
  title.style.display = 'block';
  title.style.transform = 'scale(0)';
  container.appendChild(title);

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x000000); // black background

  const camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  );
  camera.position.z = 100;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(container.clientWidth, container.clientHeight);
  container.appendChild(renderer.domElement);

  const particleCount = 2500;
  const particlePositions = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    particlePositions[i * 3] = (Math.random() - 0.5) * 2; // x
    particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 2; // y
    particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2; // z
  }

  // Assign random explosion colors (orange, red, yellow, white)
  const particleColors = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    const color = new THREE.Color();
    const rand = Math.random();
    if (rand < 0.4) {
      color.set('orange');
    } else if (rand < 0.7) {
      color.set('red');
    } else if (rand < 0.9) {
      color.set('yellow');
    } else {
      color.set('white');
    }
    particleColors[i * 3] = color.r;
    particleColors[i * 3 + 1] = color.g;
    particleColors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.5,
    vertexColors: true,
  });

  const particles = new THREE.Points(geometry, material);
  scene.add(particles);

  let startTime = Date.now();

  // Explosion and text animation timing
  const explosionDuration = 1.5;
  const textDelay = 0; 

  function animate() {
    requestAnimationFrame(animate);

    const elapsed = (Date.now() - startTime) / 500;

    const positions = particles.geometry.attributes.position.array;

    for (let i = 0; i < positions.length; i += 3) {
      positions[i] *= 1 + 0.05 * elapsed;
      positions[i + 1] *= 1 + 0.05 * elapsed;
      positions[i + 2] *= 1 + 0.05 * elapsed;
    }

    particles.geometry.attributes.position.needsUpdate = true;

    // Title appears slightly before explosion ends
    if (elapsed > explosionDuration + textDelay) {
      const textElapsed = elapsed - (explosionDuration + textDelay);
      const scale = Math.min(1.05, textElapsed * 3);
      title.style.transform = `scale(${scale})`;
      title.style.opacity = scale;
    }
    if (elapsed > explosionDuration + textDelay + 1) { 
      names.style.opacity = '1';
    }

    renderer.render(scene, camera);
  }

  animate();

  window.addEventListener('resize', onResize);

  function onResize() {
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  return {
    dispose() {
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
      const title = document.getElementById('big-bang-title');
      if (title) {
        title.remove();
      }
    }
  };
}