import {SocketManager} from "./modules/socket-manager";
import {Database} from "./modules/database";
import dotenv from "dotenv";

dotenv.config();
const socketManager: SocketManager = new SocketManager();
if (!process.env.MONGO_URL || !process.env.MONGO_DB_NAME) {
    throw new Error("Missing environment variables");
}
const db = new Database(process.env.MONGO_URL?.toString(), process.env.MONGO_DB_NAME?.toString());
// TODO: Finish create models for mongoose