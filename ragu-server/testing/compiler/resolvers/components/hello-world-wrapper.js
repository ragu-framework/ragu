module.exports = ({element, params}) => {
  return {
    html: `Hello, ${params.name}`,
    connectedCallback: () => element.addEventListener('click', () => element.connectedStub()),
    disconnectedCallback: () => element.disconnectedStub()
  }
}
