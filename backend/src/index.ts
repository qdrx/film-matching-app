import {SocketManager} from "./modules/socket-manager";
import {Database} from "./modules/database";

const socketManager = new SocketManager();
const database = new Database("mongodb://localhost:27017", "test");

// TODO: Finish Database connection, create models for mongoose