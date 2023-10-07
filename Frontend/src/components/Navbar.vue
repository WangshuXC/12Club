<template>
    <nav class="navbar">
        <a href="/" class="nav-item" @mouseover="handleMouseOver('home')" @mouseout="handleMouseOut">
            <div class="nav-icon-container">
                <img :src="isNightMode ? '/src/assets/icons/home-night.png' : '/src/assets/icons/home.png'"
                    class="nav-icon" />
                <span>首页</span>
            </div>
            <div class="rect-background" :class="{ active: activeItem === 'home' }"></div>
        </a>
        <a href="/anime" class="nav-item" @mouseover="handleMouseOver('anime')" @mouseout="handleMouseOut">
            <div class="nav-icon-container">
                <img :src="isNightMode ? '/src/assets/icons/anime-night.png' : '/src/assets/icons/anime.png'"
                    class="nav-icon" />
                <span>动漫</span>
            </div>
            <div class="rect-background" :class="{ active: activeItem === 'anime' }"></div>
        </a>
        <a href="/comic" class="nav-item" @mouseover="handleMouseOver('comic')" @mouseout="handleMouseOut">
            <div class="nav-icon-container">
                <img :src="isNightMode ? '/src/assets/icons/comic-night.png' : '/src/assets/icons/comic.png'"
                    class="nav-icon" />
                <span>漫画</span>
            </div>
            <div class="rect-background" :class="{ active: activeItem === 'comic' }"></div>
        </a>
        <a href="/novel" class="nav-item" @mouseover="handleMouseOver('novel')" @mouseout="handleMouseOut">
            <div class="nav-icon-container">
                <img :src="isNightMode ? '/src/assets/icons/novel-night.png' : '/src/assets/icons/novel.png'"
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
    mounted() {
        const url = window.location.pathname;
        this.nowurl = url

        switch (url) {
            case '/':
                this.activeItem = 'home';
                this.urlItem = 'home';
                break;
            case '/anime':
                this.activeItem = 'anime';
                this.urlItem = 'anime';
                break;
            case '/comic':
                this.activeItem = 'comic';
                this.urlItem = 'comic';
                break;
            case '/novel':
                this.activeItem = 'novel';
                this.urlItem = 'novel';
                break;
        }
    },
    data() {
        return {
            activeItem: "",
            urlItem: "",
        };
    },
    computed: {
        getImagePath(item) {
            switch (item) {
                case 'home':
                    if (this.isNightMode) { return '/src/assets/icons/home-night.png;' }
                    else { return '/src/assets/icons/home.png;' };
            }

        },
    },
    methods: {
        handleMouseOver(item) {
            this.activeItem = item;
        },
        handleMouseOut() {
            if (this.activeItem === this.urlItem) {
                return;
            }
            else {
                this.activeItem = this.urlItem;
            }
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
