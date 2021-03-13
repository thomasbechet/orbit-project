<template>
  <div id="app" class="myclass">
    <Viewport/>
  </div>
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
  body, html {
    padding: 0;
    margin: 0;
    width: 100%;
    min-height: 100vh;
  }
</style>
