import { onMount } from 'solid-js';
import { apiClient } from '../lib/api';
import "maplibre-gl/dist/maplibre-gl.css";
import maplibregl from "maplibre-gl";

export default function CreateFileView() {
  onMount(() => {
    if (!apiClient.isAuthenticated()) {
      window.location.href = '/auth/login';
    }

    maplibregl.setRTLTextPlugin(
      "rtl-text.min.js",
      true,
    );

    new maplibregl.Map({
      container: "map",
      style: `https://api.protomaps.com/styles/v5/light/en.json?key=5b9c1298c2eef269`
    });
  });

  return (
    <div class="card">
      <h1>Create File</h1>
      <div id="map" style="height: 400px; width: 400px"></div>
    </div>
  );
}
