const { MongoClient } = require('mongodb');
const bcrypt = require('bcrypt');

class Mongauth {

constructor(config = {

    uri: '',
    database: '',
    collection: '',

    identifiers: {
        idKey: '',
        passKey: ''
    }
}){
    this.uri = config.uri;
    this.database = config.database;
    this.collection = config.collection;
    this.identifiers = config.identifiers;
    this.db = this.connectDb();
}

init(){
    // Built-in middleware.
}

async connectDb(){

    const client = new MongoClient(this.uri);
    const database = await client.connect();
    this.db = database.db(this.database).collection(this.collection);
}

async register(user){
    
    if(!user.hasOwnProperty(this.identifiers.idKey) && user.hasOwnProperty(this.identifiers.passKey)) throw new Error(`User object must contain: \n\n{\n\t ${this.identifiers.idKey}: String, \n\t ${this.identifiers.passKey}: String \n\n }`);
    
    const hashedPassword = await bcrypt.hash(user[this.identifiers.passKey], 10);
    const isUserExists = await this.db.findOne({[this.identifiers.idKey]: user[this.identifiers.idKey]});
    
    return new Promise((resolve, reject) => {

        if(isUserExists){
            resolve({
                message: 'User is Already Registerd!',
                userExists: true
            }); return;
        }
        
        const insert = this.db.insertOne(user);
        resolve(insert);
    });
}

}

module.exports = Mongauth;
