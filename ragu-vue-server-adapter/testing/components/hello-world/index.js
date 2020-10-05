import HelloWorld from '../../testing-vue-project/src/components/HelloWorld';
import Vue from 'vue';

export default {
  render(props) {
    return new Vue({
      render: h => h(HelloWorld, { props: {msg: props.name } }),
      destroyed() {
        window.stubVueDestroyed && window.stubVueDestroyed();
      }
    });
  }
}
