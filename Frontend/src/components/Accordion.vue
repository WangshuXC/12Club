<template>
    <div class="Accordion">
        <div class="BtnShell">
            <button class="updatebtn" @click="expandButton(0)"
                :style="{ width: expandedButtonIndex === 0 ? '150px' : '90px' }"
                :class="{ clicked: expandedButtonIndex === 0 }">
                资源更新
            </button>
            <button class="updatebtn" @click="expandButton(1)"
                :style="{ width: expandedButtonIndex === 1 ? '150px' : '90px' }"
                :class="{ clicked: expandedButtonIndex === 1 }">
                动漫更新
            </button>
            <button class="updatebtn" @click="expandButton(2)"
                :style="{ width: expandedButtonIndex === 2 ? '150px' : '90px' }"
                :class="{ clicked: expandedButtonIndex === 2 }">
                漫画更新
            </button>
            <button class="updatebtn" @click="expandButton(3)"
                :style="{ width: expandedButtonIndex === 3 ? '150px' : '90px' }"
                :class="{ clicked: expandedButtonIndex === 3 }">
                小说更新
            </button>
        </div>
        <div class="nameshell">
            <p>{{ hoveredText || '欢迎来到12社区喵' }}</p>
        </div>
        <div class="AccordionShell">
            <div class="box" v-for="(item, index) in imgListShow" :key="index" @mouseover="hoverBox(item)"
                @mouseleave="leaveBox">
                <img :src="item" />
                <span v-show="false">{{ nameListShow[index] }}</span>
            </div>
        </div>
    </div>
</template>

<script>
import axios from "axios";
import { api } from '../main';
export default {
    data() {
        return {
            expandedButtonIndex: 0,
            apiUrls: [
                `${api.baseUrl}/update0`,
                `${api.baseUrl}/update1`,
                `${api.baseUrl}/update2`,
                `${api.baseUrl}/update3`,
            ],
            imgListShow: [],
            nameListShow: [],
            imgListGet: [],
            nameListGet: [],
            hoveredText: "",
        };
    },
    methods: {
        hoverBox(item) {
            this.hoveredText = this.nameListShow[this.imgListShow.indexOf(item)];
        },
        leaveBox() {
            this.hoveredText = "";
        },
        fetchData(apiUrl) {
            axios
                .get(apiUrl)
                .then((response) => {
                    if (apiUrl == this.apiUrls[0]) {
                        this.imgListShow = response.data[0];
                        this.nameListShow = response.data[1];
                    }
                    this.imgListGet.push(response.data[0]);
                    this.nameListGet.push(response.data[1]);

                })
                .catch((error) => {
                    console.error(error);
                });
        },
        expandButton(index) {
            this.expandedButtonIndex = index;
            this.imgListShow = this.imgListGet[index];
            this.nameListShow = this.nameListGet[index];
        },
    },
    mounted() {
        for (let i = 0; i < 4; i++) {
            const apiUrl = this.apiUrls[i];
            this.fetchData(apiUrl);
        }
    },
};
</script>

    
<style>
@import '@/assets/css/accordion.css';
</style>