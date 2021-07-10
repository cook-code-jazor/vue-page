<template>
  <div>用户信息 {{userId}}  {{age}}</div>
</template>
<script>

export default {
  data : function(){
    return {
      userId : 0,
      age: 23
    }
  },
  computed: {
    age: App.store.getter('age')
  },
  mounted : function(){
    this.userId = this.$route.params.userid
  }
}
</script>
