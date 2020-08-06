<template>
  <v-container>
    <div>
        <GoogleLogin :params="googleAuth" :renderParams="renderParams" :onSuccess="onSuccess" :onFailure="onFailure" :logoutButton="false"></GoogleLogin>
      <button v-on:click="helloWorld()">Test credentials</button>
      <a href="/authorize">Connect to Spotify</a>
    </div>
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
