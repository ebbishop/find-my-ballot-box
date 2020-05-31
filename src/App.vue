<template>
  <div id="app">
    <BallotFinder msg="Welcome to Your Vue.js App"/>
    <footer class="container">
      <a href="https://github.com/ebbishop/find-my-ballot-box" class="icon-link">See this Project on Github<i class="fa fa-github ml-2"></i></a>
    </footer>
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
