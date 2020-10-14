module.exports = (component, stateResolver) => ({
  render: function (props) {
    return stateResolver(props).then((state) => {
      return component(props, state);
    });
  }
})
