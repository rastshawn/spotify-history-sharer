<template>
  <v-container>
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
export default {
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
    tracks: []
  }),
  created: async function(/*event*/) {
    const response = await fetch(
      "http://localhost:6001/users/114453869888691414495/historyRAW?from=1546322400000&to=1578538290456",
      {
        method: 'GET',
        mode: 'cors',
        cache: 'no-cache',
        headers: {
          'Content-Type' : 'application/json'
        }
      }
    );
    const responseJson = await response.json();
    
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
  
};
</script>
