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

async connectDb(){

    const client = new MongoClient(this.uri);
    const database = await client.connect();
    this.db = database.db(this.database).collection(this.collection);
}

init(req, res, next){

    req.db = this.db;
    req.identifiers = this.identifiers;
    req.register = this.register;
    req.login = this.login;
    next();
}

async register(user = this.body.user){

    const idKey = this.identifiers.idKey;
    const passKey = this.identifiers.passKey;

    if(!user.hasOwnProperty(idKey) || !user.hasOwnProperty(passKey)) throw new Error(`User object must contain: \n\n{\n\t ${idKey}: String, \n\t ${passKey}: String \n\n }`);
    
    const hashedPassword = await bcrypt.hash(user[passKey], 10);
    const User = await this.db.findOne({[idKey]: user[idKey]});
    
    return new Promise((resolve, reject) => {

        if(User){
            resolve({
                message: 'User is Already Registerd!',
                userExists: true
            }); return;
        }

        user[passKey] = hashedPassword;
        
        const insert = this.db.insertOne(user);
        resolve(insert);
    });
}

async login(user = this.body.user){

    const idKey = this.identifiers.idKey;
    const passKey = this.identifiers.passKey;

    if(!user.hasOwnProperty(idKey) || !user.hasOwnProperty(passKey)) throw new Error(`User object must contain: \n\n{\n\t ${idKey}: String, \n\t ${passKey}: String \n\n }`);

    const User = await this.db.findOne({[idKey]: user[idKey]});
    const isPasswordValid = await bcrypt.compare(user[passKey], User[passKey]);

    return new Promise((resolve, reject) => {

        if(!User){
            resolve({
                message: 'User not found.',
                userExists: false,
                loggedIn: false
            }); return;
        }

        if(this.session.user){
            resolve({
                message: 'User is already logged-in!',
                userExists: true,
                loggedIn: true,
                alreadyLoggedIn: true
            }); return;
        }

        if(!isPasswordValid){
            resolve({
                message: `${idKey} or ${passKey} is incorrect.`,
                userExists: true,
                loggedIn: false
            });
        }

        if(isPasswordValid){
            this.session.user = User;
            resolve({
                message: 'User has been logged-in!',
                userExists: true,
                loggedIn: true
            }); return;
        }


    });
}

logout(){
    return new Promise((resolve, reject) => {

        if(this.session.user){
            this.session.user = undefined;
            resolve({
                message: 'User has been logged-out!',
                loggedOut: true
            }); return;
        }

        if(!this.session.user){
            resolve({
                message: 'User was not logged-in.',
                loggedOut: false
            }); return;
        }
    });
}

}

module.exports = Mongauth;
