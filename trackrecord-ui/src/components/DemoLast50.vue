<template>
  <v-container>
    <Last50 :isDemo="true"></Last50>
  </v-container>
</template>

<script>
import Last50 from './Last50';
export default {
  components: {
    Last50
  }
};
</script>
