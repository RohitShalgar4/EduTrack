import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      reuired: true,
    },
    password: {
      type: String,
      reuired: true,
    },
    role: {
      type: String,
      enum: ["Admin", "Teacher", "Student"],
      default: "Student",
    }
  },
  { timestamp: true }
);

export const User = mongoose.model("User", userSchema);
