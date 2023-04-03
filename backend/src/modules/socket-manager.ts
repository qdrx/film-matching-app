import * as http from "http";
import {Socket} from "socket.io";
import {RoomManager} from "./room-manager";
import {Database} from "./database";
import {IRoomId} from "../interfaces/roomId";
import {IFilm, IVoteFilm} from "../interfaces/film";

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
                if(!Array.isArray(filmPreferences) || filmPreferences.length === 0) {
                    socket.emit("roomCreationError", {error: "Film preferences are not valid"});
                    return;
                }
                const roomId = this.roomManager.generateRoomId()
                const room = this.roomManager.createRoom(roomId);
                const films = await this.database.getRandomFilmsByGenres(filmPreferences, 10);
                for (let film of films) {
                    room.films.push(film);
                }
                socket.emit("roomCreated", {roomID: roomId});
            });
            socket.on("joinRoom", (roomId: IRoomId) => {
                if (typeof roomId.id !== "string" || roomId.id.length !== 4) {
                    socket.emit("roomJoinError", {error: "Room ID is not valid"});
                    return;
                }
                const room = this.roomManager.getRoomById(roomId.id);
                if (!room) {
                    socket.emit("roomJoinError", {error: "Room not found"});
                    return;
                }
                if (room) {
                    if (room.users.length >= 2) {
                        socket.emit("roomJoinError", {error: "Room is full"});
                        return;
                    }
                    room.users.push(socket.id);
                    socket.join(roomId.id);
                    socket.emit("roomJoined", {roomID: roomId.id});
                    socket.emit("films", {films: room.films});
                }
                socket.on("vote", (voteFilm: IVoteFilm) => {
                    const room = this.roomManager.getRoomById(roomId.id);
                    if (!room) {
                        socket.emit("roomJoinError", {error: "Room not found"});
                        return;
                    }
                    if (voteFilm.vote === 0) {
                        room.bannedFilms.push(voteFilm.film)
                        this.io.to(roomId.id).emit("vote", {vote: 0, film: voteFilm.film});
                    }
                    if (voteFilm.vote === 1) {
                        room.acceptedFilms.push(voteFilm.film)
                        this.io.to(roomId.id).emit("vote", {vote: 1, film: voteFilm.film});
                    }
                });
                socket.on("showMatches", () => {
                    const matches = room.findMatchedFilms(room.acceptedFilms);
                    socket.emit("matches", {matches: matches})
                });
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