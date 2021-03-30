module.exports = ({params}) => {
  return Promise.resolve({
    name: params.toBeTranslatedName
  })
}
