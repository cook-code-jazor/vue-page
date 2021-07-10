<template>
  <div>{{name}} <router-link to="/user/index">会员中心</router-link></div>
</template>
<script>
  export default {
    name : 'index',
    data: function(){
      return {
        name: 'hello vue!'
      }
    }
  }
</script>
