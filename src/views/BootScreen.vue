<template>
  <div class="boot-container">
    <canvas ref="canvas"></canvas>

    <!-- Power Button (SVG) -->
    <img
      v-if="!booting"
      src="../assets/PowerButton.svg"
      alt="Power Button"
      class="power-button"
      @click="startComputer"
    />

    <audio ref="startupSound" :src="startupSound" preload="auto"></audio>
  </div>
</template>

<script>
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
// import { GUI } from "dat.gui"; // ✅ Bring back GUI
import startupSoundFile from "../assets/sound/windowsXPStartup.wav";

export default {
  name: "BootScreen",
  data() {
    return {
      startupSound: startupSoundFile,
      scene: null,
      camera: null,
      renderer: null,
      oldComputer: null,
      windowsAnimation: null,
      mixer: null,
      clock: null,
      animationId: null,
      booting: false,
    };
  },
  methods: {
    startComputer() {
      this.booting = true;

      setTimeout(() => {
        this.$refs.startupSound.play();
      }, 300); // ✅ Delay sound 300ms

      if (this.oldComputer) {
        this.scene.remove(this.oldComputer);
      }

      // Load Windows 7 Start animation
      const loader = new GLTFLoader();
      loader.load("/models/windows_7_is_starting.glb", (gltf) => {
        const startupModel = gltf.scene;

        startupModel.scale.set(1, 1, 1);
        startupModel.position.set(0, 0.01, -0.65);
        startupModel.rotation.set(1.6, 0, 0);

        this.scene.add(startupModel);
        this.windowsAnimation = startupModel;

        if (gltf.animations.length > 0) {
          this.mixer = new THREE.AnimationMixer(startupModel);
          const action = this.mixer.clipAction(gltf.animations[0]);
          action.play();
          this.clock = new THREE.Clock();
        }
      });

      setTimeout(() => {
        cancelAnimationFrame(this.animationId);
        this.$router.push("/desktop");
      }, 4000);
    },

    initThree() {
      const canvas = this.$refs.canvas;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color("black");

      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 2.5;
      this.camera = camera;

      const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      renderer.setSize(window.innerWidth, window.innerHeight);

      const ambientLight = new THREE.AmbientLight(0xffffff, 1);
      scene.add(ambientLight);

      const loader = new GLTFLoader();
      loader.load("/models/old_computer.glb", (gltf) => {
        const model = gltf.scene;

        model.position.set(-4.18, -1.75, -0.43);
        model.rotation.set(0, 1.58, -0.13);
        model.scale.set(0.39, 1.2, 1.2);

        scene.add(model);
        this.oldComputer = model;

        /*  // ✅ Set up dat.GUI only for oldComputer
          const gui = new GUI();
          const folder1 = gui.addFolder('Computer Position');
          folder1.add(model.position, 'x', -10, 10, 0.01);
          folder1.add(model.position, 'y', -10, 10, 0.01);
          folder1.add(model.position, 'z', -10, 10, 0.01);
  
          const folder2 = gui.addFolder('Computer Rotation');
          folder2.add(model.rotation, 'x', -Math.PI, Math.PI, 0.01);
          folder2.add(model.rotation, 'y', -Math.PI, Math.PI, 0.01);
          folder2.add(model.rotation, 'z', -Math.PI, Math.PI, 0.01);
  
          const folder3 = gui.addFolder('Computer Scale');
          folder3.add(model.scale, 'x', 0.1, 5, 0.01);
          folder3.add(model.scale, 'y', 0.1, 5, 0.01);
          folder3.add(model.scale, 'z', 0.1, 5, 0.01);
  
          folder1.open();
          folder2.open();
          folder3.open(); */
      });

      const animate = () => {
        this.animationId = requestAnimationFrame(animate);
        if (this.mixer && this.clock) {
          const delta = this.clock.getDelta();
          this.mixer.update(delta);
        }
        renderer.render(scene, camera);
      };
      animate();

      window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      this.scene = scene;
      this.renderer = renderer;
    },
  },
  mounted() {
    this.initThree();
  },
  beforeUnmount() {
    cancelAnimationFrame(this.animationId);
  },
};
</script>

<style scoped>
.boot-container {
  width: 100vw;
  height: 100vh;
  background: black;
  overflow: hidden;
  position: relative;
}

canvas {
  width: 100%;
  height: 100%;
  display: block;
}

/* Power Button Styling */
.power-button {
  position: absolute;
  top: 79.5%;
  left: 70.6%;
  width: 20px; /* adjust if needed */
  height: 100px;
  transform: translate(-50%, -50%);
  cursor: pointer;
}
</style>
