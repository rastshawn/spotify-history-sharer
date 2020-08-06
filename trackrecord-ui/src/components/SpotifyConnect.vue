<template>
  <v-container>
    <a :href=link>Connect to Spotify</a>
  </v-container>
</template>

<script>
import {makeCall} from '@/services/web.service.js';
export default {
  components: {
  },
  methods: {
  },
  computed: {
    link() {
      const clientID = ''; // TODO remove hardcoding
      const userID = localStorage.getItem("googleUserID");
      const scope = 'user-read-recently-played';
      const redirectURI = 'https://trackrecord.shawnrast.com/SaveCode';
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
