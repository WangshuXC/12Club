<template>
    <button @click.native="toggleStyle">
        <img v-show="!isNightMode" src="/sun.png" alt="sun" />
        <img v-show="isNightMode" src="/night.png" alt="night" />
    </button>
</template>

<script>
export default {
    name: 'switchbtn',
    data() {
        return {
            isNightMode: false,
        };
    },
    methods: {
        toggleStyle() {
            this.isNightMode = !this.isNightMode;
            this.$emit('toggle');
        },
    },
};
</script>

<style scoped>
button {
    padding: 0;
    width: 40px;
    height: 40px;
    border: none;
    background-repeat: no-repeat;
    background-size: contain;
    background-position: center;
    background-color: transparent
}

img {
    width: 100%;
    height: 100%;
}
</style>
