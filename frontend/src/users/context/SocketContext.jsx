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
    // Disable socket connection entirely in production (hosting)
    if (import.meta.env.PROD) return;

    // Connect to the WebSocket server in local development
    const socketUrl = import.meta.env.VITE_SOCKET_URL || "http://localhost:3001";
    
    const newSocket = io(socketUrl, {
      transports: ["websocket"],
      autoConnect: true,
      reconnectionAttempts: 3, // Prevent infinite spam
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
