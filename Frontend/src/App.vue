<template>
  <div class="main-container" :class="{ 'default': !isNightMode, 'night': isNightMode }">
    <div class="left">
      <div class="navbar-container">
        <navbar :isNightMode="isNightMode"></navbar>
      </div>
      <div class="daynightbtn-container">
        <daynightbtn @toggle="toggleStyle"></daynightbtn>
      </div>
    </div>
    <div class="right" :style="{ 'background-color': backgroundColor }">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import navbar from './components/Navbar.vue';
import daynightbtn from './components/Daynightbtn.vue'

export default {
  name: 'App',
  components: {
    navbar,
    daynightbtn,
  },
  props: {
    isNightMode: {
      type: Boolean,
      default: false,
    }
  },
  data() {
    return {
      borderColor: '#ffffff',
      backgroundColor: '#edf4fb',
      isNightMode: false,
      backgroundImage: 'url(/background.webp)',
    };
  },
  methods: {
    toggleStyle() {
      this.isNightMode = !this.isNightMode;
      if (this.isNightMode) {
        this.borderColor = '#ffffff';
        this.backgroundColor = '#343e50';
        document.body.classList.add('night');
        document.documentElement.style.setProperty('--background-color', '#2f2f2f');
        document.documentElement.style.setProperty('--text-color', '#fff');
        document.documentElement.style.setProperty('--12club-color', '#fff');
        document.documentElement.style.setProperty('--12club-light-color', '#415b94');
        document.documentElement.style.setProperty('--nav-text-color', '#fff');
      } else {
        this.borderColor = '#4b93dc';
        this.backgroundColor = '#edf4fb';
        document.body.classList.remove('night');
        document.documentElement.style.setProperty('--background-color', '#fff');
        document.documentElement.style.setProperty('--text-color', '#000');
        document.documentElement.style.setProperty('--12club-color', '#707070');
        document.documentElement.style.setProperty('--12club-light-color', '#7bcefd');
        document.documentElement.style.setProperty('--nav-text-color', '#707070');
      }
    },

    handleScroll(event) {
      // 判断滚轮的方向
      const delta = event.deltaY > 0 ? 1 : -1;
      // 设置每次滚动的距离，这里设为30px
      const scrollDistance = 10000;
      // 阻止浏览器默认的滚动行为
      event.preventDefault();

      // 计算滚动的目标位置
      const container = event.currentTarget;
      const currentScrollTop = container.scrollTop;
      const targetScrollTop = currentScrollTop + (scrollDistance * delta);

      // 执行滚动
      container.scrollTo({
        top: targetScrollTop,
        behavior: 'smooth' // 添加平滑滚动效果
      });
    }
  },
};
</script>

<style>
@import '@/assets/css/app.css';
</style>