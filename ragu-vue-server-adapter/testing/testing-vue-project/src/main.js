import Vue from 'vue'
import App from 'ragu-vue-server-adapter/testing/testing-vue-project/src/App.vue'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
