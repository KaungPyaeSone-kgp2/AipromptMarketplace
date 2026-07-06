import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);

// Allow cross-origin requests from the React frontend
const io = new Server(httpServer, {
  cors: {
    origin: "*", // Adjust this in production to match your frontend URL
    methods: ["GET", "POST"]
  }
});

// Middleware to parse JSON bodies for the internal REST endpoint
app.use(express.json());
app.use(cors());

// WebSocket Connection Logic
io.on('connection', (socket) => {
  console.log(`[Socket.io] New client connected: ${socket.id}`);

  // Retrieve userId from connection handshake
  const userId = socket.handshake.auth.userId;

  if (userId) {
    const roomName = `user_${userId}`;
    socket.join(roomName);
    console.log(`[Socket.io] Socket ${socket.id} joined room: ${roomName}`);
  }

  // Handle explicit join_room events for prompts or feeds
  socket.on('join_room', (room) => {
    socket.join(room);
    console.log(`[Socket.io] Socket ${socket.id} joined room: ${room}`);
  });

  socket.on('leave_room', (room) => {
    socket.leave(room);
    console.log(`[Socket.io] Socket ${socket.id} left room: ${room}`);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Client disconnected: ${socket.id}`);
  });
});

// Internal REST API for PHP to trigger events
app.post('/emit', (req, res) => {
  const { event, data, room } = req.body;

  if (!event) {
    return res.status(400).json({ error: "Missing 'event' field" });
  }

  if (room) {
    // Broadcast to a specific room (e.g., user_123 or prompt_456)
    io.to(room).emit(event, data);
    console.log(`[API] Emitted '${event}' to room '${room}'`);
  } else {
    // Broadcast globally to all connected clients
    io.emit(event, data);
    console.log(`[API] Emitted '${event}' globally`);
  }

  res.json({ success: true, message: `Event '${event}' emitted successfully` });
});

const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.io server listening on port ${PORT}`);
});
