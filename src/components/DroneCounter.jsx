
import useDroneStore from '../store/droneStore';

// Helper function to determine a drone's flight permission status.
const isAllowedToFly = (registration) => {
  if (!registration) return false;
  const id = registration.split('-')[1];
  return id && id.startsWith('B');
};

const DroneCounter = () => {
  // Get the full array of drones from our global store.
  const drones = useDroneStore((state) => state.drones);


  //  the .filter() method to create a new array containing only the red drones.
  const redDrones = drones.filter(
    (drone) => !isAllowedToFly(drone.properties.registration)
  );

  //The number to display is the length of this new array.
  const redDronesCount = redDrones.length;

  return (
    <div className="drone-counter">
      <span>{redDronesCount}</span>
      <p>Drone Flying</p>
    </div>
  );
};

export default DroneCounter;