<template>
  <div>
    <h3>会员中心 <router-link to="/">返回首页</router-link></h3>
    <div><router-link to="/user/index">中心</router-link> | <router-link to="/user/info">信息</router-link> | <router-link to="/user/info/123456">信息1</router-link></div>
    <router-view />
  </div>
</template>
<script>
  export default {
    name : 'index',
    data(){
      return {
        name: 'hello vue!'
      }
    }
  }
</script>
