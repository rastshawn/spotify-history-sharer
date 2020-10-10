<template>
  <v-container>
    <h1>HOME</h1>
    <v-card>
      <p>Welcome to the prototype of TrackRecord, the app that helps you log and explore your Spotify listening history.</p>
      <p>TrackRecord combines NodeJS with NestJS, Vuetify, cron, Python, and a mySQL database to periodically pull your recent history from Spotify and save it to your account.</p>
      <br>
      <br>
      <p>It's easy to connect your account - just visit the <router-link to="/Login">Login</router-link> page to start recording. A Google account is required in addition to your Spotify account.</p>
      <p>Not quite ready? Click <router-link to="/DemoLast50">here</router-link> to check out my recent history from the Spotify API, and <router-link to="/DemoTM">here</router-link> to see how you can use the TimeMachine to explore my day-to-day listening.</p>
      <br>
      <br>
      <p>If you've made an account and you would like to delete it, please email me at <a href="mailto:rastshawn@gmail.com">rastshawn@gmail.com</a> and I will remove your information from the database.</p>
    </v-card>
    <v-card>
      <v-row>
        <v-col cols="6" offset-md="3">
          <v-img :src="require('@/assets/Last50.png')"></v-img>
      </v-col>
      </v-row>
      <v-row>
      <v-col cols="6">
        <v-img :src="require('@/assets/TimeMachine.png')"></v-img>
      </v-col>
      <v-col cols="6">
        <v-img :src="require('@/assets/TimeMachineWithCalendar.png')"></v-img>
      </v-col>
      </v-row>
    </v-card>
    
  </v-container>
</template>

<script>
export default {
  // data: () => {

  // }
  
};
</script>
