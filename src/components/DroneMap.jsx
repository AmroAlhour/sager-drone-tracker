// src/components/DroneMap.jsx
import React, { useRef, useEffect, useState, memo } from 'react';
import mapboxgl from 'mapbox-gl';
import useDroneStore from '../store/droneStore';
import DroneIconUrl from '../assets/drone.svg';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

// Helper function to determine drone's flight permission status
const isAllowedToFly = (registration) => {
  if (!registration) return false;
  const id = registration.split('-')[1];
  return id && id.startsWith('B');
};

// Helper function to format flight time from milliseconds to HH:MM:SS
const formatFlightTime = (startTime) => {
  if (!startTime) return '00:00:00';
  const flightTimeSeconds = Math.round((Date.now() - startTime) / 1000);
  const hours = Math.floor(flightTimeSeconds / 3600).toString().padStart(2, '0');
  const minutes = Math.floor((flightTimeSeconds % 3600) / 60).toString().padStart(2, '0');
  const seconds = (flightTimeSeconds % 60).toString().padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

// A memoized React component to efficiently render and manage each drone marker on the map
const DroneMarker = memo(({ map, drone, onClick, onMouseEnter, onMouseLeave }) => {
  const markerRef = useRef(null);
  const elementRef = useRef(null); // Ref to hold the marker's DOM element for styling

  // This effect runs only ONCE when a drone is first created
  useEffect(() => {
    // Create the necessary HTML elements for the custom marker
    const el = document.createElement('div');
    el.className = 'custom-drone-marker';
    el.style.backgroundImage = `url(${DroneIconUrl})`;
    elementRef.current = el; // Store the element for future updates

    const arrow = document.createElement('div');
    arrow.className = 'yaw-arrow';
    el.appendChild(arrow);

    // Add event listeners, passing the unique serial number
    el.addEventListener('click', (e) => { e.stopPropagation(); onClick(drone.properties.serial); });
    el.addEventListener('mouseenter', () => onMouseEnter(drone.properties.serial));
    el.addEventListener('mouseleave', () => onMouseLeave());
    
    // Create the Mapbox marker and add it to the map
    const marker = new mapboxgl.Marker(el)
      .setLngLat(drone.geometry.coordinates)
      .addTo(map);
      
    markerRef.current = marker;
    return () => marker.remove(); // Cleanup function to remove the marker
  }, [map, drone.properties.serial]);

  // This effect runs on EVERY update to move, rotate, and re-color the marker
  useEffect(() => {
    if (markerRef.current && elementRef.current) {
      // Update the marker's position and rotation
      markerRef.current
        .setLngLat(drone.geometry.coordinates)
        .setRotation(drone.properties.yaw);
      
      // Re-calculate the color and apply it
      const isAllowed = isAllowedToFly(drone.properties.registration);
      const droneColor = isAllowed ? '#4caf50' : '#ff4d4d';
      elementRef.current.style.backgroundColor = droneColor;
      const arrow = elementRef.current.querySelector('.yaw-arrow');
      if (arrow) {
        arrow.style.borderBottomColor = droneColor;
      }
    }
  }, [drone.geometry.coordinates, drone.properties.yaw, drone.properties.registration]);

  return null;
});


// The main DroneMap component
const DroneMap = () => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const isInitialized = useRef(false);
  const popupRef = useRef(null);
  
  const [isMapLoaded, setIsMapLoaded] = useState(false);
  const [hoveredSerial, setHoveredSerial] = useState(null); // Stores the ID of the hovered drone

  const drones = useDroneStore((state) => state.drones);
  const { selectedDrone, setSelectedDrone } = useDroneStore();

  // Effect to initialize the map
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v10',
      center: [35.93, 31.94],
      zoom: 9,
    });
    mapRef.current = map;
    
    map.on('load', () => {
      setIsMapLoaded(true);
      // General map click listener to deselect drones
      map.on('click', (e) => {
        if (!e.defaultPrevented) { // Check if a marker's click event was stopped
          setSelectedDrone(null);
        }
      });
    });

    return () => {
      map.remove();
      mapRef.current = null;
      isInitialized.current = false;
    };
  }, []);

  // Effect for creating and updating individual, colored paths
  useEffect(() => {
    const map = mapRef.current;
    if (!isMapLoaded || !map || !drones) return;

    drones.forEach(drone => {
      const pathId = `path-${drone.properties.serial}`;
      const sourceId = `source-${pathId}`;
      const pathData = (drone.path && drone.path.length > 1) ? drone.path : [];
      const source = map.getSource(sourceId);

      if (source) {
        source.setData({ type: 'Feature', geometry: { type: 'LineString', coordinates: pathData } });
      } else {
        map.addSource(sourceId, { type: 'geojson', data: { type: 'Feature', geometry: { type: 'LineString', coordinates: pathData } } });
        map.addLayer({
          id: pathId,
          type: 'line',
          source: sourceId,
          paint: { 'line-color': isAllowedToFly(drone.properties.registration) ? '#4caf50' : '#ff4d4d', 'line-width': 2, 'line-opacity': 0.8 }
        });
      }
    });
  }, [drones, isMapLoaded]);

  // Effect to handle popups and flying to selected drones
  useEffect(() => {
    const map = mapRef.current;
    if (!isMapLoaded || !map) return;

    // A selected (clicked) drone takes priority over a hovered one
    const serialForPopup = selectedDrone || hoveredSerial;
    
    // Always find the drone in the LATEST `drones` array to prevent "shifting"
    const droneData = serialForPopup
      ? drones.find(d => d.properties.serial === serialForPopup)
      : null;

    // Handle flying to the drone ONLY if it was selected by click
    if (selectedDrone) {
      const selectedDroneData = drones.find(d => d.properties.serial === selectedDrone);
      if (selectedDroneData) {
        map.flyTo({ center: selectedDroneData.geometry.coordinates, zoom: 15 });
      }
    }

    // Handle creating, updating, or removing the popup
    if (droneData) {
      const popupHTML = `
        <div class="drone-popup">
          <h4>${droneData.properties.Name}</h4>
          <div class="popup-details">
            <div><span>Altitude</span><p>${droneData.properties.altitude.toFixed(1)} m</p></div>
            <div><span>Flight Time</span><p>${formatFlightTime(droneData.properties.startTime)}</p></div>
          </div>
        </div>
      `;

      if (!popupRef.current) {
        popupRef.current = new mapboxgl.Popup({ closeButton: false, closeOnClick: false, anchor: 'bottom', offset: 45, className: 'custom-popup' })
          .setLngLat(droneData.geometry.coordinates)
          .setHTML(popupHTML)
          .addTo(map);
      } else {
        popupRef.current.setLngLat(droneData.geometry.coordinates).setHTML(popupHTML);
      }
    } else {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
    }
  }, [selectedDrone, hoveredSerial, drones, isMapLoaded]);

  return (
    <div ref={mapContainerRef} style={{ width: '100vw', height: '100vh' }}>
      {isMapLoaded && drones.map(drone => (
        <DroneMarker
          key={drone.properties.serial}
          map={mapRef.current}
          drone={drone}
          onClick={setSelectedDrone}
          onMouseEnter={setHoveredSerial}
          onMouseLeave={() => setHoveredSerial(null)}
        />
      ))}
    </div>
  );
};

export default DroneMap;