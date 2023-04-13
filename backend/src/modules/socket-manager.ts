import * as http from "http";
import {IncomingMessage} from "http";
import {Socket} from "socket.io";
import {RoomManager} from "./room-manager";
import {Database} from "./database";
import {IRoomId} from "../interfaces/roomId";
import {IFilmPreferences, IVoteFilm} from "../interfaces/film";
import logger from "./logger";
import {Counter, Gauge, Registry} from "prom-client";

export class SocketManager {
    public readonly io;
    private readonly httpServer: http.Server;
    private roomManager: RoomManager;
    private database: Database;
    private activeClients: Gauge<string>;
    private receivedMessagesCounter: Counter<string>;
    private readonly registry: Registry;
    private readonly port: number;

    constructor(database: Database, port?: number) {
        this.database = database;
        this.port = port || 3000;
        this.httpServer = require("http").createServer((req: IncomingMessage, res: http.ServerResponse) => {
            if (req.url === "/metrics") {
                this.getMetricsEndpoint(req, res);
            } else {
                res.writeHead(404);
                res.end();
            }
        });
        this.roomManager = new RoomManager();
        this.io = require("socket.io")(this.httpServer);
        this.registry = new Registry();

        this.receivedMessagesCounter = new Counter({
            name: "received_messages_total",
            help: "Total number of received messages",
            registers: [this.registry],
        });

        this.activeClients = new Gauge({
            name: "socket_active_clients",
            help: "Total number of active clients",
            registers: [this.registry],
        });

        this.io.use((socket: Socket, next: () => void) => {
            socket.onAny((event: string, ...args) => {
                this.receivedMessagesCounter.inc();
                logger.info(`Socket: ${socket.id}: called ${event} event with args: ${args}`);
            });
            next();
        });

        this.io.on("connection", this.handleConnection);

        this.httpServer.listen(this.port, () => {
            logger.info(`Server started on port ${port}`);
        });
    }

    public getMetricsEndpoint(req: http.IncomingMessage, res: http.ServerResponse): void {
        res.setHeader("Content-Type", this.registry.contentType);
        this.registry
            .metrics()
            .then((data) => {
                res.end(data);
            })
            .catch((err) => {
                res.statusCode = 500;
                res.end(err);
            });
    }

    private handleConnection = async (socket: Socket) => {
        logger.info(`New client connected: ${socket.id}`);
        this.activeClients.inc();
        socket.on("createRoom", this.handleCreateRoom(socket));
        socket.on("joinRoom", this.handleJoinRoom(socket));
        socket.on("vote", this.handleVote(socket));
        socket.on("showMatches", this.handleMatches(socket));
        socket.on("disconnect", this.handleDisconnect(socket));
    };

    private handleCreateRoom = (socket: Socket) => async (filmPreferences: IFilmPreferences) => {
        if (!Array.isArray(filmPreferences.genres) || filmPreferences.genres.length === 0) {
            logger.error(`socket: ${socket.id}: Film preferences are not valid`)
            socket.emit("roomCreationError", {error: "Film preferences are not valid"});
            return;
        }
        const roomId = this.roomManager.generateRoomId();
        const room = this.roomManager.createRoom(roomId);
        const films = await this.database.getRandomFilmsByGenres(filmPreferences.genres, 10);
        for (let film of films) {
            room.films.push(film);
        }
        logger.info(`Room created: ${roomId}, socket: ${socket.id}`);
        socket.emit("roomCreated", {roomID: roomId});
    };

    private handleJoinRoom = (socket: Socket) => async (roomId: IRoomId) => {
        if (typeof roomId.id !== "string" || roomId.id.length !== 4) {
            socket.emit("roomJoinError", {error: "Room ID is not valid"});
            return;
        }
        const room = this.roomManager.getRoomById(roomId.id);
        if (!room) {
            logger.error(`socket: ${socket.id}: Room not found`);
            socket.emit("roomJoinError", {error: "Room not found"});
            return;
        }
        if (room) {
            if (room.users.length >= 2) {
                logger.error(`socket: ${socket.id}: Room is full`);
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
            logger.error(`socket: ${socket.id}: Room ID is not valid`);
            socket.emit("roomJoinError", {error: "Room ID is not valid"});
            return;
        }
        const room = this.roomManager.getRoomById(voteFilm.roomID);
        if (typeof room === undefined) {
            logger.error(`socket: ${socket.id}: Room not found`);
            socket.emit("roomJoinError", {error: "Room not found"});
            return;
        }
        if (voteFilm.vote === 0) {
            room.bannedFilms.push(voteFilm.film)
            logger.info(`socket: ${socket.id}: Vote: ${voteFilm.vote}, film: ${voteFilm.film.name}`);
            socket.emit("vote", {vote: 0, film: voteFilm.film});
        }
        if (voteFilm.vote === 1) {
            room.acceptedFilms.push(voteFilm.film)
            logger.info(`socket: ${socket.id}: Vote: ${voteFilm.vote}, film: ${voteFilm.film.name}`);
            socket.emit("vote", {vote: 1, film: voteFilm.film});
        }
    }

    private handleMatches = (socket: Socket) => async (roomId: IRoomId) => {
        if (typeof roomId.id !== "string" || roomId.id.length !== 4) {
            logger.error(`socket: ${socket.id}: Room ID is not valid`)
            socket.emit("roomJoinError", {error: "Room ID is not valid"});
            return;
        }
        const room = this.roomManager.getRoomById(roomId.id);
        if (typeof room === undefined) {
            logger.error(`socket: ${socket.id}: Room not found`);
            socket.emit("roomJoinError", {error: "Room not found"});
            return;
        }
        const matches = room.findMatchedFilms(room.acceptedFilms);
        logger.info(`socket: ${socket.id}: Called showMatches}`);
        socket.emit("matches", {matches: matches});
    }

    private handleDisconnect = (socket: Socket) => async () => {
        logger.info(`socket: ${socket.id}: Client disconnected`);
        this.activeClients.dec();
    }
}