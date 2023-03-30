import IFilm from "../interfaces/film";
import { Schema, model } from "mongoose";

const FilmSchema = new Schema<IFilm>({
    name: {
        type: String,
        required: true,
    },
    year: {
        type: Number,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    screenshotLinks: {
        type: [String],
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    budget: {
        type: Number,
        required: true,
    },
    grossWorldwide: {
        type: Number,
        required: true,
    },
    imdbRating: {
        type: Number,
        required: true,
    },
    imdbVotes: {
        type: Number,
        required: true,
    },
    mainActors: {
        type: [String],
        required: true,
    },
});

const FilmModel = model('Film', FilmSchema)
export default FilmModel;