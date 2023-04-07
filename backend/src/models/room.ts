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
        let result = arr.filter((film, index) => arr.indexOf(film) != index);
        console.log(result);
        return result;
    }
}