import {connect} from 'mongoose';
import dotenv from 'dotenv';
import FilmModel from "../schemas/film-schema";
import {IFilm} from "../interfaces/film";
import {createRandomFilm} from "../utils/faker-generator";


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

    getRandomFilmsByGenres = async (genres: string[], limit: number): Promise<IFilm[]> => {

        if (typeof genres === 'string') {
            genres = [genres];
        }
        const filmsData: Array<IFilm> = await FilmModel.aggregate([
            { $match: { genres: { $in: genres } } },
            { $sample: { size: limit } }
        ]).exec();
        return Array.isArray(filmsData) ? filmsData : [];
    };

    addRandomFilm = async () => {
        const film = createRandomFilm();
        await this.addFilm(film);
    }
}

