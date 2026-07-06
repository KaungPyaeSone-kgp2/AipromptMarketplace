# WebSocket Server Setup Guide

This guide explains how to install and run the WebSocket server for the project.

## Prerequisites

- Ensure you have **Node.js** installed on your system.

## Installation & Running

1. **Open your terminal**.
2. **Navigate** to the `socket-server` directory inside the `websocket` folder:
   ```bash
   cd websocket/socket-server
   ```
3. **Install the required dependencies** (Express, Socket.io, CORS) by running:
   ```bash
   npm install
   ```
4. **Start the WebSocket server**:
   ```bash
   npm run dev
   ```

## Expected Output
If everything is set up correctly, you should see the following message in your terminal:
```
Socket.io server listening on port 3001
```

## How It Works

- **Port**: The WebSocket server runs locally on **`http://localhost:3001`**.
- **Frontend (`SocketListener.jsx`)**: The React frontend connects to this server to listen for real-time events.
- **Backend (`socket_helper.php`)**: The PHP backend triggers events by sending a `POST` request to `http://localhost:3001/emit` with the event data. The Node server then broadcasts the data to connected clients via Socket.io.
