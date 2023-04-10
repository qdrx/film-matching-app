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

        this.io.on("connection", this.handleConnection);

        this.httpServer.listen(3000, () => {
            console.log("Listening on port 3000");
        });
    }

    private handleConnection = async (socket: Socket) => {
        console.log(`A user connected: ${socket.id}`);
        socket.on("createRoom", this.handleCreateRoom(socket));
        socket.on("joinRoom", this.handleJoinRoom(socket));
        socket.on("vote", this.handleVote(socket));
        socket.on("showMatches", this.handleMatches(socket));
    };

    private handleCreateRoom = (socket: Socket) => async (filmPreferences: string[]) => {
        if (!Array.isArray(filmPreferences) || filmPreferences.length === 0) {
            socket.emit("roomCreationError", {error: "Film preferences are not valid"});
            return;
        }
        const roomId = this.roomManager.generateRoomId();
        const room = this.roomManager.createRoom(roomId);
        const films = await this.database.getRandomFilmsByGenres(filmPreferences, 10);
        for (let film of films) {
            room.films.push(film);
        }
        socket.emit("roomCreated", {roomID: roomId});
    };

    private handleJoinRoom = (socket: Socket) => async (roomId: IRoomId) => {
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
    };

    private handleVote = (socket: Socket) => async (voteFilm: IVoteFilm) => {
        if (typeof voteFilm.roomID !== "string" || voteFilm.roomID.length !== 4) {
            socket.emit("roomJoinError", {error: "Room ID is not valid"});
            return;
        }
        const room = this.roomManager.getRoomById(voteFilm.roomID);
        if (typeof room === undefined) {
            socket.emit("roomJoinError", {error: "Room not found"});
            return;
        }
        if (voteFilm.vote === 0) {
            room.bannedFilms.push(voteFilm.film)
            socket.emit("vote", {vote: 0, film: voteFilm.film});
        }
        if (voteFilm.vote === 1) {
            room.acceptedFilms.push(voteFilm.film)
            socket.emit("vote", {vote: 1, film: voteFilm.film});
        }
    }

    private handleMatches = (socket: Socket) => async (roomId: IRoomId) => {
        if (typeof roomId.id !== "string" || roomId.id.length !== 4) {
            socket.emit("roomJoinError", {error: "Room ID is not valid"});
            return;
        }
        const room = this.roomManager.getRoomById(roomId.id);
        if (typeof room === undefined) {
            socket.emit("roomJoinError", {error: "Room not found"});
            return;
        }
        const matches = room.findMatchedFilms(room.acceptedFilms);
        socket.emit("matches", {matches: matches});
    }
}