import Vue from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify';
import VueRouter from 'vue-router';
import DatetimePicker from 'vuetify-datetime-picker';
import GoogleLogin from 'vue-google-login';

import jwt_decode from 'jwt-decode';

Vue.use(VueRouter);
Vue.use(DatetimePicker);
Vue.use(GoogleLogin);


import Last50 from '@/components/Last50';
import DemoLast50 from '@/components/DemoLast50';
import Home from '@/components/Home';
import TimeMachine from '@/components/TimeMachine';
import DemoTM from '@/components/DemoTM';
import Login from '@/components/Login';
import Logout from '@/components/Logout';
import SpotifyConnect from '@/components/SpotifyConnect';
const router = new VueRouter({
  mode: 'history',
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
        requiresAuth: true,
        requiresSpotify: true
      }
    },
    {
      path: '/TimeMachine',
      name: 'TimeMachine',
      component: TimeMachine, 
      meta: {
        requiresAuth: true,
        requiresSpotify: true
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
    {
      path: '/DemoLast50',
      name: 'DemoLast50',
      component: DemoLast50
    },
    {
      path: '/DemoTM',
      name: 'DemoTM',
      component: DemoTM
    },
  ]
});

// https://www.digitalocean.com/community/tutorials/how-to-set-up-vue-js-authentication-and-route-handling-using-vue-router
router.beforeEach((to, from, next) => {
  if (to.matched.some(record => record.meta.requiresAuth)) {
    const jwt = localStorage.getItem('jwt');
    // is there jwt
    if (!jwt) {
      next({
        path:'/Login'
      });
      return;
    }

    const decoded = jwt_decode(jwt);

    // is it expired
    if ((decoded.exp < Date.now()/1000)) {
      next({
        path:'/Login'
      });
      return;
    }

    // is spotify auth present when required
    if (to.matched.some(record => record.meta.requiresSpotify)){
      if (decoded.user.spotifyAuthInfo && decoded.user.spotifyAuthInfo.accessToken) {
        next();
        return;
      } else {
        next({
          path: '/SpotifyConnect'
        });
        return;
      }
    }

    next();
  } else {
    next();
  }
});


Vue.config.productionTip = false;

window.app = new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount('#app')
