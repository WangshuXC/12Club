<template>
    <div class="home-container">
        <div class="title">
            <club></club>
        </div>
        <div class="Accordion-container">
            <Accordion></Accordion>
        </div>
    </div>
</template>

<script>
import Accordion from '../components/Accordion.vue'
import club from '../components/12club.vue'
export default {
    name: 'Home',
    data() {
        return {
            nowurl: "",
        }
    },
    components: {
        Accordion,
        club,
    },
};
</script>

<style>
@import '@/assets/css/home.css';
</style>
