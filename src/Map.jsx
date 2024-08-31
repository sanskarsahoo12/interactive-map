import React, { useRef, useEffect, useState } from "react";
import maplibregl from "maplibre-gl";
import 'maplibre-gl/dist/maplibre-gl.css'; // Correct import for CSS
import './mapstyle.css'; // Custom styles

const MAPTILER_API_KEY = "AXZusuZamaFGsiRflWNp"; // Your MapTiler API key
const WEATHER_API_KEY = "715c0cf517b04c0087c105026242308"; // Your Weather API key

const baseMaps = {
  STREETS: {
    style: `https://api.maptiler.com/maps/streets/style.json?key=${MAPTILER_API_KEY}`,
    label: 'Streets',
  },
  WINTER: {
    style: `https://api.maptiler.com/maps/winter/style.json?key=${MAPTILER_API_KEY}`,
    label: 'Winter',
  },
  HYBRID: {
    style: `https://api.maptiler.com/maps/hybrid/style.json?key=${MAPTILER_API_KEY}`,
    label: 'Hybrid',
  },
};

const initialStyle = baseMaps.STREETS.style;

class LayerSwitcherControl {
  constructor(options) {
    this.options = { ...options };
    this.container = document.createElement("div");
    this.container.classList.add("maplibregl-ctrl");
    this.container.classList.add("maplibregl-ctrl-basemaps");
    this.container.classList.add("closed");
    this.container.id = "layer-switcher"; // Add an ID for styling

    switch (this.options.expandDirection || "right") {
      case "top":
        this.container.classList.add("reverse");
        // fall through
      case "down":
        this.container.classList.add("column");
        break;
      case "left":
        this.container.classList.add("reverse");
        // fall through
      case "right":
        this.container.classList.add("row");
        break;
    }

    this.container.addEventListener("mouseenter", () => {
      this.container.classList.remove("closed");
    });

    this.container.addEventListener("mouseleave", () => {
      this.container.classList.add("closed");
    });
  }

  onAdd(map) {
    this.map = map;
    const basemaps = this.options.basemaps;
    Object.keys(basemaps).forEach((layerId) => {
      const base = basemaps[layerId];
      const basemapButton = document.createElement("button");
      basemapButton.textContent = base.label;
      basemapButton.classList.add("basemap-button");
      basemapButton.dataset.id = layerId;
      basemapButton.addEventListener("click", () => {
        const activeElement = this.container.querySelector(".active");
        if (activeElement) {
          activeElement.classList.remove("active");
        }
        basemapButton.classList.add("active");
        map.setStyle(base.style);
      });
      this.container.appendChild(basemapButton);
      if (this.options.initialBasemap === layerId) {
        basemapButton.classList.add("active");
      }
    });
    return this.container;
  }

  onRemove() {
    this.container.parentNode?.removeChild(this.container);
    delete this.map;
  }
}

const MapComponent = () => {
  const mapContainerRef = useRef(null);
  const [weatherData, setWeatherData] = useState(null);

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [78.9629, 20.5937], // Center the map on India
      zoom: 5, // Set a zoom level
      minZoom: 3.5, // Minimum zoom level
    });

    map.on('load', () => {
      // Adding the terrain and 3D buildings
      map.addSource('terrain', {
        type: 'raster-dem',
        url: `https://api.maptiler.com/tiles/terrain-rgb/tiles.json?key=${MAPTILER_API_KEY}`,
        tileSize: 256,
        maxzoom: 14,
      });

      map.setTerrain({ source: 'terrain', exaggeration: 1.5 });

      map.addLayer({
        id: 'india-borders',
        type: 'line',
        source: 'composite', // Assuming 'composite' is the source with your borders data
        'source-layer': 'admin', // Adjust this to the correct layer name containing borders
        paint: {
          'line-color': '#FF0000', // Border color (red in this case)
          'line-width': 45, // Increase the thickness of the border
          'line-opacity': 0.8 // Adjust opacity if needed
        },
        filter: ['==', 'name', 'India'] // Adjust this filter if needed to match the correct feature
      });

      map.addLayer({
        id: '3d-buildings',
        source: 'composite',
        'source-layer': 'building',
        filter: ['==', 'extrude', 'true'],
        type: 'fill-extrusion',
        minzoom: 10, // Changed from 15 to 10 to show buildings at a lower zoom level
        paint: {
          'fill-extrusion-color': '#8A2BE2', // Violet color for the buildings
          'fill-extrusion-height': [
            'interpolate',
            ['linear'],
            ['zoom'],
            6, // Start increasing building height at zoom level 10
            50, // Increase building height to 50 at zoom level 10
            15, 
            ['get', 'height'],
          ],
          'fill-extrusion-base': [
            'interpolate',
            ['linear'],
            ['zoom'],
            10, // Start increasing building base height at zoom level 10
            0,
            15,
            ['get', 'min_height'],
          ],
          'fill-extrusion-opacity': 0.7, // Slightly higher opacity to make buildings more visible
        },
      });

      // Add the LayerSwitcherControl
      const styleSwitcher = new LayerSwitcherControl({ basemaps: baseMaps, initialBasemap: 'STREETS' });
      map.addControl(styleSwitcher, 'bottom-left');

      // Add location tags with hyperlinks
      const locationTags = [
        {
          name: 'New Delhi',
          coordinates: [77.2090, 28.6139],
          link: 'https://heyzine.com/flip-book/d8c1c5c1e9.html#page/4',
        },
        {
          name: 'Mumbai',
          coordinates: [72.8777, 19.0759],
          link: 'https://en.wikipedia.org/wiki/Mumbai',
        },
        {
          name: 'Bengaluru',
          coordinates: [77.5946, 12.9716],
          link: 'https://heyzine.com/flip-book/d8c1c5c1e9.html#page/6',
        },
        {
          name: 'Hyderabad',
          coordinates: [78.4867, 17.3850],
          link: 'https://en.wikipedia.org/wiki/Hyderabad',
        },
        {
          name: 'Chennai',
          coordinates: [80.2707, 13.0827],
          link: 'https://en.wikipedia.org/wiki/Chennai',
        },
      ];

      locationTags.forEach((location) => {
        const marker = new maplibregl.Marker({
          color: 'rgba(255, 165, 0, 0.8)', // Orange with 80% opacity
          scale: 0.5, // Scale the marker to 0.5x
        })
          .setLngLat(location.coordinates)
          .setPopup(new maplibregl.Popup({ offset: 25 }) // Offset the popup by 25px
            .setHTML(`<a href="${location.link}" target="_blank">${location.name}</a>`))
          .addTo(map);

        marker.getElement().addEventListener('mouseenter', () => {
          map.flyTo({
            center: location.coordinates,
            zoom: 10,
            speed: 0.5,
          });
        });

        marker.getElement().addEventListener('mouseleave', () => {
          map.flyTo({
            center: [78.9629, 20.5937],
            zoom: 5,
            speed: 0.5,
          });
        });
      });

      // Add event listener for weather data
      map.on('mousemove', (e) => {
        const latLng = e.lngLat;
        fetchWeatherData(latLng.lat, latLng.lng)
          .then((data) => setWeatherData(data))
          .catch((error) => console.error('Error fetching weather data:', error));
      });
    });

    return () => map.remove();
  }, []);

  const fetchWeatherData = (lat, lon) => {
    const url = `https://api.weatherapi.com/v1/current.json?key=${WEATHER_API_KEY}&q=${lat},${lon}`;
    return fetch(url)
      .then((response) => response.json())
      .then((data) => data);
  };

  return (
    <div>
      <div ref={mapContainerRef} style={{ width: '100%', height: '500px' }} />
      {weatherData && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.8)', borderRadius: '5px' }}>
          <h4>Current Weather</h4>
          <p>Temperature: {weatherData.current.temp_c}°C</p>
          <p>Humidity: {weatherData.current.humidity}%</p>
          <p>Condition: {weatherData.current.condition.text}</p>
        </div>
      )}
    </div>
  );
};

export default MapComponent;
