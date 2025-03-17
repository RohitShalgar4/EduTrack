import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Admin } from "../models/adminModel.js";
import { Teacher } from "../models/teacherModel.js";

export const register = async (req, res) => {
    try {
        const { 
            full_name, email, password, confirmPassword, Mobile_No, Parent_No, address, registration_number, 
            Department, class: userClass, abc_id, previous_cgpa, previous_percentages, current_semester, class_rank, 
            attendance, semesterProgress, photo_url, achievements, gender 
        } = req.body;
        
        // Ensure all required fields are included in the request
        if (!full_name || !email || !password || !confirmPassword || !Mobile_No || !Parent_No || !address || 
            !registration_number || !Department || !userClass || !abc_id || !previous_cgpa || !previous_percentages || 
            !current_semester || !class_rank || !attendance || !photo_url || !achievements || !gender) {
            return res.status(400).json({ message: "All fields are required" });
        }
        
        // Check if passwords match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }
        
        // Check if email already exists
        const user = await User.findOne({ email });
        if (user) {
            return res.status(400).json({ message: "Email already exists, try a different one" });
        }
        
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user with the updated fields
        await User.create({
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
            previous_cgpa,
            previous_percentages,
            current_semester,
            class_rank,
            attendance,
            semesterProgress,
            photo_url,
            achievements,
            gender
        });
        
        return res.status(201).json({
            message: "Account created successfully.",
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        };
        
        // Check in User model first
        let user = await User.findOne({ email });
        let role = "student";
        let isAdmin = false;
        let department = null;
        
        // If not found in User model, check in Admin model
        if (!user) {
            const admin = await Admin.findOne({ email }).lean();  // Use lean() to get plain object
            if (admin) {
                user = admin;
                role = admin.role;
                department = admin.department;
                isAdmin = true;
                console.log("Found admin:", admin); // Debug log
            } else {
                // If not found in Admin model, check in Teacher model
                const teacher = await Teacher.findOne({ email }).lean();
                if (teacher) {
                    user = teacher;
                    role = "teacher";
                    department = teacher.department;
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
            department: department, // Use the extracted department
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
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
}

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
        const { newPassword, confirmPassword } = req.body;
        const userId = req.id; // From authentication middleware
        const userRole = req.role; // From authentication middleware

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
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
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};