<template>
  <v-app id="app">
    <v-container class="d-flex">
      <v-col>
        <Viewport/>
      </v-col>
      <v-col>
        <v-card-text>#1</v-card-text>
      </v-col>
    </v-container>
  </v-app>
</template>

<script>
import Viewport from './Viewport.vue'

export default {
  name: 'App',
  components: {
    Viewport
  }
}
</script>

<style>
html {
  overflow: hidden !important;
  scrollbar-width: none;
  -ms-overflow-style: none;
}

html::-webkit-scrollbar {
  width: 0;
  height: 0;
}
</style>
