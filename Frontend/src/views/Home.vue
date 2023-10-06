<template>
    <div class="container">
        <div class="title">
            <button data-text="Awesome" class="button">
                <span class="actual-text">&nbsp;12&nbsp;Club&nbsp;</span>
                <span class="hover-text" aria-hidden="true">&nbsp;12&nbsp;Club&nbsp;</span>
            </button>
        </div>
        <div class="Accordion-container">
            <Accordion></Accordion>
        </div>
    </div>
</template>

<script>
import Accordion from '../components/Accordion.vue'
export default {
    name: 'Home',
    data() {
        return {
            nowurl: "",
        }
    },
    components: {
        Accordion,
    },
};
</script>

<style>
@import '@/assets/css/home.css';
</style>
