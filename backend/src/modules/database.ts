import {connect} from 'mongoose';
import dotenv from 'dotenv';
import FilmModel from "../schemas/film-schema";
import {IFilm} from "../interfaces/film";
import {createRandomFilm} from "../utils/faker-generator";
import {Film} from "../models/film";


export class Database {
    mongoUrl: string;
    mongoDbName: string;

    constructor(mongoUrl: string, mongoDbName: string) {
        this.mongoUrl = mongoUrl;
        this.mongoDbName = mongoDbName;
        dotenv.config();
        this.connection();
    }
    connection = async () => {
        await connect(this.mongoUrl, {
            dbName: this.mongoDbName
        });
        console.log('Connected to database');
    };

    addFilm = async (film: IFilm) => {
        const filmModel = new FilmModel(film);
        await filmModel.save();
    }

    getRandomFilmsByGenres = async (genres: string[], limit: number): Promise<Film[]> => {

        if (typeof genres === 'string') {
            genres = [genres];
        }
        const filmsData: Array<IFilm> = await FilmModel.find({ $or: genres.map(genre => ({ genres: genre })) }).limit(limit);
        return Array.isArray(filmsData) ? filmsData.map((filmData) => new Film(
            filmData.name,
            filmData.year,
            filmData.description,
            filmData.screenshotLinks,
            filmData.image,
            filmData.budget,
            filmData.grossWorldwide,
            filmData.imdbRating,
            filmData.imdbVotes,
            filmData.mainActors,
            filmData.genres,
        )) : [];
    };

    addRandomFilm = async () => {
        const film = createRandomFilm();
        await this.addFilm(film);
    }
}

