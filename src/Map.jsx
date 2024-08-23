import React, { useRef, useEffect } from 'react';
import maplibregl from 'maplibre-gl';  // Ensure the correct map library is used

// Your MapTiler API key
const MAPTILER_API_KEY = 'TVcFvyFFFazAUCae4rHK'; // Ensure this is the correct key for your account
const MAPTILER_STYLE = `https://api.maptiler.com/maps/basic/style.json?key=${MAPTILER_API_KEY}`; // Correct style URL ending with .json

const MapComponent = () => {
  // Ref to store the map container
  const mapContainerRef = useRef(null);

  useEffect(() => {
    // Initialize the map
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: MAPTILER_STYLE, // Use the MapTiler style with your API key
      center: [78.9629, 20.5937], // Center the map on India (Longitude, Latitude)
      zoom: 4, // Adjust zoom level as needed
    });

    // Clean up the map instance on unmount
    return () => map.remove();
  }, []);

  return <div ref={mapContainerRef} style={{ width: '100%', height: '500px' }} />;
};

export default MapComponent;
