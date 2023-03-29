import { Film } from "./film";

export class Room {
    id: string;
    films: Film[];
    users: string[];
    bannedFilms: Set<string>;
    acceptedFilms: Set<string>;

    constructor(id: string) {
        this.id = id;
        this.films = [];
        this.users = [];
        this.bannedFilms = new Set();
        this.acceptedFilms = new Set();
    }
}