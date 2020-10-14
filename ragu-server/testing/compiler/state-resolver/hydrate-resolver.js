module.exports.default = (component) => ({
  hydrate: function (el, props, state) {
    el.innerHTML = component(props, state);
  }
});
