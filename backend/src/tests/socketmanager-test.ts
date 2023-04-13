import { expect } from "chai";
import * as io from "socket.io-client";
import { SocketManager } from "../modules/socket-manager";
import { Database } from "../modules/database";
import dotenv from "dotenv";

dotenv.config();
const PORT = 3000;

describe("SocketManager", function () {
    let roomId: string;
    let socketManager: SocketManager;
    before(function (done) {
        const database = new Database(process.env.MONGO_URL.toString(), process.env.MONGO_DB_NAME.toString());
        socketManager = new SocketManager(database, PORT);
        done();
    });

    after(function (done) {
        socketManager.io.close();
        done();
    });

    describe("#handleCreateRoom", function () {
        it("should emit a roomCreated event when given valid film preferences", function (done) {
            const socket = io.connect(`http://localhost:${PORT}`);
            socket.on("connect", () => {
                socket.emit("createRoom", {genres: ["Action"]});
                socket.on("roomCreated", (data) => {
                    expect(data.roomID).to.be.a("string");
                    done();
                });
            });
        });

        it("should emit a roomCreationError event when given invalid film preferences", function (done) {
            const socket = io.connect(`http://localhost:${PORT}`);
            socket.on("connect", () => {
                socket.emit("createRoom", {genres: []});
                socket.on("roomCreationError", (data) => {
                    expect(data.error).to.be.a("string");
                    done();
                });
            });
        });
    });

    describe("#handleJoinRoom", function () {

        beforeEach(function (done) {
            const socket = io.connect(`http://localhost:${PORT}`);
            socket.on("connect", () => {
                socket.emit("createRoom",{"genres": ["Action"]});
                socket.on("roomCreated", (data) => {
                    roomId = data.roomID;

                    done();
                });
            });
        });

        it("should emit a roomJoined event when given a valid room ID", function (done) {
            const socket = io.connect(`http://localhost:${PORT}`);
            let data = { "id": roomId }
            socket.on("connect", () => {
                console.log(roomId);
                socket.emit("joinRoom", data);
                socket.on("roomJoined", (data) => {
                    console.log(data)
                    expect(data.roomID).to.equal(roomId);
                    done();
                });
            });
        });

        it("should emit a roomJoinError event when given an invalid room ID", function (done) {
            const socket = io.connect(`http://localhost:${PORT}`);
            socket.on("connect", () => {
                socket.emit("joinRoom", { "id": "invalid" });
                socket.on("roomJoinError", (data) => {
                    expect(data.error).to.be.a("string");
                    done();
                });
            });
        });

        it("should emit a roomJoinError event when trying to join a full room", function (done) {
            const socket1 = io.connect(`http://localhost:${PORT}`);
            const socket2 = io.connect(`http://localhost:${PORT}`);
            const socket3 = io.connect(`http://localhost:${PORT}`);

            socket1.on("connect", () => {
                socket1.emit("joinRoom", { id: roomId });
            });
           socket2.on("connect", () => {
                socket2.emit("joinRoom", { id: roomId });
            });
            socket3.on("connect", () => {
                socket3.emit("joinRoom", {id: roomId});
                socket3.on("roomJoinError", (data) => {
                    expect(data.error).to.be.a("string", "Room is full");
                    socket1.disconnect();
                    socket2.disconnect();
                    socket3.disconnect();
                    done();
                });
            });
        });
    });
});