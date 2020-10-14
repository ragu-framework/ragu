module.exports = (props) => {
  return Promise.resolve({msg: `Hello, ${props.name}`})
}
