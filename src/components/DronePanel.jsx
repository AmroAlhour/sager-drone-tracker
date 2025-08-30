// src/components/DronePanel.jsx
import React from 'react';
import useDroneStore from '../store/droneStore';

const isAllowedToFly = (registration) => {
  if (!registration) return false;
  const id = registration.split('-')[1];
  return id && id.startsWith('B');
};

const DroneCard = ({ drone, isSelected, onClick }) => {
  const allowed = isAllowedToFly(drone.registration);
  return (
    <div
      className={`drone-card ${isSelected ? 'selected' : ''}`}
      onClick={onClick}
    >
      <h4>{drone.Name || 'DJI Mavic 3 Pro'}</h4>
      <div className="drone-details">
        <div className="detail-group">
          <span>Serial #</span>
          <p>{drone.serial}</p>
        </div>
        <div className="detail-group">
          <span>Registration #</span>
          <p>{drone.registration}</p>
        </div>
        <div className="detail-group">
          <span>Pilot</span>
          <p>{drone.pilot}</p>
        </div>
        <div className="detail-group">
          <span>Organization</span>
          <p>{drone.organization}</p>
        </div>
      </div>
      <div className={`status-light ${allowed ? 'green' : 'red'}`}></div>
    </div>
  );
};

const DronePanel = ({ isVisible, setIsVisible }) => {
  const drones = useDroneStore((state) => state.drones);
  const { selectedDrone, setSelectedDrone } = useDroneStore();
  const droneArray = useDroneStore((state) => state.drones);

  return (
    <div className={`drone-panel ${isVisible ? 'visible' : ''}`}>
      <div className="panel-header">
        <h3>DRONE FLYING</h3>
        <button className="close-btn" onClick={()=>
            setIsVisible(false)
        }>×</button>
      </div>
      <div className="panel-tabs">
        <button className="tab active">Drones</button>
        <button className="tab">Flights History</button>
      </div>
      <div className="drone-list">
        {droneArray.map((drone) => (
          <DroneCard
            key={drone.properties.serial}
            drone={drone.properties}
            isSelected={selectedDrone === drone.properties.serial}
             onClick={() => {
              setSelectedDrone(drone.properties.serial);
              if (window.innerWidth <= 768) {
                setIsVisible(false);
              }
            }}/>
        ))}
      </div>
    </div>
  );
};

export default DronePanel;