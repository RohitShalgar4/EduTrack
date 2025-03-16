import mongoose from "mongoose";

const teacherSchema = new mongoose.Schema({
    full_name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    isFirstLogin: {
        type: Boolean,
        default: true
    },
    department: {
        type: String,
        enum: ["CSE", "ENTC", "MECH", "CIVIL", "ELE"],
        required: true
    },
    qualification: {
        type: String,
        required: true
    },
    yearOfExperience: {
        type: Number,
        required: true
    },
    role: {
        type: String,
        default: 'teacher'
    },
    photo_url: {
        type: String,
    }
}, { timestamps: true });

export const Teacher = mongoose.model("Teacher", teacherSchema); 