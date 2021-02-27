export default (props) => {
  return Promise.resolve({
    msg: `Hello, ${props.name}!`
  });
}
