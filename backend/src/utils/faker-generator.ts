import { faker } from '@faker-js/faker';
import {Film} from "../models/film";

export function createRandomFilm(): Film{
    return new Film(
        faker.lorem.words(3),
        faker.date.past().getFullYear(),
        faker.lorem.sentence(),
        [faker.image.imageUrl(1920, 1080, 'film'),faker.image.imageUrl(1920, 1080, 'film'),faker.image.imageUrl(1920, 1080, 'film'),],
        faker.image.imageUrl(1920, 1080, 'film'),
        faker.datatype.number(),
        faker.datatype.number(),
        faker.datatype.number(),
        faker.datatype.number(),
        [faker.name.fullName(), faker.name.fullName(), faker.name.fullName()],
        ["Action", "Comedy", "Drama", "Horror", "Thriller", "Western"]
    )
}