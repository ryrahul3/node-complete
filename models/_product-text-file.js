const fs = require('fs');
const path = require('path');

const Cart = require('./cart');

const p = path.join(
  path.dirname(process.mainModule.filename),
  'data',
  'products.json'
);

const getProductsFromFile = cb => {
  fs.readFile(p, (err, fileContent) => {
    if (err) {
      cb([]);
    } else {
      cb(JSON.parse(fileContent));
    }
  });
};

module.exports = class Product {
  constructor(title, imageUrl, description, price) {
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    this.id = Math.random().toString();
    getProductsFromFile(products => {
      products.push(this);
      fs.writeFile(p, JSON.stringify(products), err => {
        console.log(err);
      });
    });
  }

  update(id){
    this.id = id;
    getProductsFromFile(products => {
      const productIndex = products.findIndex(x=> x.id == id);
      const updatedProducts = [...products];
      updatedProducts[productIndex] = this;

      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        console.log(err);
      });
    });
  }

  static deleteById(id){
    getProductsFromFile(products => {
      const productPrice = products.find(x => x.id == id).price;
      const updatedProducts = products.filter(x => x.id != id);
    
      fs.writeFile(p, JSON.stringify(updatedProducts), err => {
        if(!err){
          Cart.deleteProduct(id, productPrice);
        }
      });
    })
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id,cb){
    getProductsFromFile(porducts => {
      const product = porducts.find(x => x.id == id);
      cb(product);
    })
  }
};
