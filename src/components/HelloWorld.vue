<template>
  <div class="container">
    <h1>Nearest ballot drop-box</h1>
    <div class="row d-flex justify-content-center">
      <gmap-autocomplete class="introInput"
        @place_changed="placeChanged"
      ></gmap-autocomplete>
      <button class="btn btn-light ml-2" @click="clearHome">Clear</button>
    </div>
    <div class="row mt-4">
      <gmap-map
        :center="center"
        :zoom="11"
        style="width:100%;  height: 400px;"
      >
        <gmap-info-window
          v-if="clicked"
          :position="clicked"
          :options="{content: clicked.name}"
        ></gmap-info-window>
        <gmap-marker
          v-if="home"
          :position="home"
        ></gmap-marker>
        <gmap-marker
          :key="index"
          v-for="(loc, index) in locations"
          :position="loc"
          :clickable="true"
          v-on:click="showTooltip(loc)"
        ></gmap-marker>
      </gmap-map>
    </div>
    <div class="row mt-4">
      <table class="text-left">
        <thead>
          <td>Name</td>
          <td>Hours</td>
          <td>Distance</td>
        </thead>
        <tbody>
          <tr v-for="row in locations" :key="row.name">
            <td>{{row.name}}</td>
            <td v-html="row.notes"></td>
            <td>{{row.distance ? row.distance + ' miles' : ''}}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import Papa from 'papaparse';

export default {
  name: 'HelloWorld',
  props: {
    msg: String,
  },
  data() {
    return {
      home: null,
      center: {
        name: 'Philadelphia City Hall',
        lat: 39.9528041,
        lng: -75.165672,
        notes: 'A 24/7 dropbox is located at the South Broad entrance, across the street from the Capital Grille.',
      },
      locations: [],
      clicked: null,
    };
  },
  mounted() {
    window.initMap = this.initMap;
    this.loadData();
  },
  methods: {
    loadData() {
      /* eslint-disable */
      const self = this;
      Papa.parse('https://docs.google.com/spreadsheets/d/1w1wouyCLnPPK8Am0f9HEimZ44t5w9bgnsew4nM-wIS4/pub?output=csv', {
        download: true,
        header: true,
        complete: function(results) {
          var data = results.data
          self.locations = data.map((d) => {
            d.lat = parseFloat(d.lat);
            d.lng = parseFloat(d.lng);
            return d;
          });
        }
      })
      /* eslint-enable */
    },
    placeChanged(data) {
      this.home = data.geometry.location;
      this.locations.forEach((loc) => {
        loc.distance = this.getDistance(loc); // eslint-disable-line
      }, this);
      this.locations = this.locations.sort((a, b) => a.distance - b.distance);
    },
    clearHome() {
      this.home = null;
    },
    getDistance(row) {
      if (this.home) return this.haversine(row, { lat: this.home.lat(), lng: this.home.lng() });
      return null;
    },
    haversine(point1, point2) {
      /* eslint-disable */
      const R = 3958.8; // miles
      // const R = 6371e3; // metres
      const φ1 = point1.lat * Math.PI / 180; // φ, λ in radians
      const φ2 = point2.lat * Math.PI / 180;
      const Δφ = (point2.lat - point1.lat) * Math.PI / 180;
      const Δλ = (point2.lng - point1.lng) * Math.PI / 180;

      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      const d = R * c; // in metres
      /* eslint-enable */
      return d.toFixed(2);
    },
    showTooltip(loc) {
      this.clicked = loc;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style lang="scss">
#map{
  height: 200px;
  width: 60%;
}
.gm-style .gm-style-iw-t:after {
  background: none !important;
}
</style>
