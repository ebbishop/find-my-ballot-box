<template>
  <div id="app">
    <BallotFinder msg="Welcome to Your Vue.js App"/>
  </div>
</template>

<script>
import BallotFinder from './components/BallotFinder.vue';

export default {
  name: 'App',
  components: {
    BallotFinder,
  },
};
</script>

<style lang="scss">
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
