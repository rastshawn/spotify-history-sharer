<template>
  <v-container>
    <!--
    <v-btn v-on:click="loadTracks">Load</v-btn>
    -->
    <h1>Recent history</h1>
    <v-data-table
    :headers="headers"
    :items="tracks"
    :disable-pagination="true"
    class="elevation-1"
    :hide-default-footer="true"
    :loading="loading"
    >
      <template v-slot:item.artwork={item}>
        <v-img :src="item.artwork"
          max-width="64">
        </v-img>

      </template>

      <template v-slot:item.artists={item}>
        
        <span v-for="(value, index) in item.artists" v-bind:key="index">
          <span v-if="index>0">,</span>
          {{value.name}}
        </span>
      </template>

    </v-data-table>
  </v-container>
</template>

<script>
import {makeCall} from '@/services/web.service.js';
export default {
  props: {
    isDemo: Boolean
  },
  data: () => ({
    headers: [
      { text: 'Artwork', value: 'artwork', sortable:false},
      { text: 'Title', value: 'title' },
      { text: 'Artists', value: 'artists' },
      { text: 'Date', value: 'date' },
    ],
    footerProps: {
      
    },
    components: {

    },
    tracks: [],
    loading: false,
  }),
  created: async function(/*event*/) {
    // const response = await fetch(
    //   "https://trackrecordlive.shawnrast.com/users/114453869888691414495/last50RAW",
    //   {
    //     method: 'GET',
    //     mode: 'cors',
    //     cache: 'no-cache',
    //     headers: {
    //       'Content-Type' : 'application/json'
    //     }
    //   }
    // );
    // const responseJson = await response.json();
    
    // let tracks = [];
    // for (let i in responseJson.items) {
    //   let t = responseJson.items[i];
    //   let track = {
    //     "title" : t.track.name,
    //     "artwork" : t.track.album.images[0].url,
    //     "date" : t.played_at,
    //     "artists" : t.track.album.artists
    //   };

    //   tracks.push(track);
    // }

    // this.tracks = tracks;
    this.loadTracks();
  },
  activated () {
    this.loadTracks();
  },
  computed: {
    googleUserID() {
      if (this.isDemo) {
        return process.env.VUE_APP_DEMO_GOOGLE_ID;
      } else {
        return localStorage.getItem("googleUserID");
      }
    }
  },
  methods: {
    async loadTracks() {
      this.loading = true;
      let url = `/api/songData/${this.googleUserID}/last50`;
      if (this.fromTime && this.toTime) {
        url += `?from=${this.fromTimeMillis}&to=${this.toTimeMillis}`;
      }
      try {
      const responseJson = await makeCall(
        url,
        'GET', 
        true // sets to json
      );
      

      let tracks = [];

      for (let i in responseJson.items) {
        let t = responseJson.items[i];
        let track = {
          "title" : t.track.name,
          "artwork" : t.track.album.images[0].url,
          "date" : t.played_at,
          "artists" : t.track.album.artists
        };

        tracks.push(track);
      }
      this.loading = false;
      this.tracks = tracks;
      } catch (e) {
        console.log(e);
        this.loading = false;
      }
    }
  }
};
</script>
