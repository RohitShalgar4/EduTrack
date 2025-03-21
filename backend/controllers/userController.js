import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModel.js";
import { Teacher } from "../models/teacherModel.js";

export const register = async (req, res) => {
    try {
        const { 
            full_name, email, password, Mobile_No, Parent_No, address, registration_number, 
            Department, class: userClass, abc_id, previous_cgpa, previous_percentages, current_semester, class_rank, 
            attendance, semesterProgress, photo_url, achievements, gender 
        } = req.body;
        
        // Ensure all required fields are included in the request
        if (!full_name || !email || !password || !Mobile_No || !Parent_No || !address || 
            !registration_number || !Department || !userClass || !abc_id || !gender) {
            return res.status(400).json({ 
                success: false,
                message: "Please fill all required fields" 
            });
        }
        
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false, 
                message: "Email already exists, try a different one" 
            });
        }

        // Check if registration number already exists
        const existingRegistration = await User.findOne({ registration_number });
        if (existingRegistration) {
            return res.status(400).json({
                success: false,
                message: "Registration number already exists"
            });
        }
        
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user with the updated fields
        const newUser = await User.create({
            full_name,
            email,
            password: hashedPassword,
            Mobile_No,
            Parent_No,
            address,
            registration_number,
            Department,
            class: userClass,
            abc_id,
            previous_cgpa: previous_cgpa || [0],
            previous_percentages: previous_percentages || [0],
            current_semester: current_semester || 1,
            class_rank: class_rank || 0,
            attendance: attendance || [],
            semesterProgress: semesterProgress || [],
            photo_url: photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(full_name)}&background=random`,
            achievements: achievements || [],
            gender,
            isFirstLogin: true
        });
        
        return res.status(201).json({
            success: true,
            message: "Account created successfully"
        });
    } catch (error) {
        console.error("Registration error:", error);
        return res.status(500).json({ 
            success: false,
            message: "Internal server error" 
        });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        // Check in User model first
        let user = await User.findOne({ email });
        let role = "student";
        let isAdmin = false;
        let department = null;
        
        // If not found in User model, check in Admin model
        if (!user) {
            const admin = await Admin.findOne({ email }).lean();
            if (admin) {
                user = admin;
                role = admin.role;
                department = admin.department;
                isAdmin = true;
                console.log("Found admin:", admin);
            } else {
                // If not found in Admin model, check in Teacher model
                const teacher = await Teacher.findOne({ email }).lean();
                if (teacher) {
                    user = teacher;
                    role = "teacher";
                    department = teacher.department;
                    console.log("Found teacher:", teacher); // Debug log
                }
            }
        }
        
        // If user not found in any model
        if (!user) {
            return res.status(400).json({
                message: "Incorrect username or password",
                success: false
            });
        }
        
        // Verify password
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect username or password",
                success: false
            });
        }
        
        // Create token
        const tokenData = {
            userId: user._id,
            role: role,
            department: department
        };

        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        // Return response with appropriate user data
        const responseData = {
            _id: user._id,
            email: user.email,
            fullName: user.full_name,
            profilePhoto: user.photo_url,
            isFirstLogin: user.isFirstLogin,
            role: role,
            department: department,
            message: "Logged in successfully.",
            success: true
        };

        console.log("Login Response Data:", responseData); // Debug log

        return res.status(200)
            .cookie("token", token, { 
                maxAge: 1 * 24 * 60 * 60 * 1000, 
                httpOnly: true, 
                sameSite: 'strict' 
            })
            .json(responseData);
        
    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const logout = (req, res) => {
    try {
        return res.status(200).cookie("token", "", { maxAge: 0 }).json({
            message: "logged out successfully."
        })
    } catch (error) {
        console.log(error);
    }
}

export const updatePassword = async (req, res) => {
    try {
        const { newPassword } = req.body;
        const userId = req.id; // From authentication middleware
        const userRole = req.role; // From authentication middleware

        if (!newPassword) {
            return res.status(400).json({ message: "New password is required" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        let user;
        // Check user type based on role and update accordingly
        if (userRole === 'super_admin' || userRole === 'department_admin') {
            user = await Admin.findByIdAndUpdate(
                userId,
                {
                    password: hashedPassword,
                    isFirstLogin: false
                },
                { new: true }
            ).select('-password');
        } else if (userRole === 'teacher') {
            user = await Teacher.findByIdAndUpdate(
                userId,
                {
                    password: hashedPassword,
                    isFirstLogin: false
                },
                { new: true }
            ).select('-password');
        } else {
            // Default to User model (student)
            user = await User.findByIdAndUpdate(
                userId,
                {
                    password: hashedPassword,
                    isFirstLogin: false
                },
                { new: true }
            ).select('-password');
        }

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Password updated successfully",
            success: true,
            user: {
                ...user.toObject(),
                role: userRole
            }
        });
    } catch (error) {
        console.error('Error in updatePassword:', error);
        return res.status(500).json({ message: "Server error" });
    }
};