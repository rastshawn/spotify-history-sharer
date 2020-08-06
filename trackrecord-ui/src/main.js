import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VueRouter from 'vue-router';
import DatetimePicker from 'vuetify-datetime-picker';
import GoogleLogin from 'vue-google-login';

Vue.use(VueRouter);
Vue.use(DatetimePicker);
Vue.use(GoogleLogin);


import Last50 from '@/components/Last50';
import Home from '@/components/Home';
import TimeMachine from '@/components/TimeMachine';
import Login from '@/components/Login';
import Logout from '@/components/Logout';
import SpotifyConnect from '@/components/SpotifyConnect';
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
    {
      path: '/Logout',
      name: 'Logout',
      component: Logout 
    },
    {
      path: '/SpotifyConnect',
      name: 'SpotifyConnect',
      component: SpotifyConnect, 
      meta: {
        requiresAuth: true
      }
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
