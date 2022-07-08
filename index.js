const Mongauth = require('./Mongauth');

const auth = new Mongauth({

    uri: process.env.URI,
    database: process.env.DATABASE,
    collection: process.env.COLLECTION,

    identifiers: {
        idKey: 'email',
        passKey: 'password'
    }
});
