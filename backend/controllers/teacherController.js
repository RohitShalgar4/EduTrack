import { Teacher } from "../models/teacherModel.js";
import bcrypt from "bcryptjs";

export const addTeacher = async (req, res) => {
    try {
        const {
            full_name,
            email,
            password,
            department,
            qualification,
            yearOfExperience
        } = req.body;

        // Check if teacher already exists
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ message: "Teacher with this email already exists" });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new teacher
        const teacher = await Teacher.create({
            full_name,
            email,
            password: hashedPassword,
            department,
            qualification,
            yearOfExperience
        });

        // Remove password from response
        const teacherResponse = teacher.toObject();
        delete teacherResponse.password;

        return res.status(201).json({
            message: "Teacher added successfully",
            teacher: teacherResponse
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getAllTeachers = async (req, res) => {
    try {
        const teachers = await Teacher.find().select('-password');
        return res.status(200).json({ teachers });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findById(req.params.id).select('-password');
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        return res.status(200).json({ teacher });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateTeacher = async (req, res) => {
    try {
        const updates = { ...req.body };
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const teacher = await Teacher.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).select('-password');

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        return res.status(200).json({
            message: "Teacher updated successfully",
            teacher
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const deleteTeacher = async (req, res) => {
    try {
        const teacher = await Teacher.findByIdAndDelete(req.params.id);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }
        return res.status(200).json({ message: "Teacher deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}; 