const express = require("express");
const { check, body } = require("express-validator");

const authController = require("../controllers/auth");
const User = require("../models/user");

const router = express.Router();

router.get("/login", authController.getLogin);

router.get("/signup", authController.getSignup);

router.post(
  "/login",
  check("email", "Please enter a valid email.")
    .isEmail()
    .custom(async (value, { req }) => {
      const userDoc = await User.findOne({ email: value });
      if (!userDoc) {
        return Promise.reject("Invalid email or password!");
      }
    }),
  body("password", "Invalid email or password!")
    .isLength({ min: 5 }),
  authController.postLogin
);

router.post(
  "/signup",
  check("email", "Please enter a valid email.")
    .isEmail()
    .custom(async (value, { req }) => {
      const userDoc = await User.findOne({ email: value });
      if (userDoc) {
        return Promise.reject("User email is already exists!");
      }
    }),
  body(
    "password",
    "Please enter a password with only numbers and text and atleast 5 characters."
  )
    .isLength({ min: 5 })
    .isAlphanumeric(),
  body("confirmPassword").custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error("Passwords have to match!");
    }
    return true;
  }),
  authController.postSignup
);

router.post("/logout", authController.postLogout);

router.get("/reset", authController.getResetPassword);
router.post("/reset", authController.postResetPassword);
router.get("/reset/:token", authController.getNewPassword);
router.post("/new-password", authController.postNewPassword);

module.exports = router;
