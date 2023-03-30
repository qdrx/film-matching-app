import * as http from "http";
import {Socket} from "socket.io";
import {RoomManager} from "./room-manager";
import {Database} from "./database";

export class SocketManager {
    public readonly io;
    private readonly httpServer: http.Server;
    private roomManager: RoomManager;
    private database: Database;

    constructor(database: Database) {
        this.database = database;
        this.httpServer = require("http").createServer();
        this.roomManager = new RoomManager();
        this.io = require("socket.io")(this.httpServer);
        this.io.on("connection", (socket: Socket) => {
            console.log("A user connected: ", socket.id);
            socket.on("createRoom", async (filmPreferences: string[]) => {
                const roomId = this.roomManager.generateRoomId()
                const room = this.roomManager.createRoom(roomId);
                const films = await this.database.getRandomFilmsByGenres(filmPreferences, 10);
                console.log("Films: ", films)
                for(let film of films) {
                    room.films.push(film);
                }
                socket.emit("roomCreated", roomId);
            });
            socket.on("joinRoom", (roomId: string) => {
               const room = this.roomManager.getRoomById(roomId);
                if (room) {
                    room.users.push(socket.id);
                    socket.join(roomId);
                    socket.emit("roomJoined", roomId);
                    socket.emit("films", room.films);
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