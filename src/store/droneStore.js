// src/store/droneStore.js
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
    // If our stable list is full, use the new drone's data to create an updated version of our stable drone.
    else {
      // --- THIS IS THE FINAL FIX ---
      // 1. Get a reference to the original drone object we want to update.
      const originalDrone = newDrones[currentIndex];

      // 2. Create a completely NEW object. This is the crucial step that forces React to update.
      const updatedDrone = {
        // Copy the type and path from the original
        type: originalDrone.type,
        
        // Create a new geometry object with the new coordinates
        geometry: {
          ...originalDrone.geometry,
          coordinates: incomingDroneFeature.geometry.coordinates,
        },

        // Create a new properties object
        properties: {
          ...originalDrone.properties, // This keeps the original serial, registration, and startTime
          // Now, overwrite the properties that should be live
          altitude: incomingDroneFeature.properties.altitude,
          yaw: incomingDroneFeature.properties.yaw,
          Name: incomingDroneFeature.properties.Name,
          pilot: incomingDroneFeature.properties.pilot,
        },
        
        // Create a new path array by adding the new coordinate to the old path
        path: [...originalDrone.path, incomingDroneFeature.geometry.coordinates],
      };
      
      // 3. Put the completely NEW `updatedDrone` object back into our array.
      newDrones[currentIndex] = updatedDrone;
    }

    const nextUpdateIndex = (currentIndex + 1) % STABLE_DRONE_COUNT;
    return { drones: newDrones, updateIndex: nextUpdateIndex };
  }),

  setSelectedDrone: (serial) => set({ selectedDrone: serial }),
}));

export default useDroneStore;