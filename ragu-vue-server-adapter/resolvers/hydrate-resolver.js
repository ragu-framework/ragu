module.exports = (component) => ({
  hydrate: function (el, props, state) {
    var app = component(props, state);
    app.$mount(el, true);
    el._vueApp = app;
  },
  render: function (el, props, state) {
    var app = component(props, state);
    var instance = app.$mount()
    el._vueApp = app;
    el.appendChild(instance.$el);
  },
  disconnect: function (el) {
    el._vueApp.$destroy(true);
  }
});
