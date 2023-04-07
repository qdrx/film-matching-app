import { faker } from '@faker-js/faker';
import { IFilm } from "../interfaces/film";

export function createRandomFilm(): IFilm {
    return {
        name: faker.lorem.words(3),
        year: faker.date.past().getFullYear(),
        description: faker.lorem.sentence(),
        screenshotLinks: [faker.image.imageUrl(1920, 1080, 'film'),faker.image.imageUrl(1920, 1080, 'film'),faker.image.imageUrl(1920, 1080, 'film')],
        image: faker.image.imageUrl(1920, 1080, 'film'),
        budget: faker.datatype.number(),
        grossWorldwide: faker.datatype.number(),
        imdbRating: faker.datatype.number(),
        imdbVotes: faker.datatype.number(),
        mainActors: [faker.name.fullName(), faker.name.fullName(), faker.name.fullName()],
        genres: ["Action", "Comedy", "Drama", "Horror", "Thriller", "Western"]
    };
}
