<template>
<div>

	<!-- <pre>{{ universe.words }}</pre> -->
  <button @click="loadMore">Restore</button>
	<!-- <timeline
		v-if="universe && universe.options.scenetime"
		:universe="universe"

		@onselect="({ renderable }) => {
			handy = renderable.word.id
		}"
	></timeline> -->
	<ul v-if="universe.words">
    <li :key="w.id + wi + 'list'" v-for="(w, wi) in universe.words">
      <button @click="handy = w.id + ''">Edit me</button>
      <button @click="cloneMe({ word: w })">Clone me</button>
    </li>
  </ul>
  <div v-if="nop">
    <div v-if="nop.bloomPass">
      <input type="number" step="0.01" v-model="nop.bloomPass.strength" @input="() => { nop.bloomPass.strength = Number(nop.bloomPass.strength) }" />
      <input type="number" step="0.01" v-model="nop.bloomPass.radius" @input="() => { nop.bloomPass.radius = Number(nop.bloomPass.radius) }" />
      <input type="number" step="0.01" v-model="nop.bloomPass.threshold" @input="() => { nop.bloomPass.threshold = Number(nop.bloomPass.threshold) }" />
    </div>
    <div v-if="nop.background">
      <input type="color" step="0.01" v-model="nop.background" />
      <input type="text" step="0.01" v-model="nop.background" />
    </div>
  </div>
  <div v-if="nit">
    <button @click="handy = false" class="button button-primary">Close</button>
    <button @click="copyJSON" class="button button-primary">copyJSON</button>

    <div v-if="nit.position">
      pos <input type="number" v-model="nit.position.x" @input="() => { nit.position.x = Number(nit.position.x) }" />
      <input type="number" v-model="nit.position.y" @input="() => { nit.position.y = Number(nit.position.y) }" />
      <input type="number" v-model="nit.position.z" @input="() => { nit.position.z = Number(nit.position.z) }" />
    </div>
    <div v-if="nit.rotation">
      rotation <input type="number" :step="PI * 2 / 360 / 3.333" v-model="nit.rotation.x" @input="() => { nit.rotation.x = Number(nit.rotation.x) }" />
      <input type="number" :step="PI * 2 / 360 / 3.333" v-model="nit.rotation.y" @input="() => { nit.rotation.y = Number(nit.rotation.y) }" />
      <input type="number" :step="PI * 2 / 360 / 3.333" v-model="nit.rotation.z" @input="() => { nit.rotation.z = Number(nit.rotation.z) }" />
    </div>
    <div v-if="nit.scale">
      scale <input type="number" step="0.01" v-model="nit.scale.x" @input="() => { nit.scale.x = Number(nit.scale.x) }" />
      <input type="number" step="0.01" v-model="nit.scale.y" @input="() => { nit.scale.y = Number(nit.scale.y) }" />
      <input type="number" step="0.01" v-model="nit.scale.z" @input="() => { nit.scale.z = Number(nit.scale.z) }" />
    </div>

    <div v-if="nit.color1">
      color1
      <input type="number" step="0.01" v-model="nit.color1.h" @input="() => { nit.color1.h = Number(nit.color1.h) }" />
      <input type="number" step="0.01" v-model="nit.color1.s" @input="() => { nit.color1.s = Number(nit.color1.s) }" />
      <input type="number" step="0.01" v-model="nit.color1.l" @input="() => { nit.color1.l = Number(nit.color1.l) }" />
    </div>

    <div v-if="typeof nit.vs !== 'undefined'">
      Shaders
      <textarea v-model="nit.vs" cols="60" rows="120" style="height: 500px;"></textarea>
      <br />
      <textarea v-model="nit.fs" cols="60" rows="120" style="height: 500px;"></textarea>
    </div>

		<div v-if="typeof nit.frameset.starting !== 'undefined'">
      Timeline Functions
      <textarea v-model="nit.frameset.starting" cols="60" rows="120" style="height: 500px;"></textarea>
      <textarea v-model="nit.frameset.during" cols="60" rows="120" style="height: 500px;"></textarea>
      <textarea v-model="nit.frameset.leaving" cols="60" rows="120" style="height: 500px;"></textarea>
      <textarea v-model="nit.frameset.overall" cols="60" rows="120" style="height: 500px;"></textarea>
    </div>
    <!--  -->
    <textarea v-model="wordsJSON"></textarea>
  </div>


</div>
</template>

<script>
const copyToClipboard = str => {
  const el = document.createElement('textarea');
  el.value = str;
  el.setAttribute('readonly', '');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  document.body.appendChild(el);
  el.select();
  document.execCommand('copy');
  document.body.removeChild(el);
};

module.exports = {
	components: {
		...window.Compos
	},
  props: {
    universe: {}
  },
  data () {
    return {
      PI: Math.PI,
      handy: false
    }
  },
  computed: {
    wordsJSON () {
      return JSON.stringify(this.universe.words, null, '\t')
    },
    // now option
    nop () {
      return this.universe.options
    },
    // now item
    nit () {
      return this.universe.words.find(w => w.id === this.handy)
    }
  },
  methods: {
    cloneMe ({ word }) {
      let newItem = JSON.parse(JSON.stringify(word))
			newItem.id = Planet.getID()
			console.log(newItem)
      this.universe.words.push(newItem)
    },
    copyJSON () {
      copyToClipboard(this.universe.save())
		},
		add () {
		},
		loadMore () {

		}
	},

  mounted() {
		this.loadMore()
  }
}
</script>

<style scoped>

</style>