<template>
  <div class="main-container" :class="{ 'default': !isNightMode, 'night': isNightMode }">
    <div class="left">
      <navbar :isNightMode="isNightMode"></navbar>
      <div class="switchbtn-container">
        <switchbtn @toggle="toggleStyle"></switchbtn>
      </div>
    </div>
    <div class="right" :style="{ 'background-color': backgroundColor }">
      <router-view></router-view>
    </div>
  </div>
</template>

<script>
import navbar from './components/Navbar.vue';
import switchbtn from './components/switchbtn.vue'

export default {
  name: 'App',
  components: {
    navbar,
    switchbtn,
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
  },
};
</script>

<style>
@import '@/assets/css/app.css';
</style>