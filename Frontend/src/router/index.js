import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue'
import Page from '../views/Page.vue'
import Detail from '../views/Detail.vue'
import Admin from '../views/Admin.vue'


const routes = [
  {
    path: '/',
    name: 'Home',
    components: {
      default: Home,
    },
  },
  {
    path: '/anime',
    name: 'Anime',
    components: {
      default: Page,
    },
  },
  {
    path: '/anime/:id',
    name: 'AnimeDetails',
    components: {
      default: Detail,
    },
  },
  {
    path: '/comic',
    name: 'Comic',
    components: {
      default: Page,
    },
  },
  {
    path: '/comic/:id',
    name: 'ComicDetails',
    components: {
      default: Detail,
    },
  },
  {
    path: '/novel',
    name: 'Novel',
    components: {
      default: Page,
    },
  },
  {
    path: '/novel/:id',
    name: 'NovelDetails',
    components: {
      default: Detail,
    },
  },
  {
    path: '/admin',
    name: 'Admin',
    components: {
      default: Admin,
    },
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;