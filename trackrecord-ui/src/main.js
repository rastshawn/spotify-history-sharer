import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VueRouter from 'vue-router';

Vue.use(VueRouter);


import Last50 from '@/components/Last50';
import Home from '@/components/Home';
import TimeMachine from '@/components/TimeMachine';

const router = new VueRouter({
  routes: [
    {
      path: '/',
      name: 'Home',
      component: Home
    },
    {
      path: '/Last50',
      name: 'Last50',
      component: Last50 
    },
    {
      path: '/TimeMachine',
      name: 'TimeMachine',
      component: TimeMachine 
    }
  ]
});


Vue.config.productionTip = false;

window.app = new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
