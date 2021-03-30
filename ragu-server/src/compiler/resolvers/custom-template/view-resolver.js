module.exports = (component, stateResolver, wrapper) => ({
  render: function (props) {
    return stateResolver(props).then((state) => {
      var allProps = {...props, state};
      var result = component(allProps);

      if (wrapper) {
        result = wrapper(result, allProps);
      }

      return {
        html: result.html,
        state
      }
    })
  }
})
