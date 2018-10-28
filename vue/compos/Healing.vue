<template>
<div ref="webgl" class="full">
</div>
</template>

<script>
module.exports = {
  props: {
    toucher: {}
  },
  data () {
    return {
      universe: false
    }
  },
  mounted () {
    let rect = this.$refs['webgl'].getBoundingClientRect();
    let size = {
      w: rect.width,
      h: rect.height,
      width: rect.width,
      height: rect.height,
      dpi: window.devicePixelRatio,
    }

    this.universe = new Universe({ mounter: this.$refs['webgl'], size });
    this.universe.run()

    this.$emit('universe', this.universe)

    window.addEventListener('resize', () => {
      let rect = this.$refs['webgl'].getBoundingClientRect();
      let size = {
        w: rect.width,
        h: rect.height,
        width: rect.width,
        height: rect.height,
        dpi: window.devicePixelRatio,
      }
      this.universe.setSize({ size })
    }, false)
  }
}
</script>

<style scoped>
.healing{
  /* position: fixed;
  top: 0px;
  right: 0px; */
  /* width: 512px;
  height: 512px; */
}
</style>