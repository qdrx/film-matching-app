import * as http from "http";
import {Socket} from "socket.io";
import {RoomManager} from "./room-manager";

export class SocketManager {
    public readonly io;
    private readonly httpServer: http.Server;
    private roomManager: RoomManager;

    constructor() {
        this.httpServer = require("http").createServer();
        this.roomManager = new RoomManager();
        this.io = require("socket.io")(this.httpServer);
        this.io.on("connection", (socket: Socket) => {
            console.log("A user connected: ", socket.id);
            socket.on("createRoom", (filmPreferences: string[]) => {
                const roomId = this.roomManager.generateRoomId()
                const room = this.roomManager.createRoom(roomId);

                socket.emit("roomCreated", roomId);
            });
            socket.on("joinRoom", (roomId: string) => {
               const room = this.roomManager.getRoomById(roomId);
                if (room) {
                    room.users.push(socket.id);
                    socket.join(roomId);
                    socket.emit("roomJoined", roomId);
                }
            });
            socket.on("disconnect", () => {
                console.log("user disconnected");
            });
        });
        this.httpServer.listen(3000, () => {
            console.log("listening on *:3000");
        });
    }
}