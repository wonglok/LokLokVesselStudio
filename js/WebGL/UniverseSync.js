class UniverseSync  {
  constructor() {
    let obi = {
      props: {
        word: {}
      },
      computed: {
        watchAny () {
          return JSON.stringify(this.word)
        }
      },
      watch: {
        watchAny () {
          this.$parent.$emit('change-word-any', this.word)
        }
      },
      template: `
        <span></span>
      `,
      mounted () {
        this.$parent.$emit('add-word', this.word)
      },
      beforeDestroy() {
        this.$parent.$emit('remove-word', this.word)
      }
    }

    let stg = {
      props: {
        view: {}
      },
      computed: {
        watchAny () {
          return JSON.stringify(this.view)
        }
      },
      watch: {
        watchAny () {
          this.$parent.$emit('change-view-any', this.view)
        }
      },
      template: `
        <span></span>
      `,
      mounted () {
        this.$parent.$emit('add-view', this.view)
      },
      beforeDestroy() {
        this.$parent.$emit('remove-view', this.view)
      }
    }

    this.div = document.createElement('div');
    document.body.appendChild(this.div);
    this.vue = new Vue({
      el: this.div,
      template: `
        <span>
          <obi
            :key="word.id"
            v-for="(word, ikey) in words"

            :word="word"
          ></obi>
          <stg
            :key="'view' + view.id"
            v-for="(view, ikey) in views"

            :view="view"
          ></stg>
        </span>
      `,
      components: {
        'obi': obi,
        'stg': stg
      },
      data () {
        return {
          words: [],
          views: [],
          options: {}
        }
      },
      computed: {
        optionsAll () {
          return JSON.stringify(this.options)
        }
      },
      watch: {
        // options () {
        //   this.$emit('change-options', this.options)
        // },
        optionsAll () {
          this.$emit('change-options', this.options)
        }
      },
      methods: {
        setRestore ({ options, words, views }) {
          return new Promise((resolve) => {
            this.words.splice(0, this.words.length)
            this.views.splice(0, this.views.length)

            setTimeout(() => {
              this.words = words
              this.views = views
              this.options = options

              resolve({ options, words, views })
            }, 0)
          })
        }
      },
      created () {
      }
    })

  }
}