const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");
// const bcrypt = require("bcrypt");

const UserSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

UserSchema.plugin(passportLocalMongoose);
module.exports = mongoose.model("User", UserSchema);

// userSchema.statics.findAndValidate = async function (username, password) {
//   const foundUser = await this.findOne({ username });
//   const isValid = await bcrypt.compare(password, foundUser.password);
//   return isValid ? foundUser : false;
// };

// const hashPassword = async (pw) => {
//   const hash = await bcrypt.hash(pw, 12);
//   return hash;
// };

// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();
//   this.password = await hashPassword(this.password);
//   next();
// });
