const Product = require("../models/product");

exports.getAddProduct = (req, res, next) => {
  res.render("admin/add-product", {
    pageTitle: "Add Product",
    path: "/admin/edit-product",
    editing: false,
    formsCSS: true,
    productCSS: true,
    activeAddProduct: true,
  });
};

exports.postAddProduct = (req, res, next) => {
  const title = req.body.title;
  const imageUrl = req.body.imageUrl;
  const price = req.body.price;
  const description = req.body.description;
  const userId = req.user._id;
  const product = new Product({
    title: title,
    imageUrl: imageUrl,
    price: price,
    description: description,
    userId:userId
  });
  product
    .save()
    .then(() => {
      console.log("Product Created!");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getProducts = (req, res, next) => {
  Product.find()
    // .select('title price -id')
    // .populate('userId', 'name')
    .then((products) => {
      res.render("admin/products", {
        prods: products,
        pageTitle: "Admin Products",
        path: "/admin/products",
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getEditProduct = (req, res, next) => {
  const editMode = req.query.edit;
  if (!editMode) {
    return res.redirect("/");
  }
  const prodId = req.params.productId;
  Product.findById(prodId)
    .then((product) => {
      res.render("admin/edit-product", {
        pageTitle: "Edit Product",
        path: "/admin/edit-product",
        editing: editMode,
        product: product,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postEditProduct = (req, res, next) => {
  const id = req.body.id;
  const updatedTitle = req.body.title;
  const upadtedImageUrl = req.body.imageUrl;
  const upadtedPrice = req.body.price;
  const upadtedDescription = req.body.description;
  const userId = req.user;

  Product.findById(id)
    .then((product) => {
      product.title = updatedTitle;
      product.price = upadtedPrice;
      product.description = upadtedDescription;
      product.imageUrl = upadtedImageUrl;
      product.userId = userId;
      return product.save();
    })
    .then(() => {
      console.log("Updated product");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.psotDeleteProduct = (req, res, next) => {
  const prodId = req.body.productId;
  Product.findByIdAndDelete(prodId)
    .then(() => {
      console.log("Product DESTROYED");
      res.redirect("/admin/products");
    })
    .catch((err) => {
      console.log(err);
    });
};
