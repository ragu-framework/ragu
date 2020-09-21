import HelloWorld from '../../testing-vue-project/src/components/HelloWorld';
import Vue from 'vue';

export default {
  render(_, state) {
    return Promise.resolve(new Vue({
      render: h => h(HelloWorld, { props: state })
    }));
  }
}
