// src/App.jsx
import React, { useState } from 'react'; // <-- Import useState
import { useSocket } from './hooks/useSocket';
import DroneMap from './components/DroneMap';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DronePanel from './components/DronePanel';
import DroneCounter from './components/DroneCounter';
import './App.css';

function App() {
  useSocket();
  // --- THIS IS THE NEW CODE ---
  // State to control the drone panel's visibility on mobile
  const [isPanelVisible, setIsPanelVisible] = useState(false);
  // -------------------------

  return (
    <div className="app-layout">
      <Header />
      <Sidebar />
      <main className="main-content">
        <DroneMap />
        {/* Pass the state and the setter function to the panel */}
        <DronePanel isVisible={isPanelVisible} setIsVisible={setIsPanelVisible} />
        <DroneCounter />

        {/* --- THIS IS THE NEW CODE --- */}
        {/* This button will only be visible on mobile thanks to CSS */}
        <button 
          className="mobile-toggle-button" 
          onClick={() => setIsPanelVisible(!isPanelVisible)}
        >
          {isPanelVisible ? 'Hide List' : 'Show Drones'}
        </button>
        {/* ------------------------- */}
      </main>
    </div>
  );
}

export default App;