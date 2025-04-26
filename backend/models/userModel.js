import mongoose from "mongoose";

const userModel = new mongoose.Schema({
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
    Parent_No: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    registration_number: {
        type: String,
        required: true,
        unique: true
    },
    Department: {
        type: String,
        required: true,
        enum: ["CSE", "ENTC", "ELE", "MECH", "CIVIL"]
    },
    class: {
        type: String,
        required: true,
        enum: ["FY", "SY", "TY", "BE"]
    },
    abc_id: {
        type: String,
        required: true
    },
    previous_cgpa: {
        type: [Number],
        required: true
    },
    previous_percentages: {
        type: [Number],
        required: true
    },
    current_semester: {
        type: Number,
        required: true
    },
    class_rank: {
        type: Number,
        required: true
    },
    attendance: [{
        semester: {
            type: Number,
            required: true
        },
        average_attendance: {
            type: Number,
            required: true,
            min: 0,
            max: 100
        }
    }],
    semesterProgress: [
        {
            semester: {
                type: Number,
                required: true
            },
            percentage: {
                type: Number,
                required: true
            }
        }
    ],
    photo_url: {
        type: String,
        required: true
    },
    achievements: {
        type: [String],
        required: true
    },
    gender: {
        type: String,
        enum: ["Male", "Female", "Other"],
        required: true
    }
}, { timestamps: true });

export const User = mongoose.model("User", userModel);
