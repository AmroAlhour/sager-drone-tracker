// src/components/DroneList.jsx
import React from 'react';
import useDroneStore from '../store/droneStore';

// We can re-use this helper function
const isAllowedToFly = (registration) => {
    if (!registration) return false;
    const id = registration.split('-')[1];
    return id && id.startsWith('B');
};

const DroneList = () => {
  const { drones, selectedDrone, setSelectedDrone } = useDroneStore();
  
  // Convert object to array and sort if needed
  const droneArray = Object.values(drones);

  return (
    <div className="drone-list-panel">
      <h2>Active Drones ({droneArray.length})</h2>
      <ul>
        {droneArray.map(drone => (
          <li 
            key={drone.serial}
            onClick={() => setSelectedDrone(drone.serial)}
            style={{ 
              backgroundColor: selectedDrone === drone.serial ? '#4a5568' : 'transparent',
              cursor: 'pointer'
            }}
          >
            <span>{drone.registration}</span>
            <span style={{ color: isAllowedToFly(drone.registration) ? '#34d399' : '#f87171' }}>
              ●
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DroneList;