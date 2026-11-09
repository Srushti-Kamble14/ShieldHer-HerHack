import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: {
    type: String,
    required: function () {
      return !this.googleId; //  googleId nahi hai to password required
    }
  },
  googleId: { type: String, default: null },
});

const User = mongoose.model("User", UserSchema);

export default User;  