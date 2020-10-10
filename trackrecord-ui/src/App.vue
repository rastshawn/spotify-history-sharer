<template>
  <v-app dark>
    <v-navigation-drawer app v-model="drawer">
      <v-list-item two-line>
        <v-list-item-content>
          <v-list-item-title>TrackRecord</v-list-item-title>
          <v-list-item-subtitle>Your Spotify time machine.</v-list-item-subtitle>
        </v-list-item-content>
      </v-list-item>
      <divider></divider>
      <v-list-item
      v-for="route in routes"
      :key="route.name"
      link :to="route.path"
      >
        <v-list-item-content>
          <v-list-item-title>{{route.name}}</v-list-item-title>
        </v-list-item-content>
      </v-list-item>

    </v-navigation-drawer>

    <v-content>
      <v-container fluid>
                <v-row>
                    <v-col>
                      <router-view></router-view>
                    </v-col>
                </v-row>
            </v-container>
    </v-content>
  </v-app>
</template>

<script>


export default {
  name: 'App',
  components: {
    //Last50,
  },
  data: () => ({
    drawer: true,
    routes: [
    {
      path: '/',
      name: 'Home'
    },
    {
      path: '/Last50',
      name: 'Last50',
      meta: {
        requiresAuth: true,
        requiresSpotify: true
      }
    },
    {
      path: '/TimeMachine',
      name: 'TimeMachine',
      meta: {
        requiresAuth: true,
        requiresSpotify: true
      }
    },
    {
      path: '/Login',
      name: 'Login',
    },
    {
      path: '/Logout',
      name: 'Logout',
    },
    {
      path: '/SpotifyConnect',
      name: 'SpotifyConnect',
      meta: {
        requiresAuth: true
      }
    },
  ]
  }),
};
</script>
