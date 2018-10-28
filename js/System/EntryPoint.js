class EntryPoint {
  constructor () {
    Vue.use(httpVueLoader);

    let base = '/';

    let Compos = window.Compos = {
      //pages
      'approuter': httpVueLoader(`${base}./vue/App.vue?v=` + Math.random()),
      'home': httpVueLoader(`${base}./vue/pages/Home.vue?v=` + Math.random()),
      'cards': httpVueLoader(`${base}./vue/pages/Cards.vue?v=` + Math.random()),

      // compos
      'timeline': httpVueLoader(`${base}./vue/compos/Timeline/Timeline.vue?v=` + Math.random()),
      'frame-set': httpVueLoader(`${base}./vue/compos/Timeline/Frameset.vue?v=` + Math.random()),

      'editor': httpVueLoader(`${base}./vue/compos/Editor.vue?v=` + Math.random()),
      'ace': httpVueLoader(`${base}./vue/compos/ACE.vue?v=` + Math.random()),
      'healing': httpVueLoader(`${base}./vue/compos/Healing.vue?v=` + Math.random()),
      'remixer': httpVueLoader(`${base}./vue/compos/Remixer.vue?v=` + Math.random())
    }

    this.router = new VueRouter({
      // mode: 'history',
      routes: [
        {
          path: '/',
          component: {
            template: '<home></home>',
            components: Compos
          }
        },
        {
          path: '/cards',
          component: {
            template: '<cards></cards>',
            components: Compos
          }
        },
        {
          path: '/*',
          redirect: '/'
        }
      ]
    });

    this.app = new Vue({
      el: '#app',
      router: this.router,
      template: '<approuter></approuter>',
      components: Compos
    })
  }
}