<template>
  <v-container>
    <div>
        <GoogleLogin :params="googleAuth" :renderParams="renderParams" :onSuccess="onSuccess" :onFailure="onFailure" :logoutButton="true">LOG OUT</GoogleLogin>
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
    async onSuccess() {
      console.log("logged out");
      localStorage.removeItem("jwt");
    },
    onCurrentUser: (googleUser) => {
      this.onSuccess(googleUser);
    },
    onFailure: (err) => {
      console.log(err);
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
    }
  }

  
};
</script>
