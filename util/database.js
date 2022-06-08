const mongodb = require('mongodb');
const MongoClient = mongodb.MongoClient;

let _db;

const mongoConnect = callback => {
    MongoClient
        .connect('mongodb+srv://root:qexban-hIjhug-6zokwi@cluster0.e9oid.mongodb.net/shop?retryWrites=true&w=majority')
        .then(client => {
            console.log('Connected!')
            _db = client.db();
            callback();
        })
        .catch(err => {
            console.log(err);
        });
};

const getdb = () => {
    if (_db) {
        return _db;
    }
    throw 'No database connection found!'
}

exports.mongoConnect = mongoConnect;
exports.getdb = getdb;