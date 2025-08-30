
import { create } from 'zustand';

const STABLE_DRONE_COUNT = 10;

const useDroneStore = create((set) => ({
  drones: [],
  updateIndex: 0,
  selectedDrone: null,

  updateDrones: (featureCollection) => set((state) => {
    const incomingDroneFeature = featureCollection.features[0];
    if (!incomingDroneFeature) return {};

    const newDrones = [...state.drones];
    const currentIndex = state.updateIndex;

    // If our stable list is not yet full, add the new drone.
    if (newDrones.length < STABLE_DRONE_COUNT) {
      incomingDroneFeature.properties.startTime = Date.now();
      incomingDroneFeature.path = [incomingDroneFeature.geometry.coordinates];
      newDrones.push(incomingDroneFeature);
    } 
    else {
      // 1. Get a reference to the original drone object we want to update.
      const originalDrone = newDrones[currentIndex];

      // 2. Create a completely NEW object. This is the crucial step that forces React to update.
      const updatedDrone = {

        type: originalDrone.type,
        
        // a new geometry object with the new coordinates
        geometry: {
          ...originalDrone.geometry,
          coordinates: incomingDroneFeature.geometry.coordinates,
        },

        //a new properties object
        properties: {
          ...originalDrone.properties, // Copy existing properties
          altitude: incomingDroneFeature.properties.altitude,
          yaw: incomingDroneFeature.properties.yaw,
          Name: incomingDroneFeature.properties.Name,
          pilot: incomingDroneFeature.properties.pilot,
        },
        
        //a new path array by adding the new coordinate to the old path
        path: [...originalDrone.path, incomingDroneFeature.geometry.coordinates],
      };
      
      // Put the completely NEW `updatedDrone` object back into our array.
      newDrones[currentIndex] = updatedDrone;
    }

    const nextUpdateIndex = (currentIndex + 1) % STABLE_DRONE_COUNT;
    return { drones: newDrones, updateIndex: nextUpdateIndex };
  }),

  setSelectedDrone: (serial) => set({ selectedDrone: serial }),
}));

export default useDroneStore;