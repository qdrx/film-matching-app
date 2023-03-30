import {connect} from 'mongoose';
import dotenv from 'dotenv';

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
}

