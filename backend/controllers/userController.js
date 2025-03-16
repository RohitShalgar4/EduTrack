import { User } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

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
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({
                message: "Incorrect username or password",
                success: false
            })
        };
        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(400).json({
                message: "Incorrect username or password",
                success: false
            })
        };
        const tokenData = {
            userId: user._id
        };

        const token = await jwt.sign(tokenData, process.env.SECRET_KEY, { expiresIn: '1d' });

        return res.status(200).cookie("token", token, { maxAge: 1 * 24 * 60 * 60 * 1000, httpOnly: true, sameSite: 'strict' }).json({
            _id: user._id,
            username: user.username,
            fullName: user.fullName,
            profilePhoto: user.profilePhoto,
            isFirstLogin: user.isFirstLogin,
            message: "Logged in successfully.",
            success: true,
            role: user.role || "student"
        });
        
    } catch (error) {
        console.log(error);
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

        if (!newPassword || !confirmPassword) {
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user's password and isFirstLogin status
        const user = await User.findByIdAndUpdate(
            userId,
            {
                password: hashedPassword,
                isFirstLogin: false
            },
            { new: true }
        ).select('-password'); // Exclude password from the response

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        return res.status(200).json({
            message: "Password updated successfully",
            success: true,
            user: user // Send back the updated user data
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Server error" });
    }
};