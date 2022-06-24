const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongodbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const multer = require("multer");

const errorController = require("./controllers/error");
const User = require("./models/user");

const MONGODB_URI =
  "mongodb+srv://root:qexban-hIjhug-6zokwi@cluster0.e9oid.mongodb.net/shop?retryWrites=true&w=majority";

const app = express();
const store = new MongodbStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const csrfProtection = csrf();
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, new Date().toISOString() + "_" + file.originalname);
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

app.set("view engine", "ejs");
app.set("views", "views");

const adminRoutes = require("./routes/admin");
const shopRoutes = require("./routes/shop");
const authRoutes = require("./routes/auth");
const router = require("./routes/admin");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(multer({ storage: fileStorage, fileFilter:fileFilter }).single("image"));
app.use(express.static(path.join(__dirname, "public")));
app.use('/images',express.static(path.join(__dirname, "images")));
app.use(
  session({
    secret: "my scret",
    resave: false,
    saveUninitialized: false,
    store: store,
  })
);

app.use(csrfProtection);
app.use(flash());



app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

app.use((req, res, next) => {
  if (!req.session.user || !req.session.user._id) {
    return next();
  }
  User.findById(req.session.user._id)
    .then((user) => {
      req.user = user;
      next();
    })
    .catch((err) => {
      next(Error(error));
    });
});

app.use("/admin", adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
router.get("/500", errorController.get500);
app.use(errorController.get404);
app.use((error, req, res, next) => {
  //res.status(error.httpStatusCode).render(..);
  res.redirect("/500");
});

mongoose
  .connect(MONGODB_URI)
  .then((res) => {
    console.log("Connected!!");
    app.listen(3000);
  })
  .catch((err) => {
    console.log(err);
  });
