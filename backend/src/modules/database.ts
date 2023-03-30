import {connect} from 'mongoose';
import dotenv from 'dotenv';
import FilmModel from "../schemas/filmSchema";
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

    addRandomFilm = async () => {
        const film = createRandomFilm();
        await this.addFilm(film);
    }
}

