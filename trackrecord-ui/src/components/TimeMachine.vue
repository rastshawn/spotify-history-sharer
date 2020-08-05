<template>
  <v-container>
    <v-form>
      <v-input v-model="fromTime" label="From"></v-input>
      <v-input v-model="toTime" label="To"></v-input>
    </v-form>
    <v-btn v-on:click="loadTracks()">LOAD</v-btn>
    <!--
    <v-btn v-on:click="loadTracks">Load</v-btn>
    -->
    <v-data-table
    :headers="headers"
    :items="tracks"
    :disable-pagination="true"
    class="elevation-1"
    :hide-default-footer="true"
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
    //googleUserID, // 114453869888691414495
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
    fromTime: '',
    toTime: '',
    tracks: []
  }),
  computed: {
    fromTimeMillis() {
      // TODO
      //return '1546322400000';
      return this.fromTime;
    },
    toTimeMillis() {
      // TODO
      //return '1578538290456';
      return this.toTime;
    }
  },
  created: async function(/*event*/) {
    this.loadTracks();
  },
  methods: {
    async loadTracks() {
      let url = `/api/users/114453869888691414495/historyRAW`;
      if (this.fromTime && this.toTime) {
        url += `?from=${this.fromTimeMillis}&to=${this.toTimeMillis}`;
      }
      const responseJson = await makeCall(
        url,
        'GET', 
        //true // sets to json
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
    }
  }
  
};
</script>
