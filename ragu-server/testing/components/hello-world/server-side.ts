import {ServerSideProps} from "../../../src/component";

interface Props {
  name: string;
}

export default {
  render (props: ServerSideProps<Props, {}>){
    if (!props.isServer) {
      throw new Error('isServer not given.');
    }

    if (!props.config) {
      throw new Error('config not given.');
    }

    if (!props.request.path.includes("hello-world")) {
      throw new Error('request not given.');
    }

    return {
      state: {
        name: props.params.name,
        greetingType: 'Hello'
      },
      html: `<b>Hello, ${props.params.name}</b>`
    }
  }
}
