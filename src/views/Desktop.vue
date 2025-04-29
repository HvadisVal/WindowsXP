<template>
  <div class="desktop" v-if="!blueScreen">
    <canvas ref="canvas"></canvas>

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
      <div
        class="demo-file"
        v-for="n in 7"
        :key="n"
        :style="{ top: `${140 + n * 40}px`, left: '70px' }"
      >
        <div class="demo-box">Demo {{ n }}</div>
      </div>
      <button class="popup-close" @click.stop="closeFileWindow">X</button>
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
import blueScreenImage from "../assets/BlueScreen.svg";

export default {
  name: "Desktop",
  data() {
    return {
      clickSound: clickSoundFile,
      icons: [
        { src: computerIcon, name: "Computer", top: 80, left: 40 },
        { src: fileIcon, name: "File", top: 200, left: 45 },
        { src: documentsIcon, name: "Documents", top: 310, left: 45 },
      ],
      linkItems: [
        { label: "Ikea", url: "https://www.ikea.com/dk/da/p/landskrona-3-pers-sofa-gunnared-bla-trae-s29393417/", icon: "/logos/Ikea.svg", top: 260, left: 100 },
        { label: "Nike", url: "https://nikevirtualview.com/needitnow/index.html", icon: "/logos/Nike.svg", top: 260, left: 200 },
        { label: "Meshy", url: "https://www.meshy.ai/", icon: "/logos/Meshy.svg", top: 260, left: 300 },
        { label: "ThreeJs", url: "https://threejs.org/", icon: "/logos/Threejs.svg", top: 360, left: 100 },
        { label: "TensorFlow", url: "https://www.tensorflow.org/js", icon: "/logos/TensorFlow.svg",  top: 360, left: 200 },
      ],

      showComputerWindow: false,
      showLinksWindow: false,
      showFileWindow: false,
      popupPosition: { top: 100, left: 200 },
      linksPopup: { top: 180, left: 260 },
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
    closeWindow() {
      this.showComputerWindow = false;
      this.triggerErrorPopup();
    },
    closeLinksWindow() {
      this.showLinksWindow = false;
    },
    closeFileWindow() {
      this.showFileWindow = false;
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
      loader.load("/src/assets/models/windows_xp_desktop_3d.glb", (gltf) => {
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
  width: 120px;
  padding: 10px;
  background: #e0e0e0;
  border: 1px solid #aaa;
  text-align: center;
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

.link-label {
  font-size: 12px;
  color: black;
  margin-top: 4px;
}
.rb {
  border: solid 1px red;
}
</style>
