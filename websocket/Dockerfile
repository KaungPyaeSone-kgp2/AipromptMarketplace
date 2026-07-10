FROM node:20-alpine

WORKDIR /app

# Copy only what's needed for the socket server
COPY package*.json ./

# Install only production dependencies
RUN npm install --omit=dev

# Copy the server file
COPY socket-server/server.js ./server.js

EXPOSE 3001

CMD ["node", "server.js"]
