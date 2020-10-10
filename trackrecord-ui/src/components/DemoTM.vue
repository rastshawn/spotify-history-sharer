<template>
  <v-container>
    <TimeMachine :isDemo="true"></TimeMachine>
  </v-container>
</template>

<script>
import TimeMachine from './TimeMachine';
export default {
  components: {
    TimeMachine
  }
};
</script>
