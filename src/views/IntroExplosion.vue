<template>
    <div id="explosion-container" @click="maybeStartBoot"></div>
  </template>
  
  <script>
  import { init } from '../demos/big_bang/big_bang';
  import { onMounted, onBeforeUnmount, ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'IntroExplosion',
    setup() {
      const router = useRouter();
      const animationFinished = ref(false);
      let cleanup = null;
  
      const maybeStartBoot = () => {
        if (animationFinished.value) {
          router.push('/boot');
        }
      };
  
      onMounted(async () => {
        const { dispose } = await init('explosion-container');
        cleanup = dispose;
  
        // Allow click after 4 seconds
        setTimeout(() => {
          animationFinished.value = true;
        }, 4000);
      });
  
      onBeforeUnmount(() => {
        if (cleanup) cleanup();
      });
  
      return {
        maybeStartBoot
      };
    }
  };
  </script>
  
  <style scoped>
  #explosion-container {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
    background: black;
    cursor: pointer;
  }
  </style>