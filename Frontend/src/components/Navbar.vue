<template>
    <nav class="navbar">
        <a href="/" class="nav-item" @mouseover="handleMouseOver('home')" @mouseout="handleMouseOut">
            <div class="nav-icon-container">
                <img :src="isNightMode ? 'src/assets/icons/home-night.png' : 'src/assets/icons/home.png'" alt="Home"
                    class="nav-icon" />
                <span>首页</span>
            </div>
            <div class="rect-background" :class="{ active: activeItem === 'home' }"></div>
        </a>
        <a href="/anime" class="nav-item" :style="{ color: isNightMode ? '#fff' : '#333' }"
            @mouseover="handleMouseOver('anime')" @mouseout="handleMouseOut">
            <div class="nav-icon-container">
                <img :src="isNightMode ? 'src/assets/icons/anime-night.png' : 'src/assets/icons/anime.png'" alt="Home"
                    class="nav-icon" />
                <span>动漫</span>
            </div>
            <div class="rect-background" :class="{ active: activeItem === 'anime' }"></div>
        </a>
        <a href="/comic" class="nav-item" :style="{ color: isNightMode ? '#fff' : '#333' }"
            @mouseover="handleMouseOver('comic')" @mouseout="handleMouseOut">
            <div class="nav-icon-container">
                <img :src="isNightMode ? 'src/assets/icons/comic-night.png' : 'src/assets/icons/comic.png'" alt="Home"
                    class="nav-icon" />
                <span>漫画</span>
            </div>
            <div class="rect-background" :class="{ active: activeItem === 'comic' }"></div>
        </a>
        <a href="/novel" class="nav-item" :style="{ color: isNightMode ? '#fff' : '#333' }"
            @mouseover="handleMouseOver('novel')" @mouseout="handleMouseOut">
            <div class="nav-icon-container">
                <img :src="isNightMode ? 'src/assets/icons/novel-night.png' : 'src/assets/icons/novel.png'" alt="Home"
                    class="nav-icon" />
                <span>小说</span>
            </div>
            <div class="rect-background" :class="{ active: activeItem === 'novel' }"></div>
        </a>
    </nav>
</template>

<script>
export default {
    name: "Navbar",
    props: {
        isNightMode: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            activeItem: "",
        };
    },
    methods: {
        handleMouseOver(item) {
            this.activeItem = item;
        },
        handleMouseOut() {
            this.activeItem = "";
        },
        toggleStyle() {
            this.$emit('toggle')
        }
    }
};
</script>

<style scoped>
@import '@/assets/css/navbar.css';
</style>
