<template>
  <div class="container">
    <h1>Nearest ballot drop-box in Philadelphia County</h1>
    <div class="row d-flex justify-content-center">
      <gmap-autocomplete class="address-input"
        @place_changed="placeChanged"
        :value="addressInput"
      ></gmap-autocomplete>
      <button class="btn btn-outline-dark ml-2" @click="clearHome">Clear</button>
    </div>
    <div class="row mt-4">
      <p>Enter your home address to find the closest ballot drop-off point. The closest drop-off (as the crow-flies) will be highglihted green. Click map pins for address.</p>
      <gmap-map
        ref="map"
        :center="center"
        :zoom="zoom"
        :options="{fullscreenControl: false, streetViewControl: false, mapTypeControl: false}"
        style="width:100%;  height: 400px;"
      >
        <gmap-info-window
          v-if="clicked"
          :position="clicked"
          :options="infoWindowOptions"
          :opened="infoWindowOpened"
          @closeclick="infoWindowOpened = false"
        ></gmap-info-window>
        <gmap-marker
          v-if="home"
          :position="home"
          :icon="{url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png' }"
        ></gmap-marker>
        <gmap-marker
          :key="index"
          v-for="(loc, index) in locations"
          :icon="home && index === 0 ? {url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png' } : null"
          :position="loc"
          :clickable="true"
          :z-index="home && index === 0 ? 999999 : 0"
          v-on:click="showTooltip(loc)"
        ></gmap-marker>
      </gmap-map>
    </div>
    <div class="row mt-4">
      <table class="text-left table">
        <thead>
          <td v-for="col in columns" :key="col.key">{{col.name}}</td>
          <td v-if="home">Distance</td>
        </thead>
        <tbody>
          <tr v-for="(row, index) in locations" :key="row.name" :class="home && index === 0 ? 'closest' : ''">
            <td v-for="col in columns" :key="col.key">{{row[col.key]}}</td>
            <td v-if="home">{{row.distance ? row.distance + ' miles' : ''}}</td>
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
      defaultCenter: {
        lat: 39.9528041,
        lng: -75.165672,
      },
      center: {
        lat: 39.9528041,
        lng: -75.165672,
      },
      locations: [],
      columns: [],
      clicked: null,
      infoWindowOpened: false,
      addressInput: '',
      zoom: 11,
      map: null,
    };
  },
  mounted() {
    this.loadData();
  },
  computed: {
    infoWindowOptions() {
      if (!this.clicked) return null;
      let content = '';
      const contentFields = ['name.display', 'address.display'];
      for (let i = 0, l = contentFields.length; i < l; i ++) { // eslint-disable-line
        const field = contentFields[i];
        if (this.clicked[field]) content += ` ${this.clicked[field]}`;
      }
      return {
        content,
        pixelOffset: { height: -35, width: 0 },
      };
    },
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
          // get headers to display
          const headers = results.meta.fields.filter((f) => {
            return f.indexOf('display') > -1
          })
          .map((f) => {
            const field = { key: f };
            field.name = f.replace('.display', '')
            field.name = field.name[0].toUpperCase() + field.name.slice(1);
            return field;
          });
          self.columns = headers;
          // get locations
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
      this.addressInput = data.formatted_address;
      this.home = {
        lat: data.geometry.location.lat(),
        lng: data.geometry.location.lng(),
      };
      this.locations.forEach((loc) => {
        loc.distance = this.getDistance(loc); // eslint-disable-line
      }, this);
      this.locations = this.locations.sort((a, b) => a.distance - b.distance);
      this.center = this.home;
      this.$nextTick(() => {
        setTimeout(this.resetBounds(), 1500);
      });
    },
    resetBounds() {
      const bounds = new google.maps.LatLngBounds(); // eslint-disable-line no-undef, max-len
      const closest = this.locations[0];
      bounds.extend(new google.maps.LatLng(closest.lat, closest.lng)); // eslint-disable-line no-undef, max-len
      bounds.extend(new google.maps.LatLng(this.home.lat, this.home.lng)); // eslint-disable-line no-undef, max-len
      this.$refs.map.fitBounds(bounds);
    },
    clearHome() {
      this.home = null;
      this.addressInput = '';
      this.center = this.defaultCenter;
      this.zoom = 11;
    },
    getDistance(row) {
      if (this.home) return this.haversine(row, { lat: this.home.lat, lng: this.home.lng });
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
      this.infoWindowOpened = true;
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
.address-input{
  width: 40%;
}
thead {
  font-weight: 900;
}
.closest{
  background: lightgreen;
}
</style>
