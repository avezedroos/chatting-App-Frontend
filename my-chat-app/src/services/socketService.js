// src/services/socketService.js
import { io } from "socket.io-client";


const BACKEND_URL = "https://chatting-app-backend-ofme.onrender.com";

class SocketService {
  socket = null;
  lastSeenInterval = null;
  authToken = null;   // ✔️ store token inside service

   // set token only once
  setToken(token) {
    this.authToken = token;
  }

  // initialize socket connection
  connect() {
    if (this.socket && this.socket.connected) return this.socket;

    if (!this.authToken) {
      console.error("Socket: No token found! Please setToken() first.");
      return null;
    }

    this.socket = io(BACKEND_URL, {
     auth: { token: this.authToken }, // ✔️ use stored token
      transports: ["websocket"],
      reconnectionAttempts: 5,
    });

    this.socket.on("connect_error", (err) => {
      console.error("Socket connect error:", err.message);
    });

    return this.socket;
  }

  // safely disconnect and cleanup
  disconnect() {
    if (this.lastSeenInterval) clearInterval(this.lastSeenInterval);
    if (this.socket) {
      this.socket.off();
      this.socket.disconnect();
      this.socket = null;
    }
  }

  // listen for an event
  on(event, callback) {
    if (!this.socket) return;
    this.socket.on(event, callback);
  }

  // remove event listener
  off(event, callback) {
    if (!this.socket) return;
    this.socket.off(event, callback);
  }

  // emit event
  emit(event, data, ackCallback) {
    if (!this.socket) return;
    this.socket.emit(event, data, ackCallback);
  }

  // check if connected
  isConnected() {
    return this.socket && this.socket.connected;
  }

  // get socket instance
  getSocket() {
    return this.socket;
  }
}

const socketService = new SocketService();
export default socketService;
