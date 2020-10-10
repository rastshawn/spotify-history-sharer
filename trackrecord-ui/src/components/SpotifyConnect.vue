<template>
  <v-container>
    <a :href=link>Connect to Spotify</a>
  </v-container>
</template>

<script>
import {updateSpotifyAccount} from '@/services/web.service.js';
const clientID = process.env.VUE_APP_SPOTIFY_CLIENT_ID;
const host = process.env.VUE_APP_HOST;
export default {
  components: {
  },
  methods: {
    async sendCodeAndRedirect() {
      if (this.$route.query && this.$route.query.code) {
        // have an auth code, send to server, then redirect to app
        
        const body = {
          userID: this.$route.query.state,
          code: this.$route.query.code
        };

        await updateSpotifyAccount(body);
        
        // TODO check errors
        // if successful, redirect to a logged in page.
        this.$router.push('Last50');
      } else if (this.$route.error=="access_denied"){
        window.location.href="/";
      } else {
        // no auth code, redirect to the auth link
        window.location.href=this.link;
      }
    }
  },
  created() {
    this.sendCodeAndRedirect();
  },
  activated() {
    this.sendCodeAndRedirect();
  },
  computed: {
    link() {

      const userID = localStorage.getItem("googleUserID");
      const scope = 'user-read-recently-played';
      const redirectURI = host + '/SpotifyConnect';
      return 'https://accounts.spotify.com/authorize' +
                        '?response_type=code' +
                        '&client_id=' + clientID + 
                        '&state=' + userID +
                        '&scope=' + scope +
                        '&show_dialog=true' +
                        '&redirect_uri=' + encodeURIComponent(redirectURI);
                    
    }
  }

  
};
</script>
