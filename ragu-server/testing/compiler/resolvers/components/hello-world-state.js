module.exports = ({element, state}) => {
  return {
    html: `Hello, ${state.name}`,
    connectedCallback: () => element.addEventListener('click', () => element.connectedStub()),
    disconnectedCallback: () => element.disconnectedStub()
  }
}
