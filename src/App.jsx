import React from 'react';
import MapComponent from './Map'; // Ensure this is the correct import


function App() {
  return (
    <div className="App">
      <h1>MapTiler SDK with React</h1>
      <MapComponent /> {/* Use MapComponent, not Map */}
    </div>
  );
}

export default App;
