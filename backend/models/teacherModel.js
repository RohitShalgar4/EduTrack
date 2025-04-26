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
    Mobile_No: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true,
        enum: ["CSE", "ENTC", "ELE", "MECH", "CIVIL"]
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
        required: true
    },
    subjects: {
        type: [String],
        required: true
    }
}, { timestamps: true });

export const Teacher = mongoose.model("Teacher", teacherSchema); 