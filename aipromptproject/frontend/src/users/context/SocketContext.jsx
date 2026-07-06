import React, { createContext, useContext, useEffect, useState } from "react";
import { io } from "socket.io-client";

// Create the context
const SocketContext = createContext(null);

// Custom hook to use the socket instance
export const useSocket = () => {
  return useContext(SocketContext);
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    // Connect to the WebSocket server running on port 3001
    // Update this URL if your WebSocket server is hosted elsewhere
    const newSocket = io("http://localhost:3001", {
      transports: ["websocket"],
      autoConnect: true,
    });

    setSocket(newSocket);

    // Cleanup when the provider is unmounted
    return () => {
      newSocket.disconnect();
    };
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
