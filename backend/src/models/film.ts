import { Schema, model } from 'mongoose';
import IFilm from '../interfaces/film';

export class Film {
    name: string;
    year: number;
    description: string;
    screenshotLinks: string[];
    image: string;
    budget: number;
    grossWorldwide: number;
    imdbRating: number;
    imdbVotes: number;
    mainActors: string[];

    constructor(
        name: string,
        year: number,
        description: string,
        screenshotLinks: string[],
        image: string,
        budget: number,
        grossWorldwide: number,
        imdbRating: number,
        imdbVotes: number,
        mainActors: string[]
    ) {
        this.name = name;
        this.year = year;
        this.description = description;
        this.screenshotLinks = screenshotLinks;
        this.image = image;
        this.budget = budget;
        this.grossWorldwide = grossWorldwide;
        this.imdbRating = imdbRating;
        this.imdbVotes = imdbVotes;
        this.mainActors = mainActors;
    }
}
