module.exports = (state) => (props) => {
  if (state) {
    return Promise.resolve(state(props));
  }

  return Promise.resolve(null);
}
