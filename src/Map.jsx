import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';
import * as maptilersdk from '@maptiler/sdk'; // Import MapTiler SDK
import "@maptiler/sdk/dist/maptiler-sdk.css"; // Import the CSS for MapTiler SDK

const MAPTILER_API_KEY = 'TVcFvyFFFazAUCae4rHK';

maptilersdk.config.apiKey = MAPTILER_API_KEY;

const baseMaps = {
  STREETS: {
    style: 'https://api.maptiler.com/maps/streets/style.json?key=' + MAPTILER_API_KEY,
    label: 'Streets',
  },
  WINTER: {
    style: 'https://api.maptiler.com/maps/winter/style.json?key=' + MAPTILER_API_KEY,
    label: 'Winter',
  },
  HYBRID: {
    style: 'https://api.maptiler.com/maps/hybrid/style.json?key=' + MAPTILER_API_KEY,
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

    switch (this.options.expandDirection || "right") {
      case "top":
        this.container.classList.add("reverse");
      case "down":
        this.container.classList.add("column");
        break;
      case "left":
        this.container.classList.add("reverse");
      case "right":
        this.container.classList.add("row");
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
        activeElement.classList.remove("active");
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

  useEffect(() => {
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: initialStyle,
      center: [78.9629, 20.5937],
      minZoom: 3.5,
    });

    const styleSwitcher = new LayerSwitcherControl({ basemaps: baseMaps, initialBasemap: 'STREETS' });
    map.addControl(styleSwitcher, 'bottom-left');

    return () => map.remove();
  }, []);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '500px' }} />;
};

export default MapComponent;