import * as VueGoogleMaps from 'vue2-google-maps';
import Vue from 'vue';
import App from './App.vue';

Vue.use(VueGoogleMaps, {
  load: {
    key: process.env.VUE_APP_GOOGLE_API_KEY,
    libraries: 'places', // necessary for places input
  },
});
Vue.config.productionTip = false;

new Vue({
  render: (h) => h(App),
}).$mount('#app');
