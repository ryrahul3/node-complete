const mongodb = require('mongodb');

const getdb = require('../util/database').getdb;

const Product = class Product {
  constructor(title, imageUrl, description, price, id, userId) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
    this._id = id ? new mongodb.ObjectId(id) : null;
    this.userId = new mongodb.ObjectId(userId);
  }

  save() {
    const db = getdb();
    let dbOp;
    if (this._id) {
      dbOp = db.collection('products')
        .updateOne({ _id: new mongodb.ObjectId(this._id) }, { $set: this })
    } else {
      dbOp = db.collection('products')
        .insertOne(this);
    }
    return dbOp
      .then(result => {
        console.log(result);
      })
      .catch(err => {
        console.log(err);
      });
  };

  static fetchAll() {
    const db = getdb();
    return db.collection('products')
      .find()
      .toArray()
      .then(products => {
        return products;
      })
      .catch(err => {
        console.log(err);
      })
  };

  static findById(prodId) {
    const db = getdb();
    return db.collection('products')
      .find({ _id: new mongodb.ObjectId(prodId) })
      .next()
      .then(product => {
        console.log(product);
        return product;
      })
      .catch(err => {
        console.log(err);
      })
  };
  
  static deleteById(prodId){
    const db = getdb();
    return db.collection('products')
    .deleteOne({_id : new mongodb.ObjectId(prodId)})
    .then(()=>{
      console.log('Product deleted!')
    })
    .catch(err=>{
      console.log(err);
    })
  }
}



module.exports = Product;