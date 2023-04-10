import {IFilm} from "../interfaces/film";

export class Room {
    id: string;
    films: IFilm[];
    users: string[];
    bannedFilms: Array<IFilm>;
    acceptedFilms: Array<IFilm>;

    constructor(id: string) {
        this.id = id;
        this.films = [];
        this.users = [];
        this.bannedFilms = new Array<IFilm>();
        this.acceptedFilms = new Array<IFilm>();
    }

    findMatchedFilms(arr: Array<IFilm>) {
        const counts = arr.reduce((acc, film) => {
            acc[film.name] = (acc[film.name] || 0) + 1;
            return acc;
        }, {});
        const duplicates = Object.keys(counts).filter(name => counts[name] > 1);
        return arr.filter(film => duplicates.includes(film.name));
    }
}