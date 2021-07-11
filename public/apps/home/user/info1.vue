<template>
  <div>
    <div>用户信息 {{userId}}  {{age1}}</div>
    <p><a href="javascript:void(0)" @click="addOne">加1</a></p>
  </div>
</template>
<script>

export default {
  data : function(){
    return {
      userId : 0
    }
  },
  computed: App.store.getter({
      age1 : function(store){return  store.age}
    }),
  mounted : function(){
    this.userId = this.$route.params.userid
  },
  methods: {
    addOne: function(){
      App.store.commit('age', this.age1+1)
    }
  }
}
</script>
