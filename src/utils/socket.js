const socket = require("socket.io");
const Message = require("../models/message");

const initalizedSocket = (server) =>{
    const io = socket(server,{
        cors:{
            origin: "http://localhost:5173",
        },
    });

    // Store user socket connections and their rooms
    const userRooms = new Map(); // socketId -> Set of roomIds
    const socketUsers = new Map(); // socketId -> { userId, firstName }

    io.on("connection", (socket)=>{
        console.log("User connected:", socket.id);

        // Store socket user info on connection
        socketUsers.set(socket.id, { userId: null, firstName: null });

        socket.on("joinChat",({ firstName, userId, connectionId})=>{
            try {
                const roomId = [userId, connectionId].sort().join("_");
                
                // Store user info
                socketUsers.set(socket.id, { userId, firstName });
                
                // Track rooms for this socket
                if (!userRooms.has(socket.id)) {
                    userRooms.set(socket.id, new Set());
                }
                userRooms.get(socket.id).add(roomId);
                
                socket.join(roomId);
                console.log(`${firstName} (${userId}) joined Room: ${roomId}`);
                
                // Notify others in the room (optional - for typing indicators, etc.)
                socket.to(roomId).emit("userJoined", {
                    userId: userId.toString(),
                    firstName,
                    roomId
                });
            } catch (err) {
                console.error("Error in joinChat:", err);
            }
        });

        socket.on("leaveChat", ({ userId, connectionId }) => {
            try {
                const roomId = [userId, connectionId].sort().join("_");
                const userInfo = socketUsers.get(socket.id);
                
                if (userInfo && userRooms.has(socket.id)) {
                    userRooms.get(socket.id).delete(roomId);
                    socket.leave(roomId);
                    
                    console.log(`${userInfo.firstName || userId} left Room: ${roomId}`);
                    
                    // Notify others in the room
                    socket.to(roomId).emit("userLeft", {
                        userId: userId.toString(),
                        roomId
                    });
                }
            } catch (err) {
                console.error("Error in leaveChat:", err);
            }
        });

        socket.on(
            "sendMessage",
            async ({firstName, userId, connectionId, text})=>{
                try {
                    const roomId = [userId, connectionId].sort().join("_");
                    console.log(`${firstName} says: ${text} in Room: ${roomId}`);
                    
                    // Save message to database
                    const newMessage = new Message({
                        senderId: userId,
                        receiverId: connectionId,
                        text: text,
                        firstName: firstName,
                        roomId: roomId
                    });
                    
                    const savedMessage = await newMessage.save();
                    
                    // Emit to all users in the room
                    io.to(roomId).emit("messageReceived", { 
                        firstName, 
                        text, 
                        userId: userId.toString(),
                        timestamp: savedMessage.createdAt
                    });
                } catch (err) {
                    console.error("Error saving message:", err);
                    // Still emit the message even if saving fails
                    const roomId = [userId, connectionId].sort().join("_");
                    io.to(roomId).emit("messageReceived", { 
                        firstName, 
                        text, 
                        userId: userId.toString(),
                        timestamp: new Date()
                    });
                }
            });

        socket.on("disconnect", (reason) => {
            try {
                const userInfo = socketUsers.get(socket.id);
                const rooms = userRooms.get(socket.id);
                
                console.log(`User disconnected: ${socket.id}, Reason: ${reason}`);
                
                if (userInfo && rooms) {
                    // Notify all rooms that user left
                    rooms.forEach(roomId => {
                        socket.to(roomId).emit("userLeft", {
                            userId: userInfo.userId ? userInfo.userId.toString() : null,
                            roomId,
                            reason: reason
                        });
                        console.log(`Notified Room ${roomId} that user left`);
                    });
                }
                
                // Clean up
                userRooms.delete(socket.id);
                socketUsers.delete(socket.id);
                
                console.log(`Cleaned up socket: ${socket.id}`);
            } catch (err) {
                console.error("Error in disconnect handler:", err);
            }
        });

        // Handle connection errors
        socket.on("error", (error) => {
            console.error(`Socket error for ${socket.id}:`, error);
        });
    });

    // Graceful shutdown handling
    process.on("SIGTERM", () => {
        console.log("SIGTERM received, closing socket server");
        io.close(() => {
            console.log("Socket server closed");
            process.exit(0);
        });
    });

    process.on("SIGINT", () => {
        console.log("SIGINT received, closing socket server");
        io.close(() => {
            console.log("Socket server closed");
            process.exit(0);
        });
    });
};

module.exports = initalizedSocket;