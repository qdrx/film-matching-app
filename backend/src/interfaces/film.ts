export interface IFilm {
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
    genres: string[];
}

export interface IVoteFilm {
    film: IFilm;
    vote: number;
    roomID: string;
}