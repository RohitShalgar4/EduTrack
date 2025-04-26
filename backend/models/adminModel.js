import mongoose from "mongoose";

const adminModel = new mongoose.Schema({
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
    phone_number: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ["super_admin", "department_admin"],
        required: true
    },
    department: {
        type: String,
        enum: ["CSE", "ENTC", "ELE", "MECH", "CIVIL"],
        required: function() {
            return this.role === 'department_admin';
        }
    },
    photo_url: {
        type: String,
        required: true
    }
}, { timestamps: true });

export const Admin = mongoose.model("Admin", adminModel); 