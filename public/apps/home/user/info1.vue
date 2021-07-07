<template>
  <div>用户信息 {{userId}}</div>
</template>
<script>

export default {
  data(){
    return {
      userId : 0
    }
  },
  mounted(){
    this.userId = this.$route.params.userid
  }
}
</script>
