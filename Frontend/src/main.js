import './assets/css/base.css'
import axios from 'axios';
import { createApp, inject } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const api = {
    baseUrl: 'http://10.130.101.102:5174/api'
};

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.provide('api', api);
app.config.globalProperties.$http = axios;
app.mount('#app');

export { api };