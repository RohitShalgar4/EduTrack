import { Admin } from "../models/adminModel.js";
import bcrypt from "bcryptjs";

export const addAdmin = async (req, res) => {
    try {
        const {
            full_name,
            email,
            password,
            role,
            department,
            phone_number
        } = req.body;

        // Define allowed departments
        const allowedDepartments = ["CSE", "ENTC", "MECH", "CIVIL", "ELE"];

        // Validate role
        if (!['super_admin', 'department_admin'].includes(role)) {
            return res.status(400).json({ message: "Invalid role. Must be 'super_admin' or 'department_admin'." });
        }

        // Validate department only if role is 'department_admin'
        if (role === 'department_admin' && (!department || !allowedDepartments.includes(department))) {
            return res.status(400).json({ message: "Invalid or missing department for department_admin." });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ message: "Admin with this email already exists." });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new admin (include department without conditions)
        const admin = await Admin.create({
            full_name,
            email,
            password: hashedPassword,
            role,
            department, // Department will be stored even if it's empty (only 'department_admin' needs it)
            phone_number
        });

        // Remove password from response
        const adminResponse = admin.toObject();
        delete adminResponse.password;

        return res.status(201).json({
            message: "Admin added successfully",
            admin: adminResponse
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getAllAdmins = async (req, res) => {
    try {
        const admins = await Admin.find().select('-password');
        return res.status(200).json({ admins });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const getAdmin = async (req, res) => {
    try {
        const admin = await Admin.findById(req.params.id).select('-password');
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        return res.status(200).json({ admin });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const updateAdmin = async (req, res) => {
    try {
        const updates = { ...req.body };
        if (updates.password) {
            updates.password = await bcrypt.hash(updates.password, 10);
        }

        const admin = await Admin.findByIdAndUpdate(
            req.params.id,
            updates,
            { new: true }
        ).select('-password');

        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        return res.status(200).json({
            message: "Admin updated successfully",
            admin
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const deleteAdmin = async (req, res) => {
    try {
        const admin = await Admin.findByIdAndDelete(req.params.id);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }
        return res.status(200).json({ message: "Admin deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Server error" });
    }
}; 