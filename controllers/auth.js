const crypto = require("crypto");

const bcrypt = require("bcryptjs");
var nodemailer = require("nodemailer");
const { validationResult } = require("express-validator");

const User = require("../models/user");

var transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "ryrahul06@gmail.com",
    pass: "ryanurahul",
  },
});
var mailOptions = {
  from: "ryrahul06@gmail.com",
  to: "ryrahul_yadav@outlook.com",
  subject: "Sending Email using Node.js",
  text: "That was easy!",
};

exports.getLogin = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/login", {
    path: "/login",
    pageTitle: "Login",
    isAuthenticated: false,
    errorMessage: message,
    olderInput: {
      email: "",
      password: "",
    },
    validationErrors: [],
  });
};

exports.getResetPassword = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/reset", {
    path: "/reset",
    pageTitle: "Reset Password",
    isAuthenticated: false,
    errorMessage: message,
  });
};

exports.postResetPassword = (req, res, next) => {
  crypto.randomBytes(32, (err, buffer) => {
    if (err) {
      console.log(err);
      return res.redirect("/reset");
    }
    const token = buffer.toString("hex");
    User.findOne({ email: req.body.email })
      .then((user) => {
        if (!user) {
          req.flash("error", "User user found with that email.");
          return res.redirect("reset-password");
        }
        user.resetToken = token;
        user.resetTokeExpiration = Date.now() + 360000;
        return user.save();
      })
      .then(() => {
        mailOptions.to = req.body.email;
        mailOptions.subject = "Password Reset";
        mailOptions.html = `<p>You Requested a password reset<p>
                            <p> Click this <a href="http://localhost:3000/reset/${token}">Link</a> to set new password.`;
        transporter.sendMail(mailOptions, function (error, info) {
          if (error) {
            console.log(error);
          } else {
            res.redirect("/reset");
            console.log("Email sent: " + info.response);
          }
        });
      })
      .catch((err) => {
        console.log(err);
        return res.redirect("/reset");
      });
  });
};

exports.getNewPassword = (req, res, next) => {
  const token = req.params.token;
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  User.findOne({ resetToken: token, resetTokeExpiration: { $gt: Date.now() } })
    .then((user) => {
      if (!user) {
        req.flash("error", "Url expire");
        return res.redirect(`/reset`);
      }
      res.render("auth/new-password", {
        path: "/reset",
        pageTitle: "New Password",
        isAuthenticated: false,
        errorMessage: message,
        userId: user._id.toString(),
        passwordToken: token,
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postNewPassword = (req, res, next) => {
  const newPassword = req.body.password;
  const userId = req.body.userId;
  const passwordToken = req.body.passwordToken;
  let resetUser;
  console.log(req.body);
  User.findOne({
    resetToken: passwordToken,
    resetTokeExpiration: { $gt: Date.now() },
    _id: userId,
  })
    .then((user) => {
      console.log(user);
      resetUser = user;
      return bcrypt.hash(newPassword, 12);
    })
    .then((hashPassword) => {
      resetUser.password = hashPassword;
      resetUser.resetToken = undefined;
      resetUser.resetTokeExpiration = undefined;
      return resetUser.save();
    })
    .then(() => {
      res.redirect("/login");
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash("error");
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render("auth/signup", {
    path: "/signup",
    pageTitle: "Signup",
    isAuthenticated: false,
    errorMessage: message,
    olderInput: {
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationErrors: [],
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/login", {
      path: "/login",
      pageTitle: "Login",
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      olderInput: {
        email: email,
        password: password,
      },
    });
  }

  User.findOne({ email: email })
    .then((user) => {
      bcrypt
        .compare(password, user.password)
        .then((doMatch) => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
              res.redirect("/");
            });
          }
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            isAuthenticated: false,
            errorMessage: "Invalid email or password!",
            validationErrors: [],
            olderInput: {
              email: email,
              password: password,
            },
          });
        })
        .catch((err) => {
          return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login",
            isAuthenticated: false,
            errorMessage: "Invalid email or password!",
            validationErrors: [],
            olderInput: {
              email: email,
              password: password,
            },
          });
        });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postSignup = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const confirmPassword = req.body.confirmPassword;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render("auth/signup", {
      path: "/signup",
      pageTitle: "Signup",
      isAuthenticated: false,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      olderInput: {
        email: email,
        password: password,
        confirmPassword: confirmPassword,
      },
    });
  }

  bcrypt
    .hash(password, 12)
    .then((hashPassword) => {
      const user = new User({
        email: email,
        password: hashPassword,
        cart: { items: [] },
      });
      return user.save();
    })
    .then(() => {
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
        } else {
          res.redirect("/login");
          console.log("Email sent: " + info.response);
        }
      });
    })
    .catch((err) => {
      console.log(err);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy((err) => {
    console.log(err);
    res.redirect("/");
  });
};
