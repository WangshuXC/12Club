<template>
    <div class="Accordion">
        <div class="BtnShell">
            <button class="updatebtn" @click="expandButton(0)"
                :style="{ width: expandedButtonIndex === 0 ? '150px' : '90px' }"
                :class="{ clicked: expandedButtonIndex === 0 }">资源更新</button>
            <button class="updatebtn" @click="expandButton(1)"
                :style="{ width: expandedButtonIndex === 1 ? '150px' : '90px' }"
                :class="{ clicked: expandedButtonIndex === 1 }">动漫更新</button>
            <button class="updatebtn" @click="expandButton(2)"
                :style="{ width: expandedButtonIndex === 2 ? '150px' : '90px' }"
                :class="{ clicked: expandedButtonIndex === 2 }">漫画更新</button>
            <button class="updatebtn" @click="expandButton(3)"
                :style="{ width: expandedButtonIndex === 3 ? '150px' : '90px' }"
                :class="{ clicked: expandedButtonIndex === 3 }">小说更新</button>
        </div>
        <div class="nameshell">
            <p>欢迎来到12社区喵</p>
        </div>
        <div class="AccordionShell">
            <div class="box" v-for="(item, index) in imgListShow" :key="index" @mouseover="hoverBox" @mouseleave="leaveBox">
                <img :src="item" />
                <span v-show="!hideSpan">{{ nameListShow[index] }}</span>
            </div>
        </div>
    </div>
</template>
    
<script>
import axios from 'axios';
export default {
    data() {
        return {
            hideSpan: false,
            expandedButtonIndex: 0,
            apiUrls: [
                'http://localhost:5174/api/update0',
                'http://localhost:5174/api/update1',
                'http://localhost:5174/api/update2',
                'http://localhost:5174/api/update3'
            ],
            imgListShow: [],
            nameListShow: [],
            imgListGet: [],
            nameListGet: [],
        };
    },
    methods: {
        hoverBox() {
            this.hideSpan = true;
        },
        leaveBox() {
            this.hideSpan = false;
        },

        fetchData(apiUrl) {
            axios.get(apiUrl)
                .then((response) => {
                    this.imgListShow = response.data[0];
                    this.nameListShow = response.data[1];
                })
                .catch((error) => {
                    console.error(error);
                });
        },
        expandButton(index) {
            this.expandedButtonIndex = index;
            const apiUrl = this.apiUrls[index];
            this.fetchData(apiUrl);
        },
    },
    mounted() {
        const initialApiUrl = this.apiUrls[0];
        this.fetchData(initialApiUrl);

    },
};
</script>
    
<style>
.Accordion {
    display: flex;
    flex-direction: column;
}

.nameshell {
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 20px auto;
    height: 30px;
    width: 60%;
    background-color: var(--background-color);
    border-radius: 20px;
    border: 10px solid var(--background-color);
}

.nameshell.p {
    justify-content: center;
    align-items: center;
}

.BtnShell {
    display: flex;
    justify-content: center;
    padding: 20px;
}

.updatebtn {
    width: 90px;
    height: 40px;
    color: var(--text-color);
    background-color: var(--background-color);
    border-radius: 20px;
    border: 10px solid var(--background-color);
    margin: 0 15px;
    transition: transform 0.1s;
    transform: scale(1);
    display: flex;
    justify-content: center;
    align-items: center;
}

.clicked {

    justify-content: center;
    align-items: center;

    font-size: 120%;
    font-weight: bold;

    transform: scale(1.2) translateY(-10px);
}



.AccordionShell {
    width: 70vw;
    height: 30vh;
    display: flex;
}

.box {
    overflow: hidden;
    transition: 0.3s;
    margin: 0 15px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    border-radius: 20px;
    border: 10px solid var(--background-color);
    background-color: var(--background-color);
}

.box>img {
    width: 200%;
    height: 100%;
    object-fit: cover;
    transition: 0.4s;
}

.box>span {
    font: 300 1.3vw "";
    text-align: center;
    color: var(--text-color);
    height: 15%;
    display: flex;
    justify-content: center;
    align-items: center;
}

.box:hover {
    height: 50vh;
    margin-bottom: 0;
    flex-basis: 40%;
}

.box:hover>img {
    width: 100%;
    height: 100%;
}
</style>