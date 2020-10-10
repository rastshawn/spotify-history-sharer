<template>
  <v-container>
    <h1>Time Machine</h1>
      <v-row>
    <v-col cols="6">

        <v-datetime-picker label="From" v-model="fromTime"></v-datetime-picker>

  </v-col>
  <v-col cols="6">
        <v-datetime-picker label="To" v-model="toTime"></v-datetime-picker>
  </v-col>
  </v-row>
    <v-btn v-on:click="loadTracks()">LOAD</v-btn>
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
    loading: false,
    footerProps: {
      
    },
    components: {

    },
    fromTime: '',
    fromMenu: false,
    toTime: '',
    toMenu: false,
    tracks: []
  }),
  computed: {
    fromTimeMillis() {
      if (this.fromTime){
        return this.fromTime.getTime();
      } 
      return null;

    },
    toTimeMillis() {
      if (this.toTime) {
        return this.toTime.getTime();
      }
      return null;
    },
    googleUserID() {
      if (this.isDemo) {
        return process.env.VUE_APP_DEMO_GOOGLE_ID;
      } else {
        return localStorage.getItem("googleUserID");
      }
    }
  },
  created: async function(/*event*/) {
    this.loadTracks();
  },
  methods: {
    async loadTracks() {
      this.loading = true;
      let url = `/api/songData/${this.googleUserID}/history`;
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
      console.log(responseJson[0]);
      for (let i in responseJson) {
        let t = responseJson[i];
        let track = {
          "title" : t.name,
          "artwork" : t.album.images[0].url,
          "date" : t.PlayedAt,
          "artists" : t.album.artists
        };

        tracks.push(track);
      }

      this.tracks = tracks;
      this.loading = false;
      } catch (e) {
        console.log(e);
        this.loading = false;
      }
    }
  }
  
};
</script>
