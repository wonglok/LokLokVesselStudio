<template>
<div class="full">

  <div class="timeline-items-row">
    <div class="timeline-items first">
      <div class="timeline-item timeline-button" @click="goPlay" v-if="isTimelineMode">Play</div>
      <div class="timeline-item timeline-button" @click="goPause" v-if="!isTimelineMode">Pause</div>
      <div class="timeline-item timeline-button" @click="goRestart">Restart</div>
    </div>
    <div class="timeline-items second">
      <div class="timeline-item">Timeline Scale <input type="number" class="timeline-input" v-model="scaler" min="1" max="3" step="0.1" /></div>
      <div class="timeline-item">Length <input type="number" class="timeline-input" :value="scenetime" @input="(e) => { let v = e.target.value; universe.options.scenetime = v; }" min="1" step="1" /></div>
      <div class="timeline-item">Timeline Scale <input type="number" class="timeline-input" v-model="scaler" min="1" max="3" step="0.1" /></div>
      <div class="timeline-item">Time: <span v-if="universe && universe.time">{{ (universe.time).toFixed(1) }}</span></div>
    </div>

  </div>
  <div class="track-rows" ref="tracker" @mousemove="(evt) => { onHover(evt); }">
    <div class="track-scroll" @scroll="onScroll">
      <div :style="getWidthTrack({ rt, irt })" class="track tracker-block" :key="irt" v-for="(rt, irt) in universe.stars" :ref="'line'">
        <div @click="$emit('onselect', { renderable: rt })" class="track-title" :style="{ cursor: 'pointer', paddingLeft: '20px', transform: `translate3d(${varying.lefter}px,0,1px)`, 'white-space': 'pre' }">{{ rt.word.starType.split('\n').shift().slice(0, 30) }}...</div>
        <frame-set @onselect="$emit('onselect', { renderable: rt })" :e="irt / universe.stars.length"  v-if="rt" :renderable="rt" :scenetime="scenetime" :maxwidth="maxwidth"></frame-set>
      </div>
    </div>
    <div ref="marker" class="time-cursor"></div>
  </div>
</div>
</template>

<script>
module.exports = {
  components: {
    ...window.Compos
  },
  props: {
    wordID: {},
    universe: {}
  },
  data() {
    return {
      realtime: {
        newTime: 0,
        lefter: 0
      },
      varying: {
        newTime: 0,
        lefter: 0
      },
      scaler: 1,
      markerPX: 0,
      maxwidth: 1
    };
  },
  computed: {
    isTimelineMode () {
      return this.universe.timemode === 'timeline'
    },
    varTime () {
      return this.varying.newTime;
    },
    time () {
      return this.universe.addedTime
    },
    scenetime () {
      return this.universe.options.scenetime;
    }
  },
  watch: {
    varTime () {
      if (this.isTimelineMode) {
        let markerPX = (this.varTime / this.scenetime) * this.maxwidth - this.realtime.lefter;
        this.$refs.marker.style.left = (0.00001 + markerPX) + "px";
        this.universe.time = this.varTime
        this.universe.addedTime = this.varTime
      }
    },
    time () {
      if (!this.isTimelineMode) {
        let markerPX = (this.time / this.scenetime) * this.maxwidth - this.realtime.lefter;
        this.$refs.marker.style.left = (0.00001 + markerPX) + "px";
        // this.universe.time = this.universe.addedTime = this.time;
      }

      this.universe.time = this.time;
      this.universe.addedTime = this.time;
    },
    markerPX () {
      // this.$emit('onhover', {
      //   percentage: (this.markerPX + this.realtime.lefter) / this.maxwidth,
      //   at: this.markerPX,
      //   full: this.maxwidth
      // })

      this.realtime.newTime =
        ((this.markerPX + this.realtime.lefter) / this.maxwidth) *
        this.universe.options.scenetime;

      // this.universe.time =
      //   ((this.markerPX + this.realtime.lefter) / this.maxwidth) *
      //   this.universe.options.scenetime;
    },
    scenetime() {
      this.refresh();
    },
    scaler() {
      this.refresh();
    }
  },
  mounted() {
    console.log(this.scenetime);
    this.refresh();
    let rAF = () => {
      this.rAFID = window.requestAnimationFrame(rAF);
      this.varying.lefter += (this.realtime.lefter - this.varying.lefter) * 0.123
      this.varying.newTime += (this.realtime.newTime - this.varying.newTime) * 0.123
    };
    this.rAFID = window.requestAnimationFrame(rAF);
  },
  beforeDestroy() {
    window.cancelAnimationFrame(this.rAFID);
  },
  methods: {
    goRestart () {
      this.universe.resetTime();
      this.universe.time = this.time;
      this.universe.addedTime = this.time;
      this.universe.timemode = "play";
    },
    goPlay() {
      this.universe.timemode = "play";
    },
    goPause() {
      this.universe.timemode = "timeline";
    },
    refresh() {
      this.prepTrackerInfo();
    },
    getScaler() {
      return this.scaler;
    },
    getFullWidth() {
      return this.scenetime * 15 * this.scaler * 2;
      // return this.$refs['time-track'].getBoundingClientRect().width
    },
    getWidthTrack({ rt, irt }) {
      let w = this.getFullWidth() * this.getScaler();
      let e = irt / this.universe.stars.length;
      let satuation = 30;
      let light = 80;

      if (this.wordID === rt.id) {
        satuation = 100;
        light = 50;
      }
      if (!e) {
        e = 0
      }
      return {
        backgroundColor: `hsla(${(e * 360).toFixed(
          0
        )}, ${satuation}%, ${light}%, 1.0)`,
        width: w + "px"
      };
    },
    prepTrackerInfo() {
      this.maxwidth = this.getFullWidth() * this.getScaler();
    },
    onAdd(evt) {
      this.$emit("onadd", evt);
      console.log(evt);
    },
    onselect(evt) {
      this.$emit("onselect", evt);
      console.log(evt);
    },
    onHover(evt) {
      this.universe.timemode = "timeline";

      let tracker = this.$refs["tracker"].getBoundingClientRect();

      // let left = this.$refs['tracker'].scrollLeft || 0
      this.markerPX = -tracker.left + evt.clientX;
      // this.$refs["marker"].style.left = this.markerPX + "px";
    },
    onScroll(evt) {
      this.realtime.lefter = evt.target.scrollLeft;
      // console.log(this.realtime.lefter)

      // this.$nextTick(() => {
      //   this.$refs['time-track'].scrollLeft = evt.target.scrollLeft
      // })
    }
  }
};
</script>

<style scoped>
.track-rows {
  position: relative;
  border-top: transparent solid 1px;
  border-right: transparent solid 1px;
  border-left: transparent solid 1px;
  border-bottom: transparent solid 1px;

  box-sizing: border-box;
  width: 100%;
  height: calc(100% - 35.12px);
  min-height: 200px;
}
.track-scroll {
  width: 100%;
  max-height: 250px;
  overflow: auto;
  /* padding-bottom: 15px; */
}
.time-cursor {
  cursor: pointer;
  height: 100%;
  width: 1px;
  background-color: red;
  position: absolute;
  top: 0px;
  left: 10px;
  transform: translate3d(0, 0, 0.1px);
}

/*
.time-track {
  position: relative;
  top: 0px;
  overflow: hidden;
  width: 100%;
  height: 45px;
  box-sizing: border-box;
}
.time-interval {
  display: inline-block;
  width: 1px;
  height: 44px;
  background-color: grey;
  line-height: 44px;
  position: absolute;
  top: 0px;
  left: 0px;
}
.time-interval-2 {
  display: inline-block;
  width: 1px;
  height: 20px;
  background-color: grey;
  line-height: 44px;
  position: absolute;
  bottom: 0px;
  left: 0px;
}
*/

.track-title {
  position: absolute;
  top: 0px;
  left: 0px;
}

.track {
  position: relative;
  height: 20px;
  box-sizing: border-box;
  border-bottom: black solid 1px;
  line-height: 20px;
  width: 100%;
}
.track:last-child {
  border-bottom: none;
}

.timeline-items{
  height: calc(35.12px);
  line-height: 35.12px;
  display: flex;
  justify-content: space-between;
}

.timeline-items-row{
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.first.timeline-items{
  width: 300.1234px;
}
.second.timeline-items{
  width: calc(100% - 300.1234px);
}
.timeline-item{
  text-align: center;
  width: 50%;
  background-image: linear-gradient(45deg, rgba(255,255,255,0.4), transparent);
}

input[type="number"].timeline-input{
  appearance: none;
  height: 17px;
  line-height: 17px;
  padding: 0px;
  background-color: transparent;
  border: 1px solid transparent;
  /* border-radius: 4px; */
  box-shadow: none;
  box-sizing: border-box;
  width: 40px;
  text-align: right;
  margin-bottom: 0px;
  text-decoration: underline;
}
</style>