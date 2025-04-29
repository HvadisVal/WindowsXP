import { createRouter, createWebHistory } from 'vue-router';
import BootScreen from '../views/BootScreen.vue';
import Desktop from '../views/Desktop.vue';

const routes = [
  { path: '/', name: 'BootScreen', component: BootScreen },
  { path: '/desktop', name: 'Desktop', component: Desktop }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
