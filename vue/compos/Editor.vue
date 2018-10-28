<template>
<div class="full editor shy" style="visibility: hidden;">

  <div class="menu-top u-cf">
    <div class="menu-top-brand">
      <div class="menu-label">LokLok Vessel Studio</div>
    </div>
    <div class="menu-top-item">
      <div class="menu-label">🌈File</div>
      <div class="sub-menu">
        <div class="sub-menu-item" @click="save">🗼Save File</div>
        <div class="sub-menu-item" @click="() => { $refs['loadjsondom'].click() }">🗽Load File</div>
        <input type="file" style="display:none;" accept="application/json" ref="loadjsondom" @change="(evt) => { if (evt.target.files) { loadJSON({ file: evt.target.files[0] }) } }" />
      </div>
    </div>
    <div class="menu-top-item">
      <div class="menu-label">👑Help</div>
    </div>
    <div class="menu-top-item">
      <div class="menu-label" @click="getDeps">🥰 Download Banner</div>
    </div>
    <div class="menu-top-logo u-pull-right">
      <div class="brand-label"><span>🦄</span></div>
    </div>
  </div>

  <div class="menu-left">
    <div class="renderable-list" v-show="showLeftList === 'timeline'">
      <div class="renderable-item" :key="word.id + 'renderable-list'" v-for="word in universe.words" :class="{ 'is-active': word.id === wordID }">
        <div class="renderable-item-text u-cf" @mouseover=" wordID = word.id">
          <div class="u-pull-left"
          >{{ word.starType }}</div>
          <div class="u-pull-right">
            <span class="clone-icon icfn" @click="removeWord({ word: word })" v-show="universe.words.length > 1">
              🗑
            </span>
            <span class="clone-icon icfn" @click="cloneWord({ word: word })" >
              🐑
            </span>
            <span class="edit-icon icfn" @click="showLeftList = 'itemdetail'; wordID = word.id" >
              📝
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="renderable-list" v-show="showLeftList === 'scene'">

      <div class="renderable-item" :key="vi" v-for="(view, vi) in universe.views"
      :class="{ 'is-active': view.id === viewID }">
        <div class="renderable-item-text u-cf" @mouseover="editingFile = 'stage.js'; viewID = view.id; loopCurrentView();">
          <div class="u-pull-left">{{ view.viewType }}</div>
          <div class="u-pull-right">
            <span class="clone-icon icfn" @click="removeView({ view: view })" v-show="universe.views.length > 1" >
              🗑
            </span>
            <span class="clone-icon icfn" @click="cloneView({ view: view })" >
              🐑
            </span>
            <input type="number" class="timer" v-model="view.length" @input="(evt) => { view.length = Number(evt.target.value); }" />
            ⏱
          </div>
        </div>
      </div>

    </div>
    <div class="renderable-list" v-show="showLeftList === 'itemdetail'" v-if="currentWord && currentWord.codes">
      <div class="renderable-item" :key="fi" v-for="(file, fi) in currentWord.codes"

      @mouseover="editingFile = file.name; loopCurrentAnimation(); "
      :class="{ 'is-active': file.name === editingFile }">
        <div class="renderable-item-text u-cf" >
          <div class="u-pull-left">{{ file.name }}</div>
          <div class="u-pull-right">
            😎
          </div>
        </div>
      </div>
    </div>
  </div>

  <div class="content-tabs">
    <div class="content-tab-item" :class="{ 'is-active': showLeftList === 'timeline' }" @mouseover="playMovie(); editingFile = false; showLeftList = 'timeline'">
      Preview
    </div>
    <div class="content-tab-item" v-if="currentWord" :class="{ 'is-active': editingFile === 'engine.js' }" @mouseover="loopCurrentAnimation(); showLeftList = 'itemdetail'; editingFile = 'engine.js';">Engine</div>
    <div class="content-tab-item" v-if="currentWord" :class="{ 'is-active': editingFile === 'fadein.js' }" @mouseover="loopCurrentAnimation(); showLeftList = 'itemdetail'; editingFile = 'fadein.js';">Fade in</div>
    <div class="content-tab-item" v-if="currentWord" :class="{ 'is-active': editingFile === 'inbetween.js' }" @mouseover="loopCurrentAnimation(); showLeftList = 'itemdetail'; editingFile = 'inbetween.js';">InBetween</div>
    <div class="content-tab-item" v-if="currentWord" :class="{ 'is-active': editingFile === 'fadeout.js' }" @mouseover="loopCurrentAnimation(); showLeftList = 'itemdetail'; editingFile = 'fadeout.js';">Fade out</div>
    <div class="content-tab-item" v-if="currentWord" :class="{ 'is-active': editingFile === 'timebox.js' }" @mouseover="loopCurrentAnimation(); showLeftList = 'itemdetail'; editingFile = 'timebox.js';">Time Box</div>
  </div>

  <div class="content-box">
    <healing @universe="(v) => { universe = v; load() }"></healing>
  </div>

  <div class="content-overlay" v-if="editingFile">
    <ace v-if="editingFile && currentWord && editingFile === file.name && currentWord.codes" :name="file.name" :key="'ace - words ' + currentWord.id + fi" v-for="(file, fi) in currentWord.codes" v-model="file.text" @input="(v) => { universe.stars.find(s => s.id === currentWord.id).onAceKeystroke({ file, value: v }) }"></ace>
    <ace v-if="editingFile && currentView && editingFile === file.name && currentView.codes" :name="file.name" :key="'ace - views ' + currentView.id + fi" v-for="(file, fi) in currentView.codes" v-model="file.text" @input="(v) => { universe.stages.find(s => s.id === currentView.id).onAceKeystroke({ file, value: v }) }"></ace>
  </div>

  <div class="menu-left-toggles">
    <div class="menu-left-toggle-item" :class="{ 'is-active': showLeftList === 'scene' }" @mouseover="showLeftList = 'scene'">
      Scene
    </div>
    <div class="menu-left-toggle-item" :class="{ 'is-active': showLeftList === 'timeline' }" @mouseover="showLeftList = 'timeline'; editingFile = false;">
      Timeline
    </div>
    <div v-if="currentWord" class="menu-left-toggle-item" :class="{ 'is-active': showLeftList === 'itemdetail' }" @mouseover="showLeftList = 'itemdetail'">
      Animation
    </div>
  </div>

  <div class="timeline-box">
    <timeline
		v-if="universe && universe.options.scenetime"
		:universe="universe"
    :word-i-d="wordID"
		@onselect="({ renderable }) => {
			wordID = renderable.word.id
		}"
  	></timeline>

    <!-- <remixer v-if="universe" :universe="universe"></remixer> -->
  </div>

</div>
</template>

<script>
module.exports = {
  components: {
    ...window.Compos
  },
  data() {
    return {
      viewID: false,
      showLeftList: "timeline",
      PI: Math.PI,
      wordID: false,
      editingFile: false,
      universe: false
    };
  },
  computed: {
    // now option
    currentOption() {
      if (!this.universe) {
        return false;
      }
      return this.universe.options;
    },
    // now item
    currentWord() {
      if (!this.universe) {
        return false;
      }
      return this.universe.words.find(w => w.id === this.wordID);
    },
    // now item
    currentView() {
      if (!this.universe || !this.viewID) {
        return false;
      }
      return this.universe.views.find(w => w.id === this.viewID);
    }
  },
  methods: {
    getDeps () {
      return Promise.all([].map.call(document.querySelectorAll('script[require="dep"]'), (i) => {
        return fetch(i.src).then(r => r.text())
      })).then((i) => {
        return i.join('\n')
      }).then((deps) => {
        console.log(deps)
        let name = window.prompt('banner name?');

        let html = this.composeHTML({ deps: deps, restore: this.universe.save(), ns: name })

        var a = document.createElement('a')
        a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }))
        a.download = 'banner-' + name + '.html'
        a.click()
      })
    },
    composeHTML ({ deps, restore, ns = 'ns' }) {
      let s1 = `${'<'}${'script'}${'>'}`;
      let s2 = `${'<'}${'/'}${'script'}${'>'}`
      return `
  <style>

  html, body, .full{
    margin: 0px;
  }

  </style>
  <div id="app_${ns}"></div>

    ${s1}
    ${deps}
    ${s2}

    ${s1}

    window.restore = ${JSON.stringify(restore)};

    (function(){
        window.addEventListener('DOMContentLoaded', () => {
          main();
        }, false)

        var main = (() => {
          let getAppDiv = () => {
            let dom = document.querySelector('#app_${ns}')
            dom.style.width = '100vw';
            dom.style.height = '350px';
            return dom
          }

          let rect = getAppDiv().getBoundingClientRect();
          let size = {
            w: rect.width,
            h: rect.height,
            width: rect.width,
            height: rect.height,
            dpi: window.devicePixelRatio,
          }

          let universe = new Universe({ mounter: getAppDiv(), size });

          universe.load({ restore: window.restore })
            .then(() => {
              universe.run()
            });

          window.addEventListener('resize', () => {
            let rect = getAppDiv().getBoundingClientRect();
            let size = {
              w: rect.width,
              h: rect.height,
              width: rect.width,
              height: rect.height,
              dpi: window.devicePixelRatio,
            }
            universe.setSize({ size })
          }, false)

        });



      }());
    ${s2}

      `
    },
    removeWord ({ word }) {
      let idx = this.universe.words.findIndex(w => w.id === word)
      this.universe.words.splice(idx, 1)
      this.$forceUpdate()
    },
    removeView ({ view }) {
      let idx = this.universe.views.findIndex(v => v.id === view)
      this.universe.views.splice(idx, 1)
      this.$forceUpdate()
    },
    save() {
      var json = this.universe.save();
      json = JSON.stringify(json);
      var a = document.createElement("a");
      a.href = URL.createObjectURL(
        new Blob([json], { type: "application/json" })
      );
      let ask = window.prompt('save as?');
      if (ask) {
        ask += '-';
      }
      a.download = `LLVS-${ask}.json`;
      a.click();
    },
    loadJSON({ file }) {
      let reader = new FileReader();
      reader.onload = () => {
        this.universe.load({ restore: JSON.parse(reader.result) })
          .then(this.postLoading);
      };
      reader.readAsText(file);
    },
    cloneWord({ word }) {
      let newItem = JSON.parse(JSON.stringify(word));
      newItem.id = Planet.getID();
      this.universe.words.push(newItem);
      this.$forceUpdate()
    },
    cloneView({ view }) {
      let newItem = JSON.parse(JSON.stringify(view));
      newItem.id = Planet.getID();
      this.universe.views.push(newItem);
      this.$forceUpdate()
    },
    playMovie() {
      this.universe.resetTime();
      this.universe.timemode = "play";
    },
    loopCurrentAnimation() {
      this.universe.timemode = "loop";
      this.universe.loop = {
        start: this.currentWord.frameset.start,
        end: this.currentWord.frameset.end
      };
    },
    postLoading () {
      this.$forceUpdate();
      this.wordID = this.universe.words[this.universe.words.length - 1].id;
      this.viewID = this.universe.views[this.universe.views.length - 1].id;
      this.editingFile = false;
      this.showLeftList = "timeline";
    },
    loopCurrentView() {
      if (!this.currentView) {
        return
      }
      this.universe.resetTime();
      let idx = this.universe.stages.findIndex(s => s.id === this.currentView.id)
      let endTime = this.universe.stages.reduce((c, s, si) => {
        if (si <= idx) {
          c += Number(s.view.length)
        }
        return c
      }, 0)
      let startTime = (endTime - this.currentView.length);

      this.universe.time = startTime;
      this.universe.addedTime = startTime;
      this.$nextTick(() => {
        this.universe.timemode = "loop";
        this.universe.loop = {
          start: startTime,
          end: endTime
        };
      });
    },
    load() {
      let view1 = {
            id: Planet.getID(),
            viewType: "Stage",
            length: 15,
            codes: [
              {
                protected: true,
                isManinfest: true,
                name: 'stage.js',
                ext: 'javascript',
                text: `// global: THREE
const onCreate = ({ view, scope, files, size, renderer, scene }) => {
  scope.size = size

  scope.camera = new THREE.PerspectiveCamera(75, size.w / size.h, 1, 1000)

  if (!scope.composer) {
    var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( size.w * size.dpi, size.h * size.dpi ), 1.5, 0.5, 0.85); //1.0, 9, 0.5, 512);
    bloomPass.renderToScreen = true;
    var composer = new THREE.EffectComposer( renderer );

    var renderPass = new THREE.RenderPass( scene, scope.camera );
    composer.addPass(renderPass);
    composer.addPass(bloomPass);
    scope.composer = composer;
    scope.bloomPass = bloomPass;
  }

  scope.refresh = () => {
    scope.camera.position.z = 100;
    scope.useComposer = true;
    scope.bloomPass.strength = 1.5;
    scope.bloomPass.radius = 1;
    scope.bloomPass.threshold = 0.4;
    scope.background = '#232323';
    scope.backgroundColor = new THREE.Color(scope.background)
  }
  onResize({ size: scope.size, scope, renderer })
}
const onDestroy = ({ view, scope, files, size }) => {
}
const onKeyStroke = ({ view, scope, files, size }) => {
  scope.refresh()
}
const onResize = ({ size, scope, renderer }) => {
  scope.camera.aspect = size.w / size.h
  scope.camera.updateProjectionMatrix()
  scope.size = size
  renderer.setSize(size.w, size.h)
  renderer.setPixelRatio(size.dpi)
  // console.log(scope)
  if (scope.composer) {
    scope.composer.setSize(size.w * size.dpi, size.h * size.dpi)
  }
  if (scope.bloomPass) {
    scope.bloomPass.setSize(size.w * size.dpi, size.h * size.dpi)
  }
};

const onCompute = ({ view, scope, files, renderer, size, scene }) => {
  scene.background = scope.backgroundColor;
  if (scope.useComposer) {
    scope.composer.render()
  } else {
    renderer.render(scene, scope.camera)
  }
}

module.exports = {
  onResize,
  onCreate,
  onDestroy,
  onKeyStroke,
  onCompute
}`
              },
            ]
          }
      let view2 = JSON.parse(JSON.stringify(view1));
      view2.id = Planet.getID()
      let restore = {
        words: [Planet.speak()],
        options: {
          scenetime: 30
        },
        views: [
          view1,
          view2
        ]
      };

      setTimeout(() => {
        this.universe.load({ restore }).then(this.postLoading);
      }, 500);
    }
  }
};
</script>

<style scoped>
@import url("../../css/editor.css");
.shy {
  visibility: visible !important;
}
</style>