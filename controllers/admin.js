const db = require('../util/database');
const Product = require('../models/product');

exports.getAddProduct = (req, res, next) => {
  res.render('admin/add-product', {
    pageTitle: 'Add Product',
    path: '/admin/edit-product',
    editing: false,
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  req.user.createProduct({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description
  }).then(() => {
    console.log('Product Created!');
    res.redirect('/admin/products');
  })
    .catch(err => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect('/');
  }
  const prodId = req.params.productId;
  Product.findByPk(prodId).then(product => {
    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product: product
    });
  }).catch(err => {
    console.log(err);
  })

};

exports.postEditProduct = (req, res, next) => {
  const id = req.body.id;
  const updatedTitle = req.body.title;
  const upadtedImageUrl = req.body.imageUrl;
  const upadtedPrice = req.body.price;
  const upadtedDescription = req.body.description;
  Product.findByPk(id)
    .then(product => {
      product.title = updatedTitle;
      product.price = upadtedPrice;
      product.imageUrl = upadtedImageUrl;
      product.description = upadtedDescription;
      return product.save();
    }).then(() => {
      console.log('Updated product');
      res.redirect('/admin/products');
    })
    .catch(err => { console.log(err) });

};

exports.getProducts = (req, res, next) => {
  req.user.getProducts()
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

exports.psotDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByPk(prodId)
    .then(product => {
      return product.destroy();
    })
    .then(() => {
      console.log('Product DESTROYED');
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });

}
