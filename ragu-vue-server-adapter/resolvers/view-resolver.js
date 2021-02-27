var vueServerRenderer = require("vue-server-renderer");

module.exports = (component, stateResolver) => ({
  render: function (props) {
    const renderer = vueServerRenderer.createRenderer();

    return stateResolver(props)
      .then((state) => renderer.renderToString(component(props, state))
          .then((html) => ({
            html: html,
            state: state
          })));
  }
})
