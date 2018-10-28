<template>
  <div class="full ace-box" ref="ace-box">
  </div>
</template>

<script>
module.exports = {
  props: {
    name: {
      default: 'happy.js'
    },
    value: {
      default: ' '
    }
  },
  data () {
    return {
      editor: false
    }
  },
  computed: {
    mode () {
      if ((this.name || '.html').split('.').pop() === 'js') {
        return 'javascript'
      }
      if ((this.name || '.html').split('.').pop() === 'html') {
        return 'html'
      }
      if ((this.name || '.vert').split('.').pop() === 'vert') {
        return 'glsl'
      }
      if ((this.name || '.frag').split('.').pop() === 'frag') {
        return 'glsl'
      } else {
        return 'html'
      }
    }
  },
  watch: {
    value () {
      // if (this.value) {
      //   editor.setValue(this.value, 1)
      // }
    },
    mode () {
      this.editor.session.setMode('ace/mode/' + this.mode);
    }
  },
  methods: {
    makeEditor () {
      // glsl , javascript
      var editor = this.editor = ace.edit(this.$refs['ace-box']);
      editor.session.setMode('ace/mode/' + this.mode);
      editor.setTheme("ace/theme/monokai");
      editor.session.setOptions({ tabSize: 2, useSoftTabs: true });

      var commands = [
        {
          name: 'open-files',
          bindKey: { win: 'Ctrl-O', mac: 'Command-O' },
          exec: (editor) => {
            // var val = editor.getValue()
          },
          readOnly: true // false if this command should not apply in readOnly mode
        },
        {
          name: 'save',
          bindKey: {win: 'Ctrl-S', mac: 'Command-S'},
          exec: (editor) => {
            this.$emit('save', this.editor.getValue())
          },
          readOnly: true // false if this command should not apply in readOnly mode
        },
        {
          name: 'multicursor',
          bindKey: {win: 'Ctrl-D', mac: 'Command-D'},
          exec: (editor) => {
            editor.selectMore(1)
          },
          // multiSelectAction: 'forEach',
          scrollIntoView: 'cursor',
          readOnly: true // false if this command should not apply in readOnly mode
        }
      ]
      if (Array.isArray(commands)) {
        commands.forEach((command) => {
          editor.commands.addCommand(command)
        })
      }
      if (this.value) {
        editor.setValue(this.value, 1)
      }
      editor.on('change', () => {
        this.$emit('input', editor.getValue())
      })
      editor.getSession().setUseWorker(false);

    }
  },
  mounted () {
    var script = document.createElement('script')
    script.onload = () => {
      this.makeEditor()
    }
    script.src = `https://cdnjs.cloudflare.com/ajax/libs/ace/1.3.3/ace.js`
    document.head.appendChild(script)
  }
}
</script>

<style scoped>
.ace-box{
  opacity: 0.75;
}

</style>
