export default (props: any) => {
  return Promise.resolve({msg: `Hello, ${props.name}`})
}
