import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VueRouter from 'vue-router';
import DatetimePicker from 'vuetify-datetime-picker';

Vue.use(VueRouter);
Vue.use(DatetimePicker);


import Last50 from '@/components/Last50';
import Home from '@/components/Home';
import TimeMachine from '@/components/TimeMachine';
import Login from '@/components/Login';

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
      component: Last50, 
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/TimeMachine',
      name: 'TimeMachine',
      component: TimeMachine, 
      meta: {
        requiresAuth: true
      }
    },
    {
      path: '/Login',
      name: 'Login',
      component: Login 
    },
  ]
});

// https://www.digitalocean.com/community/tutorials/how-to-set-up-vue-js-authentication-and-route-handling-using-vue-router
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (localStorage.getItem('jwt') == null) {
      next({
        path:'/Login'
      })
    } else {
      next()
    }
  } else {
    next()
  }
});


Vue.config.productionTip = false;

window.app = new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
