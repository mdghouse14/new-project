const { Schema, model } = require("mongoose");
const bcrypt = require("bcrypt");
const saltRounds = 10;
//Define a schema
const authSchema = new Schema({
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },

  password: {
    type: String,
    required: true,
  },
});

// hash user password before saving into database
authSchema.pre("save", function (next) {
  this.password = bcrypt.hashSync(this.password, saltRounds);
  next();
});
module.exports = model("User", authSchema);

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImZ1a0BnbWFpbC5jb20iLCJwYXNzd29yZCI6Ijc4OTQ1NjEyMyIsImlhdCI6MTY2NzAyMjMyOSwiZXhwIjoxNjY3MDI1OTI5fQ.qpmArpAbqLiKnm4733AJVLCOv7OmgHu-9qKQPAArM4U
