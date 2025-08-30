// src/hooks/useSocket.js
import { useEffect } from 'react';
import io from 'socket.io-client';
import useDroneStore from '../store/droneStore';

// The backend server URL
const SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:9013';

export const useSocket = () => {
  // Get the updateDrones action from our store
  const { updateDrones } = useDroneStore();

  useEffect(() => {
    // Establish the socket connection
    const socket = io(SERVER_URL, {
      transports: ['polling'],
    });

    // Log connection status
    socket.on('connect', () => {
      console.log('Connected to socket server');
    });

    // Listen for the 'message' event from the server
    socket.on('message', (data) => {
      updateDrones(data);
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });

    // Cleanup on component unmount
    return () => {
      socket.disconnect();
    };
  }, [updateDrones]);
};