import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue'
import Page from '../views/Page.vue'
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
    props: (route) => ({ page_id: route.query.page_id || 1 }),
    children: [
      {
        path: 'page=:page_id',
        name: 'AnimePage',
        component: Page,
        props: true,
      },
      {
        path: ':anime_id',
        name: 'AnimeDetail',
        component: Page,
        props: true,
      },
    ],
  },
  {
    path: '/comic',
    name: 'Comic',
    components: {
      default: Page,
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