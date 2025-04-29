<template>
  <div class="desktop" v-if="!blueScreen">
    <canvas ref="canvas"></canvas>
    <!-- Container for loaded demos -->
    <div
      id="canvas-container"
      style="width: 100%; height: 100%; position: absolute; z-index: 1"
    ></div>
    <!-- Desktop icons -->
    <div
      v-for="(icon, index) in icons"
      :key="index"
      class="icon-wrapper"
      :style="{ top: icon.top + 'px', left: icon.left + 'px' }"
      @click="handleIconClick(icon.name)"
    >
      <img :src="icon.src" :alt="icon.name" class="file-icon" />
      <p class="icon-name">{{ icon.name }}</p>
    </div>

    <!-- My Computer popup -->
    <div
      v-if="showComputerWindow"
      class="popup-group"
      :style="{
        top: popupPosition.top + 'px',
        left: popupPosition.left + 'px',
      }"
      @mousedown="startDragging"
    >
      <div class="popup-drag-zone"></div>
      <img
        src="../assets/MyComputerWithFiles.svg"
        class="popup-image"
        alt="My Computer"
      />

      <!-- Links folder inside -->
      <div class="links-folder" @click.stop="openLinksWindow">
        <img src="../assets/Links.svg" />
        <p class="links-label">Links</p>
      </div>

      <!-- File folder inside -->
      <div class="file-folder" @click.stop="openFileWindow">
        <img src="../assets/File.svg" />
      </div>

      <button class="popup-close" @click.stop="closeWindow">X</button>
    </div>

    <!-- Links popup -->
    <div
      v-if="showLinksWindow"
      class="popup-group"
      :style="{ top: linksPopup.top + 'px', left: linksPopup.left + 'px' }"
      @mousedown="startDraggingLinks"
    >
      <div class="popup-drag-zone"></div>
      <img
        src="../assets/MyComputerNoFile.svg"
        alt="Links Folder Opened"
        class="popup-image"
      />
      <button class="popup-close" @click.stop="closeLinksWindow">X</button>

      <!-- Clickable Links inside Links popup -->
      <div
        v-for="(link, index) in linkItems"
        :key="index"
        class="link-item"
        :style="{ top: link.top + 'px', left: link.left + 'px' }"
        @click.stop="openLink(link.url)"
      >
        <img :src="link.icon" alt="Link Icon" class="link-icon" />
        <p class="link-label">{{ link.label }}</p>
      </div>
    </div>

    <!-- File popup with placeholder demos -->
    <div
      v-if="showFileWindow"
      class="popup-group"
      :style="{ top: filePopup.top + 'px', left: filePopup.left + 'px' }"
      @mousedown="startDraggingFile"
    >
      <div class="popup-drag-zone"></div>
      <img
        src="../assets/MyComputerNoFile.svg"
        class="popup-image"
        alt="File Folder"
      />
      <!-- Documents folder inside File -->
      <div class="documents-folder" @click.stop="openDocumentsWindow">
        <img class="file-icon" src="../assets/Documents.svg" />
      </div>

      <button class="popup-close" @click.stop="closeFileWindow">X</button>
    </div>
    <!-- Demos shown only if Documents is clicked -->
    <div
      v-if="showDocumentsWindow"
      v-for="(demo, index) in demoItems"
      :key="index"
      class="demo-file"
      :style="{ top: demo.top + 'px', left: demo.left + 'px' }"
      @click.stop="loadDemo(demo.demoName)"
    >
      <div class="demo-box">{{ demo.label }}</div>
    </div>

    <!-- Error popups -->
    <div
      v-for="(error, index) in errorPopups"
      :key="index"
      class="error-popup"
      :style="{ top: error.top + 'px', left: error.left + 'px' }"
    >
      <img src="../assets/ErrorFail.svg" class="error-img" />
      <button class="error-ok" @click="duplicateErrors">OK</button>
    </div>

    <!-- Audio -->
    <audio ref="clickSound" :src="clickSound" preload="auto"></audio>
    <audio
      ref="errorSound"
      src="../assets/sound/Windows XP Error.wav"
      preload="auto"
    ></audio>
  </div>

  <div v-else class="blue-screen">
    <img :src="blueScreenImage" class="blue-screen-image" />
  </div>
</template>

<script>
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

import fileIcon from "../assets/FilesNoText.svg";
import computerIcon from "../assets/ComputerNoText.svg";
import documentsIcon from "../assets/DocumentsNoText.svg";
import clickSoundFile from "../assets/sound/windowsXPClick.wav";
import errorSoundFile from "../assets/sound/Windows XP Error.wav";
import blueScreenImage from "../assets/BlueScreenChat.svg";

export default {
  name: "Desktop",
  data() {
    return {
      clickSound: clickSoundFile,
      icons: [
        { src: computerIcon, name: "Computer", top: 80, left: 40 },
        { src: fileIcon, name: "File", top: 200, left: 45 },
        { src: documentsIcon, name: "Documents", top: 310, left: 45 },
        {
          src: "src/assets/Cactus.svg",
          name: "JumpBoy",
          top: 420,
          left: 45,
        },
      ],
      linkItems: [
        {
          label: "Ikea",
          url: "https://www.ikea.com/dk/da/p/landskrona-3-pers-sofa-gunnared-bla-trae-s29393417/",
          icon: "/logos/Ikea.svg",
          top: 260,
          left: 100,
        },
        {
          label: "Nike",
          url: "https://nikevirtualview.com/needitnow/index.html",
          icon: "/logos/Nike.svg",
          top: 260,
          left: 200,
        },
        {
          label: "Meshy",
          url: "https://www.meshy.ai/",
          icon: "/logos/Meshy.svg",
          top: 260,
          left: 300,
        },
        {
          label: "ThreeJs",
          url: "https://threejs.org/",
          icon: "/logos/Threejs.svg",
          top: 360,
          left: 100,
        },
        {
          label: "TensorFlow",
          url: "https://www.tensorflow.org/js",
          icon: "/logos/TensorFlow.svg",
          top: 360,
          left: 200,
        },
      ],
      demoItems: [
       
        {
          label: "🧊 Mutating Cube",
          demoName: "demo1_threejs_cube",
          top: 600,
          left: 20,
        },
        {
          label: "🧠 TensorFlow.js Classifier",
          demoName: "demo3_tensorflow_classifier",
          top: 640,
          left: 20,
        },
        {
          label: "🖐️ Handpose Detection",
          demoName: "demo4_handpose",
          top: 680,
          left: 20,
        },
        {
          label: "🤖 Yuka NPC Walker",
          demoName: "demo5_yuka_npc_walk",
          top: 720,
          left: 20,
        },
      ],

      showComputerWindow: false,
      showLinksWindow: false,
      showFileWindow: false,
      showDocumentsWindow: false,
      popupPosition: { top: 100, left: 200 },
      linksPopup: { top: 0, left: 260 },
      filePopup: { top: 240, left: 320 },

      isDragging: false,
      isDraggingLinks: false,
      isDraggingFile: false,
      dragOffset: { x: 0, y: 0 },
      dragLinksOffset: { x: 0, y: 0 },
      dragFileOffset: { x: 0, y: 0 },

      scene: null,
      camera: null,
      renderer: null,
      xpDesktopModel: null,
      animationId: null,
      currentApp: null,

      errorPopups: [],
      blueScreen: false,
      blueScreenImage,
    };
  },
  methods: {
    playClickSound() {
      this.$refs.clickSound.currentTime = 0;
      this.$refs.clickSound.play();
    },
    handleIconClick(name) {
      this.playClickSound();
      if (name === "Computer") {
        this.showComputerWindow = true;
      } else if (name === "JumpBoy") {
        this.loadDemo("dino_runner");
        // assuming this is your jumping game
      }
    },
    openLink(url) {
      window.open(url, "_blank");
    },
    openLinksWindow() {
      this.playClickSound();
      this.showLinksWindow = true;
    },
    openFileWindow() {
      this.playClickSound();
      this.showFileWindow = true;
    },
    openDocumentsWindow() {
      this.playClickSound();
      this.showDocumentsWindow = true;
    },
    closeDocumentsWindow() {
      this.showDocumentsWindow = false;
    },
    closeWindow() {
      this.showComputerWindow = false;
      this.triggerErrorPopup();
    },
    closeLinksWindow() {
      this.showLinksWindow = false;
    },
    closeFileWindow() {
      this.showFileWindow = false;
      this.closeDocumentsWindow();
    },
    triggerErrorPopup() {
      const top = Math.random() * (window.innerHeight - 200);
      const left = Math.random() * (window.innerWidth - 300);
      this.errorPopups.push({ top, left });
      new Audio(errorSoundFile).play();
      setTimeout(() => {
        this.blueScreen = true;
      }, 5000);
    },
    duplicateErrors() {
      const newPopups = [];
      for (let i = 0; i < 5; i++) {
        const top = Math.random() * (window.innerHeight - 200);
        const left = Math.random() * (window.innerWidth - 300);
        newPopups.push({ top, left });
        new Audio(errorSoundFile).play();
      }
      this.errorPopups.push(...newPopups);
    },

    // Dragging My Computer
    startDragging(event) {
      this.isDragging = true;
      this.dragOffset.x = event.clientX - this.popupPosition.left;
      this.dragOffset.y = event.clientY - this.popupPosition.top;
      document.addEventListener("mousemove", this.onDragging);
      document.addEventListener("mouseup", this.stopDragging);
    },
    onDragging(event) {
      if (this.isDragging) {
        this.popupPosition.left = event.clientX - this.dragOffset.x;
        this.popupPosition.top = event.clientY - this.dragOffset.y;
      }
    },
    stopDragging() {
      this.isDragging = false;
      document.removeEventListener("mousemove", this.onDragging);
      document.removeEventListener("mouseup", this.stopDragging);
    },

    // Dragging Links Window
    startDraggingLinks(event) {
      this.isDraggingLinks = true;
      this.dragLinksOffset.x = event.clientX - this.linksPopup.left;
      this.dragLinksOffset.y = event.clientY - this.linksPopup.top;
      document.addEventListener("mousemove", this.onDraggingLinks);
      document.addEventListener("mouseup", this.stopDraggingLinks);
    },
    onDraggingLinks(event) {
      if (this.isDraggingLinks) {
        this.linksPopup.left = event.clientX - this.dragLinksOffset.x;
        this.linksPopup.top = event.clientY - this.dragLinksOffset.y;
      }
    },
    stopDraggingLinks() {
      this.isDraggingLinks = false;
      document.removeEventListener("mousemove", this.onDraggingLinks);
      document.removeEventListener("mouseup", this.stopDraggingLinks);
    },

    // Dragging File Window
    startDraggingFile(event) {
      this.isDraggingFile = true;
      this.dragFileOffset.x = event.clientX - this.filePopup.left;
      this.dragFileOffset.y = event.clientY - this.filePopup.top;
      document.addEventListener("mousemove", this.onDraggingFile);
      document.addEventListener("mouseup", this.stopDraggingFile);
    },
    onDraggingFile(event) {
      if (this.isDraggingFile) {
        this.filePopup.left = event.clientX - this.dragFileOffset.x;
        this.filePopup.top = event.clientY - this.dragFileOffset.y;
      }
    },
    stopDraggingFile() {
      this.isDraggingFile = false;
      document.removeEventListener("mousemove", this.onDraggingFile);
      document.removeEventListener("mouseup", this.stopDraggingFile);
    },

    // Init 3D
    initThree() {
      const canvas = this.$refs.canvas;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      );
      camera.position.z = 5;

      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
      renderer.setSize(window.innerWidth, window.innerHeight);
      renderer.setClearColor(0x000000, 0);

      const light = new THREE.AmbientLight(0xffffff, 1);
      scene.add(light);

      const loader = new GLTFLoader();
      loader.load("/models/windows_xp_desktop_3d.glb", (gltf) => {
        const model = gltf.scene;
        model.position.set(1.06, -0.1, 0);
        model.scale.set(22.33, 16.06, 0.1);
        scene.add(model);
        this.xpDesktopModel = model;
      });

      const animate = () => {
        this.animationId = requestAnimationFrame(animate);
        renderer.render(scene, camera);
      };
      animate();

      window.addEventListener("resize", () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      });

      this.scene = scene;
      this.camera = camera;
      this.renderer = renderer;
    },
    async loadDemo(demoName) {
      this.showComputerWindow = false;
      this.showFileWindow = false;

      if (this.currentApp && this.currentApp.dispose) {
        this.currentApp.dispose();
      }

      const container = document.getElementById("canvas-container");
      if (container) container.innerHTML = "";

      let module;

      if (demoName === "dino_runner") {
        module = await import("../demos/dino_runner/dino_runner.js");
      } else if (demoName === "big_bang") {
        module = await import("../demos/big_bang/big_bang.js");
      } else if (demoName === "demo1_threejs_cube") {
        module = await import("../demos/demo1_threejs_cube/demo1.js");
      } else if (demoName === "demo2_vite_animation") {
        module = await import("../demos/demo2_vite_animation/demo2.js");
      } else if (demoName === "demo3_tensorflow_classifier") {
        module = await import("../demos/demo3_tensorflow_classifier/demo3.js");
      } else if (demoName === "demo4_handpose") {
        module = await import("../demos/demo4_handpose/demo4.js");
      } else if (demoName === "demo5_yuka_npc_walk") {
        module = await import("../demos/demo5_yuka_npc_walk/demo5.js");
      }

      if (module && module.init) {
        this.currentApp = await module.init("canvas-container");
      }
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
.desktop {
  width: 100vw;
  height: 100vh;
  overflow: hidden;
  position: relative;
  cursor: default;
}

canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.icon-wrapper {
  position: absolute;
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 80px;
  cursor: pointer;
  z-index: 2;
}

.file-icon {
  width: 80px;
  height: 80px;
  transition: transform 0.2s;
}

.file-icon:hover {
  transform: scale(1.1);
}

.icon-name {
  color: white;
  font-size: 0.8rem;
  text-align: center;
  margin-top: 1px;
  text-shadow: 1px 1px 2px black;
}

.popup-group {
  position: absolute;
  width: 800px;
  height: auto;
  z-index: 3;
}

.popup-drag-zone {
  position: relative;
  cursor: grab;
  height: 125px; /* Only top part is draggable */
}

.popup-image {
  width: 100%;
  height: auto;
  display: block;
}

.popup-close {
  position: absolute;
  top: 133px;
  right: 9px;
  background: #c0c0c0;
  color: #1d1d1c;
  font-weight: 900;
  border: none;
  padding: 4px 7px;
  cursor: pointer;
  z-index: 4;
}

.links-folder {
  position: absolute;
  top: 263px;
  left: 620px;
  width: 70px;
  height: auto;
  cursor: pointer;
  z-index: 5;
}

.documents-folder {
  position: absolute;
  top: 263px;
  left: 50px;
  width: 70px;
  height: auto;
  cursor: pointer;
  z-index: 5;
}

.links-label {
  font-size: 19px;
  color: black;
  margin-top: 5px;
  text-align: center;
}

.error-popup {
  position: absolute;
  width: 300px;
  z-index: 999;
}

.error-img {
  width: 100%;
  display: block;
}

.error-ok {
  position: absolute;
  bottom: 23px;
  right: 130px;
  background: #c0c0c0;
  border: none;
  font-weight: medium;
  padding: 5px 15px;
  cursor: pointer;
}

.blue-screen {
  width: 100vw;
  height: 100vh;
  background: black;
  display: flex;
  align-items: center;
  justify-content: center;
}

.blue-screen-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.file-folder {
  position: absolute;
  top: 257px;
  left: 428px;
  width: 116px;
  height: auto;
  cursor: pointer;
  z-index: 5;
}

.file-label {
  font-size: 19px;
  color: black;
  margin-top: 5px;
  text-align: center;
}

.demo-file {
  position: absolute;
  z-index: 10;
}

.demo-box {
  width: 230px;
  padding: 10px;
  background: #e0e0e0;
  border: 1px solid #aaa;
  text-align: start;
  cursor: pointer;
  font-weight: bold;
}

.link-item {
  position: absolute;
  text-align: center;
  width: 70px;
  cursor: pointer;
  z-index: 6;
}

.link-icon {
  width: 50px;
  height: 50px;
}

.document-folder {
  width: 80px;
  height: 80px;
}
.link-label {
  font-size: 12px;
  color: black;
  margin-top: 4px;
}
.rb {
  border: solid 1px red;
}
</style>
