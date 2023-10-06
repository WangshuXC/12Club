<template>
    <div class="data-page">
        <div class="data-list">
            <div v-for="(row, rowIndex) in groupRows(data_List, 3)" :key="rowIndex">
                <div class="data-row">
                    <div v-for="(data, dataIndex) in row" :key="'data-' + dataIndex" class="data-item">
                        <div class="data-item-content">
                            <div class="data-info">
                                <div class="data-name">
                                    <a :href="nowurl + '/' + data.id">{{ data.name }}</a>
                                </div>
                                <div class="data-update">
                                    <a>最近更新：第{{ data.latestEpisode }}话</a>
                                </div>
                                <div class="data-update-time">
                                    <a>最近更新日期：{{ data.latestUpdate }}</a>
                                </div>
                                <div class="data-subteam">
                                    <a>字幕组：{{ data.subteam }}</a>
                                </div>
                            </div>
                            <div class="data-thumbnail">
                                <a :href="nowurl + '/' + data.id">
                                    <img :src="data.pictureUrl" alt="">
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
    
<script>
import axios from 'axios';
import { api } from '../main';
export default {
    data: () => ({
        data_List: [],
        nowurl: "",
    }),
    mounted() {
        const baseUrl = api.baseUrl;

        const url = window.location.pathname;
        this.nowurl = url
        let requestUrl;

        switch (url) {
            case '/anime':
                requestUrl = `${baseUrl}/anime`;
                break;
            case '/comic':
                requestUrl = `${baseUrl}/comic`;
                break;
            case '/novel':
                requestUrl = `${baseUrl}/novel`;
                break;
            default:
                console.log('Invalid URL');
                return;
        }

        axios.get(requestUrl)
            .then(response => {
                this.data_List = response.data;
            })
            .catch(error => {
                console.log(error);
            });
    },
    methods: {
        groupRows(list, rowSize) {
            const rows = [];
            let rowIndex = 0;
            list.forEach((item, index) => {
                if (index % rowSize === 0) {
                    rows[rowIndex] = [item];
                } else {
                    rows[rowIndex].push(item);
                }
                if (index % rowSize === rowSize - 1) {
                    rowIndex++;
                }
            });
            return rows;
        },
    },
};
</script>
    
<style>
@import '@/assets/css/page.css';
</style>