/* global THREE */

class Stage {
  constructor ({ id, view, size, renderer, scene }) {
    this.id = id
    this.scene = scene
    this.size = size
    this.renderer = renderer
    this.view = view

    // this.update({ view })
    this.update({ view })
    this.composer = false

    this.scope = {}
    this.manifestAPI = false
    this.view.codes.forEach((code) => {
      this.onAceKeystroke({ file: code, value: code.text })
    })
    this.setSize({ size: this.size })
    // setTimeout(() => {
    //   this.setSize({ size: this.size })
    // }, 100)
  }
  getAPI () {
    return {
      size: this.size,
      view: this.view,
      files: this.view.codes,
      scope: this.scope,
      renderer: this.renderer,
      scene: this.scene
    }
  }
  onAceKeystroke ({ file, value }) {
    let files = this.view.codes
    let oldFile = files.find(f => f.name === file.name)
    oldFile.text = value
    let _this = this
    let assigner = (key) => {
      return {
        get exports () {
          return _this[key]
        },
        set exports (v) {
          _this[key] = v
        }
      }
    }

    if (file.isManinfest) {
      try {
        let def = new Function('THREE', 'module', value)
        if (this.manifestAPI) {
          this.manifestAPI.onDestroy(this.getAPI())
        }
        //this.manifestAPI =
        def(THREE, assigner('manifestAPI'))
        this.manifestAPI.onCreate(this.getAPI())
      } catch (e) {
        console.warn(e)
        this.error = new Error('manifest wrong, cannot create createdItem')
      }
    }
    // on any file
    if (this.manifestAPI) {
      this.manifestAPI.onKeyStroke(this.getAPI())
    }
  }

  tick () {
    // if (this.scene.background !== this.bgColor) {
    //   this.scene.background = this.bgColor
    // }
  }
  // reconfig () {
  //   this.bgColor = new THREE.Color(this.view.background)
  //   if (!this.composer) {
  //     this.setupComposer({ size: this.size })
  //     this.setSize({ size: this.size })
  //   }
  //   if (this.view.bloomPass && this.bloomPass) {
  //     this.bloomPass.strength = this.view.bloomPass.strength
  //     this.bloomPass.radius = this.view.bloomPass.radius
  //     this.bloomPass.threshold = this.view.bloomPass.threshold
  //   }
  // }
  update ({ view }) {
    this.view = view
    // this.reconfig()
  }

  // hook
  onResize () {}


  setSize ({ size }) {
    this.size = size
    if (this.manifestAPI) {
      this.manifestAPI.onResize(this.getAPI())
    }
    // this.camera.aspect = size.w / size.h
    // this.camera.updateProjectionMatrix()
    // this.size = size
    // this.renderer.setSize(size.w, size.h)
    // this.renderer.setPixelRatio(size.dpi)
    // // console.log(this)
    // if (this.composer) {
    //   this.composer.setSize(size.w * size.dpi, size.h * size.dpi)
    // }
    // if (this.bloomPass) {
    //   this.bloomPass.setSize(size.w * size.dpi, size.h * size.dpi)
    // }
  }
  // setupComposer ({ size }) {
  //   if (!this.composer) {
  //     var bloomPass = new THREE.UnrealBloomPass( new THREE.Vector2( size.w * size.dpi, size.h * size.dpi ), 1.5, 0.5, 0.85); //1.0, 9, 0.5, 512);
  //     bloomPass.renderToScreen = true;
  //     var composer = new THREE.EffectComposer( this.renderer );
  //     // composer.setSize( this.rect.width, this.rect.height );

  //     var renderPass = new THREE.RenderPass( this.scene, this.camera );
  //     composer.addPass(renderPass);
  //     composer.addPass(bloomPass);
  //     this.composer = composer;
  //     this.bloomPass = bloomPass;
  //   }
  // }
  exec () {
    if (this.manifestAPI) {
      this.manifestAPI.onCompute(this.getAPI())
    }
    // if (this.view.useComposer) {
    //   this.composer.render()
    // } else {
    //   this.renderer.render(this.scene, this.camera)
    // }
  }
}

class Universe {
  constructor ({ mounter, size }) {
    this.STAR_MAP = {
      Planet
    }
    this.VIEW_MAP = {
      Stage
    }

    this.options = {
      scenetime: 50
    }

    this.mounter = mounter
    this.renderer = new THREE.WebGLRenderer({
      // preserveDrawingBuffer: true,
      antialias: true,
      alpha: true
    })
    this.scene = new THREE.Scene()
    this.camera = new THREE.PerspectiveCamera(75, size.w / size.h, 1, 1000)
    this.camera.position.z = 100;

    this.stages = []

    // this.setupComposer({ size })
    this.size = size;
    this.setSize({ size })
    this.mounter.appendChild(this.renderer.domElement)
    this.renderer.domElement.style['margin-bottom'] = '-6px'
    this.resetTime()

    this.stars = []
    this.words = []


    this.uSync = new UniverseSync()
    this.uSync.vue.$on('add-word', (word) => {
      this.onAddWord({ word })
    })
    this.uSync.vue.$on('remove-word', (word) => {
      this.onRemoveWord({ word: word })
    })
    // words
    this.uSync.vue.$on('change-word-any', (word) => {
      this.onChangeAnyWord({ word: word })
    })

    this.uSync.vue.$on('change-options', (options) => {
      this.onChangeOptions({ options })
    })

    this.uSync.vue.$on('add-view', (view) => {
      console.log(view)
      this.onAddView({ view })
    })
    this.uSync.vue.$on('remove-item', (view) => {
      this.onRemoveView({ view })
    })
    this.uSync.vue.$on('change-view-any', (view) => {
      this.onChangeAnyView({ view })
    })



    this.loop = {}
    this.timemode = 'play'; // play or timeline
    this.time = 0
  }
  onChangeOptions ({ options }) {
    this.options.scenetime = options.scenetime
  }
  reuse ({ restore = {} }) {
    return this.uSync.vue.setRestore({ words: restore.words || [], views: restore.views || [], options: restore.options || {} })
      .then(() => {
        this.words = restore.words
        this.options = restore.options
        this.views = restore.views

        this.stars.sort((a, b) => {
          return a.word.frameset.start - b.word.frameset.start
        })
        this.words.sort((a, b) => {
          return a.frameset.start - b.frameset.start
        })
      })
  }
  setSize ({ size }) {
    this.stages.forEach((stage) => {
      stage.setSize({ size })
    })
  }
  clone () {
    return JSON.parse(JSON.stringify({
      words: this.words,
      views: this.views,
      options: this.options
    }))
  }
  save () {
    return this.clone()
  }
  load ({ restore }) {
    return this.reuse({ restore: restore || {} })
      .then(() => {

      })
  }
  makeView ({ view }) {
    let newView = new this.VIEW_MAP[view.viewType]({ id: view.id, view, size: this.size, renderer: this.renderer, scene: this.scene, space: this });
    return newView;
  }
  makeStar ({ word }) {
    let star = new this.STAR_MAP[word.starType]({ id: word.id, word, space: this });
    return star;
  }
  onAddWord ({ word }) {
    console.log('add', word)
    let star = this.makeStar({ word })
    this.stars.push(star)
    this.scene.add(star.group)
  }
  onChangeAnyWord ({ word }) {
    // console.log('anychange', word)
    let star = this.stars.find(s => s.id === word.id)
    star.update({ word })
  }

  onRemoveWord ({ word }) {
    let star = this.stars.find(w => w.id === word.id)
    let idx = this.stars.findIndex(w => w.id === word.id)
    this.stars.splice(idx, 1)
    this.scene.remove(star.group)
    star.clean()
  }

  onAddView ({ view }) {
    console.log('add', view)
    let stage = this.makeView({ view })
    this.stages.push(stage)
  }
  onChangeAnyView ({ view }) {
    // console.log('anychange', view)
    let stage = this.stages.find(s => s.id === view.id)
    stage.update({ view })
  }
  onRemoveView ({ view }) {
    let stage = this.stages.find(w => w.id === view.id)
    let idx = this.stages.findIndex(w => w.id === view.id)
    this.stages.splice(idx, 1)
  }

  resetTime () {
    this.clock = new THREE.Clock()
    this.addedTime = 0
  }
  tick () {
    let delta = this.clock.getDelta()
    if (this.timemode === 'play') {
      this.addedTime += delta
      if (this.options.scenetime) {
        this.addedTime = this.addedTime % this.options.scenetime
      }
    } else if (this.timemode === 'loop') {
      this.addedTime += delta
      if (this.addedTime > this.loop.end) {
        this.addedTime = this.loop.start
      }
    } else {
      this.addedTime = this.time
    }


    this.stars.forEach((s) => {
      // s.tick({
      //   time: this.addedTime,
      //   delta
      // })
      this.updateTimine({ star: s, word: s.word, time: this.addedTime, delta })
    })
  }

  currentView (time) {
    return this.stages.find((s, i) => {
      let lastTime = this.stages.reduce((c, s, si) => {
        if (si <= i) {
          c += Number(s.view.length)
        }
        return c
      }, 0)
      return time >= (lastTime - s.view.length) && time < (lastTime)

      // return time > s.view.start && time < s.view.end
    })
  }
  renderWithCurrentView () {
    let current = this.currentView(this.addedTime)
    if (current) {
      current.tick({ time: this.addedTime })
      current.exec()
    }
  }

  exec () {
    this.tick()
    this.renderWithCurrentView()
  }
  run () {
    this.rAF = () => {
      this.rAFID = window.requestAnimationFrame(this.rAF)
      this.exec()
    }
    this.rAFID = window.requestAnimationFrame(this.rAF)
  }
  stop () {
    window.cancelAnimationFrame(this.this.rAFID)
  }
  updateTimine ({ star, word, time, delta }) {
    let fs = word.frameset
    if (!(fs && fs.enabled)) {
      return
    }

    // ---------------------------------
    // periods
    //  starting
    if (time >= fs.start && time <= fs.afterStart) {
      let progress = (time - fs.start) / (fs.afterStart - fs.start)
      star.starting({ scope: star.scope, word, delta, progress, time })
    }

    // periods
    // during
    if (time >= fs.afterStart && time <= fs.beforeEnd) {
      let progress = (time - fs.afterStart) / (fs.beforeEnd - fs.afterStart)
      star.during({ scope: star.scope, word, delta, progress, time })
    }

    // periods
    //  leaving
    if (time >= fs.beforeEnd && time <= fs.end) {
      let progress = 1.0 - (fs.end - time) / (fs.end - fs.beforeEnd)
      star.leaving({ scope: star.scope, word, delta, progress, time })
    }

    // ---------------------------------

    // overriders
    // before start
    if (time < fs.start) {
      let progress = 0
      star.starting({ scope: star.scope, word, delta, progress, time })
    }

    // after end
    if (time > fs.end) {
      let progress = 1
      star.leaving({ scope: star.scope, word, delta, progress, time })
    }

    // timebox value
    // timebox
    if (time >= fs.start && time <= fs.end) {
      let progress = (time - fs.start) / (fs.end - fs.start)
      star.timebox({ scope: star.scope, word, delta, progress, time })
    }

    if (this.options.scenetime) {
      star.tick({ scope: star.scope, word, delta, progress: time / this.options.scenetime, time })
    }
  }
}