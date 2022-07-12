const Mongauth = require('./Mongauth');

const auth = new Mongauth({

    uri: process.env.URI,
    database: process.env.DATABASE,
    collection: process.env.COLLECTION,

    identifiers: {  // Thoses are the unique identifiers you need to identify the user inside your Mongo collection.
        idKey: 'email',
        passKey: 'password'
    }
});

app.use((req, res, next) => auth.init(req, res, next)); // Build the methods inside the http request object. 
