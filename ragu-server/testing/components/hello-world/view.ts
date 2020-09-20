interface Props {
  name: string;
}

export default {
  render ({name}: Props){
    return {
      state: {
        name,
        greetingType: 'Hello'
      },
      html: `<b>Hello, ${name}</b>`
    }
  }
}
