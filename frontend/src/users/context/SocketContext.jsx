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
    // Connect to the WebSocket server dynamically based on environment
    let socketUrl = import.meta.env.VITE_SOCKET_URL;
    if (!socketUrl) {
      socketUrl = import.meta.env.PROD ? undefined : "http://localhost:3001";
    }
    
    // Only connect if we have a valid URL or we are in prod (where undefined defaults to current host)
    const newSocket = io(socketUrl, {
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
