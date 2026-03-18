let express = require("express");
let router = express.Router();
let userController = require("../controllers/users");
let bcrypt = require("bcrypt");
const { CheckLogin } = require("../utils/authHandler");
let jwt = require("jsonwebtoken");
let fs = require("fs");
let path = require("path");
let {
  validatedResult,
  ChangePasswordValidator,
} = require("../utils/validator");

const privateKey = fs.readFileSync(
  path.join(__dirname, "..", "privateKey.pem"),
);
router.post("/register", async function (req, res, next) {
  try {
    let { username, password, email } = req.body;
    let newUser = await userController.CreateAnUser(
      username,
      password,
      email,
      "69b1265c33c5468d1c85aad8",
    );
    res.send(newUser);
  } catch (error) {
    res.status(404).send({
      message: error.message,
    });
  }
});

router.post("/login", async function (req, res, next) {
  try {
    let { username, password } = req.body;
    let user = await userController.GetAnUserByUsername(username);
    if (!user) {
      res.status(404).send({
        message: "thong tin dang nhap khong dung",
      });
      return;
    }
    if (user.lockTime > Date.now()) {
      res.status(404).send({
        message: "ban dang bi ban",
      });
      return;
    }
    if (bcrypt.compareSync(password, user.password)) {
      user.loginCount = 0;
      await user.save();
      let token = jwt.sign(
        {
          id: user._id,
        },
        privateKey,
        {
          algorithm: "RS256",
          expiresIn: "1d",
        },
      );
      res.send(token);
    } else {
      user.loginCount++;
      if (user.loginCount == 3) {
        user.loginCount = 0;
        user.lockTime = Date.now() + 3600 * 1000;
      }
      await user.save();
      res.status(404).send({
        message: "thong tin dang nhap khong dung",
      });
    }
  } catch (error) {
    res.status(404).send({
      message: error.message,
    });
  }
});
router.get("/me", CheckLogin, function (req, res, next) {
  let result = req.user.toObject();
  delete result.password;
  res.send(result);
});

router.post(
  "/changepassword",
  CheckLogin,
  ChangePasswordValidator,
  validatedResult,
  async function (req, res, next) {
    try {
      let { oldpassword, newpassword } = req.body;
      let user = req.user;
      if (!bcrypt.compareSync(oldpassword, user.password)) {
        res.status(404).send({
          message: "oldpassword khong dung",
        });
        return;
      }
      if (oldpassword === newpassword) {
        res.status(404).send({
          message: "newpassword phai khac oldpassword",
        });
        return;
      }
      user.password = newpassword;
      await user.save();
      res.send({
        message: "doi mat khau thanh cong",
      });
    } catch (error) {
      res.status(404).send({
        message: error.message,
      });
    }
  },
);
module.exports = router;
