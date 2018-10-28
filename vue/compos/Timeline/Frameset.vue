<template>
<div class="full" @mousedown="(e) => { onMD(e, selection) }"  @mousemove="(e) => { onMM(e, selection) }"  @mouseup="(e) => { onMU(e, selection) }" >
  <div class="frameset" :style="getFrameSetStyle({ renderable, maxwidth, scenetime })"  @click="$emit('onselect')"  >

    <div class="starting" :style="getStartingStyle({ renderable, maxwidth, scenetime })">
      <div class="diamond afterStart-diamond"  @mousedown="() => { selection = 'afterStart'; }" ></div>
    </div>
    <div class="ending" :style="getLeavingStyle({ renderable, maxwidth, scenetime })" >
      <div class="diamond beforeEnd-diamond" @mousedown="() => { selection = 'beforeEnd'; }"  ></div>
    </div>

    <div class="during" :style="getDuringStyle({ renderable, maxwidth, scenetime, e })" @mousedown="() => { selection = 'all'; }"></div>
    <div class="diamond start-diamond" @mousedown="() => { selection = 'start'; }" ></div>
    <div class="diamond end-diamond"  @mousedown="() => { selection = 'end'; }" ></div>

  </div>
</div>
</template>

<script>
module.exports = {
  props: {
    e: {},
    scenetime: {},
    renderable: {},
    maxwidth: {}
  },
  data () {
    return {
      selection: '',
      fs: {
        isDown: false,
        accu: 0,
        ts: 0
      }
    }
  },
  mounted () {
  },
  methods: {
    onMD (evt) {
      this.fs.isDown = true
      this.fs.ts = evt.pageX
    },
    onMM (evt, sel) {
      if (this.fs.isDown) {
        let px = evt.pageX
        let delta = this.fs.ts - px
        let deltaTime = delta / this.maxwidth * this.scenetime

        if (sel === 'all') {
          this.renderable.word.frameset.start -= deltaTime
          this.renderable.word.frameset.afterStart -= deltaTime
          this.renderable.word.frameset.beforeEnd -= deltaTime
          this.renderable.word.frameset.end -= deltaTime
        } else if (sel === 'start') {
          this.renderable.word.frameset.start -= deltaTime
          this.renderable.word.frameset.afterStart -= deltaTime
        } else if (sel === 'afterStart') {
          this.renderable.word.frameset.afterStart -= deltaTime
        } else if (sel === 'beforeEnd') {
          this.renderable.word.frameset.beforeEnd -= deltaTime
        } else if (sel === 'end') {
          this.renderable.word.frameset.end -= deltaTime
          this.renderable.word.frameset.beforeEnd -= deltaTime
        }

        this.fs.accu -= deltaTime
        this.fs.ts = px
      }
    },
    onMU (e, sel) {
      this.fs.isDown = false

      if (sel === 'all') {
        this.renderable.word.start += this.fs.accu
        this.renderable.word.afterStart += this.fs.accu
        this.renderable.word.beforeEnd += this.fs.accu
        this.renderable.word.end += this.fs.accu
      } else if (sel === 'start') {
        this.renderable.word.start += this.fs.accu
        this.renderable.word.afterStart += this.fs.accu
      } else if (sel === 'afterStart') {
        this.renderable.word.afterStart += this.fs.accu
      } else if (sel === 'beforeEnd') {
        this.renderable.word.beforeEnd += this.fs.accu
      } else if (sel === 'end') {
        this.renderable.word.end += this.fs.accu
        this.renderable.word.beforeEnd += this.fs.accu
      }

      this.fs.accu = 0
      // this.specs.save()
    },
    getDuringStyle ({ renderable, maxwidth, scenetime, e }) {
      let fs = renderable.word.frameset
      let left = (fs.afterStart - fs.start) / (fs.end - fs.start) * 100
      let width = (fs.beforeEnd - fs.afterStart) / (fs.end - fs.start) * 100

      let style = {
        'left': left + '%',
        'width': width + '%'
      }
      return style
    },
    getStartingStyle ({ renderable, maxwidth, scenetime }) {
      let fs = renderable.word.frameset
      // let tt = scenetime
      // let itemWidth = (((fs.end - fs.start) / tt) * maxwidth)
      let left = (0)
      let width = (fs.afterStart - fs.start) / (fs.end - fs.start) * 100

      let style = {
        // 'color': 'red',
        'left': left + '%',
        'width': width + '%'
      }
      return style
    },
    getLeavingStyle ({ renderable, maxwidth, scenetime }) {
      let fs = renderable.word.frameset
      // let tt = scenetime
      // let itemWidth = (((fs.end - fs.start) / tt) * maxwidth)
      let right = 0
      let width = (fs.end - fs.beforeEnd) / (fs.end - fs.start) * 100

      let style = {
        // 'color': 'red',
        'right': right + '%',
        'width': width + '%'
      }
      return style
    },
    getFrameSetStyle ({ renderable, maxwidth, scenetime }) {
      let fs = renderable.word.frameset
      let tt = scenetime
      let style = {
        // 'color': 'red',
        'left': ((fs.start / tt) * maxwidth) + 'px',
        'width': (((fs.end - fs.start) / tt) * maxwidth) + 'px'
      }
      return style
    }
  }
}
</script>

<style scoped>
.frameset {
  cursor: pointer;
  position: absolute;
  top: 0px;
  height: 100%;
  background-color: rgba(117, 117, 117, 0.2);
}
.starting {
  position: absolute;
  top: 0px;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
}
.ending {
  position: absolute;
  top: 0px;
  height: 100%;
  background: rgba(255, 255, 255, 0.5);
}
.during {
  position: absolute;
  top: 0px;
  height: 100%;
  background: rgba(165, 165, 165, 0.5);
}
.overall{
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100%;
  height: 100%;
}
.label{
  margin-left: 50px;
  width: 60px;
  overflow: hidden;
}

.diamond{
  z-index: 100;
  position: absolute;
  height: 11.1px;
  top: calc(50% - (11.1px / 2));
  width: 11.1px;
  background-color: rgba(255,255,255,0.5);
  border: grey solid 1px;
}

.center-diamond{
  left: 50%;
  transform:  scale(0.5) translateX(calc(11.1px / -2)) rotate(45deg) translateZ(10px);
}

.start-diamond{
  transform:  translateX(calc(11.1px / -2)) rotate(45deg) translateZ(10px);
}
.end-diamond{
  transform:  translateX(calc(11.1px / 2)) rotate(45deg) translateZ(10px);
  right: 0px;
}
.afterStart-diamond{
  transform: translateX(calc(11.1px / 2)) rotate(45deg) translateZ(10px) scale(0.9);
  right: 0px;
}
.beforeEnd-diamond{
  transform: translateX(calc(11.1px / -2)) rotate(45deg) translateZ(10px) scale(0.9);
  left: 0px;
}
</style>
