<template>
  <div
    class="window documents-window"
    :style="{
      top: position.top + 'px',
      left: position.left + 'px',
      width: width + 'px',
      height: height + 'px',
    }"
  >
    <div class="title-bar" @mousedown.prevent="startDrag">
      <div class="title-bar-text">
        {{ folders[selectedFolderIndex].files[selectedFileIndex].title }}
      </div>
      <div class="title-bar-controls">
        <button aria-label="Close" @click="$emit('close')"></button>
      </div>
    </div>

    <!-- Folder Tabs -->
    <div class="tab-bar">
      <button
        v-for="(folder, index) in folders"
        :key="index"
        :class="{ active: selectedFolderIndex === index }"
        @click="
          selectedFolderIndex = index;
          selectedFileIndex = 0;
        "
      >
        {{ folder.name }}
      </button>
    </div>

    <!-- File Tabs -->
    <div class="tab-bar">
      <button
        v-for="(file, index) in folders[selectedFolderIndex].files"
        :key="index"
        :class="{ active: selectedFileIndex === index }"
        @click="
          selectedFileIndex = index;
          scrollToLine(file.startLine || 1);
        "
      >
        {{ file.title }}
      </button>
    </div>

    <div class="zoom-controls">
      <button @click="zoom = Math.min(24, zoom + 5)">A+</button>
      <button @click="zoom = Math.max(10, zoom - 5)">A-</button>
    </div>

    <div class="window-body">
      <pre ref="codeBlock" :style="{ fontSize: zoom + 'px' }"><code><div v-for="(line, i) in folders[selectedFolderIndex].files[selectedFileIndex].code.split('\n')" :key="i" :data-line="i + 1" v-html="line" /></code></pre>
    </div>
    <div class="resize-handle" @mousedown.prevent="startResize" />
  </div>
</template>

<script>
import hueServiceCode from "../services/hueService.js?raw";
// Demo Mutating Code
import commonMutatingCode from "../demos/demo1_threejs_cube/demo1.js?raw";

// Demo Hue Gesture Control Code
import commonCode from "../demos/hue_gesture/common.js?raw";
import gestureControlCode from "../demos/hue_gesture/gesture_control.js?raw";
import clapControlCode from "../demos/hue_gesture/clap_control.js?raw";
import powerGestureCode from "../demos/hue_gesture/power_gestures.js?raw";
import colorGestureCode from "../demos/hue_gesture/color_gestures.js?raw";

// Demo Handpose Code
import demoHandposeCode from "../demos/demo4_handpose/demo4.js?raw";

// Demo JumpBoy Code
import jumpBoyCode from "../demos/dino_runner/dino_runner.js?raw";
import gestureControllerCode from "../demos/dino_runner/dino_runner.js?raw";

export default {
  name: "DocumentsWindow",
  data() {
    return {
      selectedFolderIndex: 0,
      selectedFileIndex: 0,
      position: { top: 100, left: 100 },
      isDragging: false,
      dragOffset: { x: 0, y: 0 },
      zoom: 14,
      width: 700,
      height: 500,
      isResizing: false,
      resizeStart: { x: 0, y: 0 },
      folders: [
          {
          name: "cube",
          files: [
            { title: "demo1.js", code: commonMutatingCode, startLine: 1 },
          ],
        },
        {
          name: "gesture",
          files: [
            { title: "common.js", code: commonCode, startLine: 1 },
            { title: "clap_control.js", code: clapControlCode, startLine: 8 },
            {
              title: "gesture_control.js",
              code: gestureControlCode,
              startLine: 173,
            },
            {
              title: "power_gestures.js",
              code: powerGestureCode,
              startLine: 1,
            },
            {
              title: "color_gestures.js",
              code: colorGestureCode,
              startLine: 1,
            },
          ],
        },
        {
          name: "handpose",
          files: [{ title: "demo4.js", code: demoHandposeCode, startLine: 1 }],
        },
        {
          name: "services",
          files: [
            { title: "hueService.js", code: hueServiceCode, startLine: 1 },
          ],
        },
        {
          name: "jumpBoy",
          files: [
            { title: "dino_runner.js", code: jumpBoyCode, startLine: 1 },
            {
              title: "gesture_controller.js",
              code: gestureControllerCode,
              startLine: 1,
            },
          ],
        },
      ],
    };
  },
  methods: {
    startDrag(event) {
      this.isDragging = true;
      this.dragOffset.x = event.clientX - this.position.left;
      this.dragOffset.y = event.clientY - this.position.top;
      document.addEventListener("mousemove", this.onDrag);
      document.addEventListener("mouseup", this.stopDrag);
    },
    onDrag(event) {
      if (this.isDragging) {
        this.position.left = event.clientX - this.dragOffset.x;
        this.position.top = event.clientY - this.dragOffset.y;
      }
    },
    stopDrag() {
      this.isDragging = false;
      document.removeEventListener("mousemove", this.onDrag);
      document.removeEventListener("mouseup", this.stopDrag);
    },
    startResize(event) {
      this.isResizing = true;
      this.resizeStart.x = event.clientX;
      this.resizeStart.y = event.clientY;
      document.addEventListener("mousemove", this.onResize);
      document.addEventListener("mouseup", this.stopResize);
    },
    onResize(event) {
      if (this.isResizing) {
        const dx = event.clientX - this.resizeStart.x;
        const dy = event.clientY - this.resizeStart.y;
        this.width = Math.max(300, this.width + dx);
        this.height = Math.max(200, this.height + dy);
        this.resizeStart.x = event.clientX;
        this.resizeStart.y = event.clientY;
      }
    },
    stopResize() {
      this.isResizing = false;
      document.removeEventListener("mousemove", this.onResize);
      document.removeEventListener("mouseup", this.stopResize);
    },
    scrollToLine(lineNumber) {
      this.$nextTick(() => {
        const block = this.$refs.codeBlock;
        const target = block.querySelector(`[data-line='${lineNumber}']`);
        if (target) {
          target.scrollIntoView({ behavior: "auto", block: "start" });
        }
      });
    },
  },
};
</script>

<style scoped>
.documents-window {
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 20;
}

.window-body {
  overflow: auto;
  flex: 1;
  text-align: left;
  font-family: monospace;
  background: white;
  border-top: 1px solid gray;
}

pre {
  white-space: pre;
  margin: 0;
}

.tab-bar {
  background: silver;
  display: flex;
  padding: 2px 8px 2px 8px;
  gap: 2px;
}

.tab-bar button {
  font-family: monospace;
  font-size: 12px;
  background: #dcdcdc;
  border: 1px solid #888;
  padding: 2px 6px;
  cursor: pointer;
}

.tab-bar button.active {
  background: white;
  border-bottom: none;
}

.zoom-controls {
  background: #c0c0c0;
  padding: 4px 8px;
  display: flex;
  gap: 6px;
  align-items: center;
}

.zoom-controls button {
  font-family: monospace;
  font-size: 12px;
  padding: 2px 6px;
  cursor: pointer;
}

.resize-handle {
  position: absolute;
  width: 12px;
  height: 12px;
  right: 0;
  bottom: 0;
  background: #888;
  cursor: se-resize;
  z-index: 10;
}
</style>
