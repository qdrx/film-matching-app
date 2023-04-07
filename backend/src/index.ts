import {SocketManager} from "./modules/socket-manager";
import {Database} from "./modules/database";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGO_URL || !process.env.MONGO_DB_NAME) {
    throw new Error("Missing environment variables");
}
const db = new Database(process.env.MONGO_URL?.toString(), process.env.MONGO_DB_NAME?.toString());
const socketManager: SocketManager = new SocketManager(db);

// for (let i = 0; i < 30; i++) {
//     db.addRandomFilm().then(r => console.log("random film added"));
// }