import {connect} from 'mongoose';

export class Database {
    constructor(
        private readonly mongoUrl: string,
        private readonly mongoDbName: string
    ) {

    }
    connect = async () => {
        await connect(this.mongoUrl, {
            dbName: this.mongoDbName
        });
    }
}