import { Room } from "../models/room";
import shortid from "shortid";
import {IFilm} from "../interfaces/film";

export class RoomManager {
    private rooms: Room[] = [];

    generateRoomId(): string {
        return shortid.generate().slice(0, 4).toUpperCase();
    }

    createRoom(id: string): Room {
        const room = new Room(id);
        this.rooms.push(room);
        return room;
    }

    getRoomById(id: string): Room | undefined {
        return this.rooms.find(room => room.id === id);
    }

    addFilmToRoom(roomId: string, film: IFilm): void {
        const room = this.getRoomById(roomId);
        if (room){
            room.films.push(film);
        }
    }

    removeRoom(room: Room): void {
        const index = this.rooms.indexOf(room);
        this.rooms.splice(index, 1);
    }
}