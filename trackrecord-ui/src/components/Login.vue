<template>
  <v-container>
    <h1>Login</h1>
    <v-row>
    <v-card>
      <p>The flow is in progress - welcome to the prototype!</p>
      <p>Logging in:</p>
      <ol>
        <li>Whether the button says you're signed in already or not, click "Sign in with Google".</li>
        <li>When you're back on the page (if you had to leave at all), click "Connect to Spotify" You can skip this if you're sure you've already connected your account, but it doesn't hurt anything.</li>
        <li>When all of that is finished, go ahead and click the Last50 link in the sidebar. You should see your recent Spotify history if your accounts connected properly.</li>
      </ol>
    </v-card>
    </v-row>
    <v-row>
    <v-card>

      <GoogleLogin :params="googleAuth" :renderParams="renderParams" :onSuccess="onSuccess" :onFailure="onFailure" :logoutButton="false"></GoogleLogin>
      <!--<button v-on:click="helloWorld()">Test credentials</button>-->
      <router-link to="/SpotifyConnect">Connect to Spotify</router-link>

    </v-card>
    </v-row>
  </v-container>
</template>

<script>
import GoogleLogin from 'vue-google-login';
import {sendAuthToken, makeCall} from '@/services/web.service.js';
export default {
  components: {
    GoogleLogin
  },
  methods: {
    async onSuccess(googleUser) {
      console.log(googleUser);
      // make a login call to the back end, sending the google user token
      try {
        const result = await sendAuthToken(googleUser);
      } catch (e) {
        console.error(e);
      }

    },
    onCurrentUser: (googleUser) => {
      this.onSuccess(googleUser);
    },
    onFailure: (err) => {
      console.log(err);
    },
    async helloWorld () {
      let response = await makeCall('/api/');
      console.log(response);
    }
  },
  data: () => {
    return {
      googleAuth: {
        client_id: "488872480953-ctkr2qlagi4vj0vnpa7v3clclclj0jt2.apps.googleusercontent.com",
      },
      renderParams: {
        width: 250,
        height: 50,
        longtitle: true
      },
      logout: false
    }
  }

  
};
</script>
