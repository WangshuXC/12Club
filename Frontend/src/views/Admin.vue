<template>
    <div>
        <h1>管理员页面</h1>
    </div>
</template>

<script>
export default {
    name: 'Admin',
    data() {
        return {
            adminIPs: [], // 存储管理员IP列表
            userIP: '', // 当前用户的IP
            isIPValid: false, // IP地址有效性标识
        };
    },
    created() {
        this.fetchAdminIPs(); // 在组件创建时获取管理员IP列表
    },
    methods: {
        fetchAdminIPs() {
            fetch('/api/admin')
                .then(response => response.json())
                .then(data => {
                    this.adminIPs = data.adminIPs; // 更新管理员IP列表数据
                    this.userIP = data.userIP; // 获取当前用户的IP
                    this.checkIPValidity(); // 验证IP的有效性
                })
                .catch(error => {
                    console.error(error);
                });
        },
        checkIPValidity() {
            this.isIPValid = this.adminIPs.includes(this.userIP); // 检查当前用户的IP是否存在于管理员IP列表中
            if (!this.isIPValid) {
                this.$router.push('/404'); // 当IP无效时，跳转到404页面
            }
        },
    },
};
</script>



<style scoped>
/* 样式 */
</style>
