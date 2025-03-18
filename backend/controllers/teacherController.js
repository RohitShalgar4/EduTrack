import { Teacher } from "../models/teacherModel.js";
import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";

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

// Get all students for a teacher
export const getTeacherStudents = async (req, res) => {
    try {
        const teacherId = req.id;
        console.log('Fetching students for teacher ID:', teacherId);
        
        // Get teacher's department
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            console.log('Teacher not found');
            return res.status(404).json({ message: "Teacher not found" });
        }

        console.log('Found teacher:', teacher.full_name, 'Department:', teacher.department);

        // Get all students from the same department
        const students = await User.find({ Department: teacher.department })
            .select('-password')
            .sort({ full_name: 1 });

        console.log(`Found ${students.length} students in department ${teacher.department}`);

        // Format student data
        const formattedStudents = students.map(student => {
            // Calculate current CGPA (last element of previous_cgpa array)
            const currentCgpa = student.previous_cgpa.length > 0
                ? student.previous_cgpa[student.previous_cgpa.length - 1]
                : 0;

            // Calculate current SGPA (last element of previous_cgpa array)
            const currentSgpa = student.previous_cgpa.length > 0
                ? student.previous_cgpa[student.previous_cgpa.length - 1]
                : 0;

            // Calculate overall attendance percentage
            const totalAttendance = student.attendance.reduce((sum, entry) => sum + entry.attendance, 0);
            const averageAttendance = student.attendance.length > 0
                ? (totalAttendance / student.attendance.length).toFixed(2)
                : 0;

            return {
                _id: student._id,
                full_name: student.full_name,
                registration_number: student.registration_number,
                Department: student.Department,
                class: student.class,
                current_semester: student.current_semester,
                cgpa: currentCgpa,
                sgpa: currentSgpa,
                class_rank: student.class_rank,
                attendance: averageAttendance,
                attendanceData: student.attendance,
                semesterProgress: student.semesterProgress,
                Mobile_No: student.Mobile_No,
                Parent_No: student.Parent_No,
                address: student.address,
                photo_url: student.photo_url
            };
        });

        return res.status(200).json({
            success: true,
            message: `Found ${formattedStudents.length} students`,
            students: formattedStudents
        });
    } catch (error) {
        console.error('Error in getTeacherStudents:', error);
        return res.status(500).json({ 
            message: "Server error",
            error: error.message 
        });
    }
};

// Get specific student details
export const getStudentDetails = async (req, res) => {
    try {
        const { studentId } = req.params;
        const teacherId = req.id;

        // Get teacher's department
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Get student details
        const student = await User.findById(studentId).select('-password');
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Verify student is from teacher's department
        if (student.Department !== teacher.department) {
            return res.status(403).json({ message: "Access denied. Student not in your department" });
        }

        return res.status(200).json({
            success: true,
            student
        });
    } catch (error) {
        console.error('Error in getStudentDetails:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update student details
export const updateStudentDetails = async (req, res) => {
    try {
        const { studentId } = req.params;
        const teacherId = req.id;
        const updateData = req.body;

        // Get teacher's department
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Get student
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Verify student is from teacher's department
        if (student.Department !== teacher.department) {
            return res.status(403).json({ message: "Access denied. Student not in your department" });
        }

        // Only allow updating specific fields
        const allowedFields = [
            'Mobile_No',
            'Parent_No',
            'previous_cgpa',
            'previous_percentages',
            'class_rank',
            'attendance',
            'address'
        ];

        const filteredUpdateData = Object.keys(updateData)
            .filter(key => allowedFields.includes(key))
            .reduce((obj, key) => {
                obj[key] = updateData[key];
                return obj;
            }, {});

        // Update student
        const updatedStudent = await User.findByIdAndUpdate(
            studentId,
            filteredUpdateData,
            { new: true }
        ).select('-password');

        return res.status(200).json({
            success: true,
            message: "Student details updated successfully",
            student: updatedStudent
        });
    } catch (error) {
        console.error('Error in updateStudentDetails:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Update teacher password
export const updateTeacherPassword = async (req, res) => {
    try {
        const teacherId = req.id;
        const { newPassword } = req.body;

        // Find teacher
        const teacher = await Teacher.findById(teacherId);
        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        teacher.password = hashedPassword;
        teacher.isFirstLogin = false;
        await teacher.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error('Error in updateTeacherPassword:', error);
        return res.status(500).json({ message: "Server error" });
    }
}; 