export default {
  propsToState(props) {
    return Promise.resolve({
      msg: `Hello, ${props.name}!`
    });
  }
}
