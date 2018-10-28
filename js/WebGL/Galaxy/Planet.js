class Planet {
  constructor ({ id, word, space }) {
    this.id = id
    this.space = space
    this.word = word
    this.group = new THREE.Object3D();

    this.scope = {}
    this.manifestAPI = false

    this.word.codes.forEach((file) => {
      this.onAceKeystroke({ file, value: file.text })
    })

    // this.changeFramesSetFunction()
  }

  onAceKeystroke ({ file, value }) {
    let files = this.word.codes
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
      var def
      try {
        def = new Function('THREE', 'module', value)
        if (this.manifestAPI) {
          this.manifestAPI.onDestroy({ root: this.group, word: this.word, files, scope: this.scope })
        }
        //this.manifestAPI =
        def(THREE, assigner('manifestAPI'))
        this.manifestAPI.onCreate({ root: this.group, word: this.word, files, scope: this.scope })
      } catch (e) {
        console.warn(e)
        this.error = new Error('manifest wrong, cannot create createdItem')
      }
      let onInit = () => {
        try {
          this.manifestAPI.onInit({ root: this.group, word: this.word, files, scope: this.scope })
        } catch (e) {
          console.warn(e)
          this.error = new Error('manifest wrong, cannot create createdItem')
        }
      }
      if (!this.timerOnInit) {
        onInit()
      } else {
        clearTimeout(this.timerOnInit)
        this.timerOnInit = setTimeout(onInit, 333)
      }
    }

    if (file.isFadeIn) {
      try {
        let def = new Function('THREE', 'module', value)
        // this.starting =
        def(THREE, assigner('starting'))
      } catch (e) {
        console.warn(e)
        this.error = new Error('manifest wrong, cannot create isFadeIn')
      }
    }
    if (file.isInBetween) {
      try {
        let def = new Function('THREE', 'module', value)
        // this.during =
        def(THREE, assigner('during'))
      } catch (e) {
        console.warn(e)
        this.error = new Error('manifest wrong, cannot create isInBetween')
      }
    }
    if (file.isFadeOut) {
      try {
        let def = new Function('THREE', 'module', value)
        // this.leaving =
        def(THREE, assigner('leaving'))
      } catch (e) {
        console.warn(e)
        this.error = new Error('manifest wrong, cannot create isFadeOut')
      }
    }
    if (file.isTimeBox) {
      try {
        let def = new Function('THREE', 'module', value)
        // this.timebox =
        def(THREE, assigner('timebox'))
      } catch (e) {
        console.warn(e)
        this.error = new Error('manifest wrong, cannot create isTimeBox')
      }
    }

    if (file.isTick) {
      try {
        let def = new Function('THREE', 'module', value)
        // this.tick =
        def(THREE, assigner('tick'))
      } catch (e) {
        console.warn(e)
        this.error = new Error('manifest wrong, cannot create isTick')
      }
    }

    // on any file
    if (this.manifestAPI) {
      this.manifestAPI.onKeyStroke({ root: this.group, word: this.word, files, scope: this.scope })
    }
  }

  tick () {}
  starting () {}
  during () {}
  leaving () {}
  timebox () {}

  update ({ word }) {
    this.word = word
  }
  clean () {
    console.log('clean', this.word)
  }
}

Planet.getFrameset = () => {
  return {
    enabled: true,

    start: 0,
    afterStart: 2,
    beforeEnd: 28,
    end: 30
  }
}

Planet.speak = () => {
  return {
    id: Planet.getID(),
    starType: 'Planet',
    frameset: Planet.getFrameset(),

    // position: { x: 0, y: 0, z: 0 },
    // rotation: { x: 0, y: 0, z: 0 },
    // scale: { x: 1, y: 1, z: 1 },

    codes: Planet.codes()
  }
}

Planet.getID = () => {
  return '_' + Number(Math.random() * 40960).toFixed(0)
}

Planet.codes = () => {
  return [
    {
      protected: true,
      isManinfest: true,
      name: 'engine.js',
      ext: 'javascript',
      text: `// global: THREE
const onCreate = ({ root, word, files, scope }) => {
  scope.group = new THREE.Object3D();

  scope.color1Hue = 0.0;

  scope.updateMesh = () => {
    var times = [0,1];
    times.forEach((t, i) => {
      let geometry = new THREE.PlaneBufferGeometry(10, 10, 640, 32);
      let mesh = new THREE.Mesh(geometry, scope.material);
      mesh.rotation.z = Math.PI * 2 * i / times.length;
      scope.group.add(mesh);
    })
  }

  scope.updateUniforms = () => {
    scope.uniforms = {
      time: { value: 0 },
      opacity: { value: 1 },
      color1: { value: new THREE.Color(0xffffff) }
    }
  }

  scope.updateShader = () => {
    let vs = files.find(f => f.name === 'line.vert').text;
    let fs = files.find(f => f.name === 'line.frag').text;
    console.log(vs, fs);
    scope.material = new THREE.ShaderMaterial({
      uniforms: scope.uniforms,
      transparent: true,
      vertexShader: vs,
      fragmentShader: fs,
      side: THREE.DoubleSide
    })
    if (scope.group) {
      scope.group.children.forEach((i) => {
        i.material = scope.material
      })
    }
  }

  scope.updateColor = ({ time }) => {
    let color1 = new THREE.Color(0xffffff);
    color1.setHSL(Number(time * 0.1 % 1), 1.0, 0.58);
    color1.needsUpdate = true
    scope.uniforms.color1.value = color1
  }

  root.add(scope.group);
}
const onInit = ({ root, word, files, scope }) => {
  scope.updateUniforms();
  scope.updateColor({ time: 0 });
  scope.updateShader();
  scope.updateMesh();
}
const onDestroy = ({ root, word, files, scope }) => {
  root.remove(scope.group);
}
const onKeyStroke = ({ root, word, files, scope }) => {
  scope.updateShader();
}

module.exports = {
  onCreate,
  onInit,
  onDestroy,
  onKeyStroke
}`
    },
    {
      protected: true,
      isFadeIn: true,
      name: 'fadein.js',
      ext: 'javascript',
      text: `module.exports = ({ scope, delta, progress, time }) => {
  // fadein.js
  scope.uniforms.opacity.value = progress;
}`
    },
    {
      protected: true,
      isInBetween: true,
      name: 'inbetween.js',
      ext: 'javascript',
      text: `module.exports = ({ scope, delta, progress, time }) => {
  // in between
  scope.uniforms.opacity.value = 1.0;
}`
    },
    {
      protected: true,
      isFadeOut: true,
      name: 'fadeout.js',
      ext: 'javascript',
      text: `module.exports = ({ scope, delta, progress, time }) => {
  // fadeout
  scope.uniforms.opacity.value = 1.0 - progress;
}`
    },
    {
      protected: true,
      isTimeBox: true,
      name: 'timebox.js',
      ext: 'javascript',
      text: `module.exports = ({ scope, delta, progress, time }) => {
  scope.uniforms.time.value = time;

  // timebox
  scope.group.children.forEach((item, i) => {
    item.rotation.z = 2 * Math.PI * i / scope.group.children.length;
    item.rotation.x = 0;
    item.rotation.y = 0;
  })

  scope.group.rotation.x = 0;
  scope.group.rotation.y = 0;
  scope.group.rotation.z = progress * Math.PI * 2.0;

  scope.updateColor({ time });

  if (progress >= 1.0) {
    scope.group.visible = false;
  } else if (progress <= 0) {
    scope.group.visible = false;
  } else {
    scope.group.visible = true;
  }
}`
    },
    {
      protected: true,
      isTick: true,
      name: 'tick.js',
      ext: 'javascript',
      text: `module.exports = ({ scope, delta, progress, time }) => {
  // timebox
  // scope.uniforms.time.value = time;
}`
    },
    {
      protected: true,
      isVertexShader: true,
      canClone: true,
      name: 'line.vert',
      ext: 'glsl',
      text: `
uniform float time;
//varying vec2 vUv;
void main() {
  vec3 nPos = position;
  //vUv = uv;

  nPos.x *= 100.0;
  nPos.y *= 0.05;
  nPos.y += 15.0 * tan(nPos.x * 8.0 + nPos.z * time + time);

  gl_Position = projectionMatrix * modelViewMatrix * vec4(nPos, 1.0);
}`
    },
    {
      protected: true,
      isFragmentShader: true,
      canClone: true,
      name: 'line.frag',
      ext: 'glsl',
      text: `
// varying vec2 vUv;
uniform vec3 color1;
uniform float opacity;
void main() {
  gl_FragColor = vec4(color1, opacity);
}`
    }
  ]
}
