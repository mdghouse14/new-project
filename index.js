const express = require("express");
const bcrypt = require("bcrypt");
const app = express();
const { connect } = require("mongoose");
const jwt = require("jsonwebtoken");
const { config } = require("dotenv");
const { json } = require("body-parser");
const authSchema = require("./authschema/schema");
const cookieParser = require("cookie-parser");
const secret_key = "cdcgfrgsftioytrftio";
const port = 4005;
app.use(json());
app.use(cookieParser());
config();
connect(process.env.url)
  .then(() => {
    console.log("connect to db");
  })
  .catch(() => {
    console.log("didn't connect to the db");
  });
app.get("/", async (req, res) => {
  const alluser = await authSchema.find({});
  try {
    if (alluser) {
      res.status(200).json({ message: "sucessfully get the data", alluser });
    }
    return res.status(400).json({ message: "data is empty" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});
app.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const user = await authSchema.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "user  alraedy exits " });
    }
    const newuser = await authSchema.create({
      username: username,
      email: email,
      password: password,
    });

    if (newuser) {
      return res.status(200).json({ message: "account created", newuser });
    }
    return res.status(400).json({ message: "didn't created an account" });
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authSchema.findOne({ email });

    if (user) {
      const validPassword = await bcrypt.compare(password, user.password);

      if (validPassword) {
        const token = jwt.sign(
          {
            email: user.email,
            username: user.username,
          },
          secret_key,
          {
            expiresIn: 60 * 60,
          }
        );
        if (token) {
          res.cookie("token", token);
        }
        return res.json({ message: "verified token" });
        res.status(200).json({ message: "Login Success", user, token });
      } else {
        res.status(400).json({ error: "Invalid Password" });
      }
    } else {
      res.status(401).json({ error: "User does not exist" });
    }
  } catch (err) {
    return res.status(400).json({ message: err.message });
  }
});

const verifyJwt = (req, res, next) => {
  const token = req.cookies.token;

  try {
    const user = jwt.verify(token, secret_key);
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Unauthorized" });
  }
};

app.get("/user", verifyJwt, async (req, res) => {
  const user = req.user;

  const db_user = await authSchema.findOne({ email: user.email });
  if (db_user) {
    return res.status(200).json(db_user);
  }

  return res.status(401).json({ message: "User not found" });
});

app.listen(port, () => {
  console.log(`server running at port ${port}`); //this is used to run the server
});
