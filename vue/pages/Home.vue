<template>
<div class="full">
  <editor class="full">
  </editor>
</div>
</template>

<script>
module.exports = {
  components: {
    ...window.Compos
  },
  data () {
    return {
      universe: false,
      toucher: false
    }
  },
  mounted() {
    // this.toucher = this.$refs['toucher']

  },
  methods: {
    start () {

    }
  }
}
</script>

<style scoped>

</style>
