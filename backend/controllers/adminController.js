import { Admin } from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import { Teacher } from "../models/teacherModel.js";

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

// Update admin password
export const updateAdminPassword = async (req, res) => {
    try {
        const adminId = req.id;
        const { newPassword } = req.body;

        // Find admin
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: "Admin not found" });
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        admin.password = hashedPassword;
        admin.isFirstLogin = false;
        await admin.save();

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });
    } catch (error) {
        console.error('Error in updateAdminPassword:', error);
        return res.status(500).json({ message: "Server error" });
    }
};

// Get all students (super admin only)
export const getAllStudents = async (req, res) => {
    try {
        console.log('Super admin fetching all students');
        
        // Get all students (all users in the User model are students)
        const students = await User.find()
            .select('-password')
            .sort({ full_name: 1 });

        console.log(`Found ${students.length} total students`);

        // Format student data
        const formattedStudents = students.map(student => ({
            _id: student._id,
            full_name: student.full_name,
            registration_number: student.registration_number,
            Department: student.Department,
            current_semester: student.current_semester,
            email: student.email,
            Mobile_No: student.Mobile_No,
            photo_url: student.photo_url,
            class_rank: student.class_rank || 'Not Available',
            cgpa: student.previous_cgpa?.length > 0 ? student.previous_cgpa[student.previous_cgpa.length - 1] : '0.00',
            sgpa: student.previous_cgpa?.length > 0 ? student.previous_cgpa[student.previous_cgpa.length - 1] : '0.00',
            attendance: student.attendance?.length > 0 
                ? (student.attendance.reduce((sum, entry) => sum + entry.attendance, 0) / student.attendance.length).toFixed(2)
                : '0'
        }));

        return res.status(200).json({
            success: true,
            message: `Found ${formattedStudents.length} students`,
            students: formattedStudents
        });
    } catch (error) {
        console.error('Error in getAllStudents:', error);
        return res.status(500).json({ 
            success: false,
            message: "Server error",
            error: error.message 
        });
    }
};

// Get all teachers (super admin only)
export const getAllTeachers = async (req, res) => {
    try {
        console.log('Super admin fetching all teachers');
        
        // Get all teachers
        const teachers = await Teacher.find()
            .select('-password')
            .sort({ full_name: 1 });

        console.log(`Found ${teachers.length} total teachers`);

        // Format teacher data
        const formattedTeachers = teachers.map(teacher => ({
            _id: teacher._id,
            full_name: teacher.full_name,
            email: teacher.email,
            department: teacher.department,
            Mobile_No: teacher.Mobile_No,
            qualification: teacher.qualification || 'Not Available',
            experience: teacher.yearOfExperience || 'Not Available',
            photo_url: teacher.photo_url || '',
            subjects: teacher.subjects || []
        }));

        return res.status(200).json({
            success: true,
            message: `Found ${formattedTeachers.length} teachers`,
            teachers: formattedTeachers
        });
    } catch (error) {
        console.error('Error in getAllTeachers:', error);
        return res.status(500).json({ 
            success: false,
            message: "Server error",
            error: error.message 
        });
    }
};

// Get students by department (department admin only)
export const getStudentsByDepartment = async (req, res) => {
    try {
        const userDepartment = req.department;
        console.log('Department admin fetching students for department:', userDepartment);
        console.log('Request headers:', req.headers);
        console.log('Request user:', req.user);
        console.log('Request department:', req.department);

        if (!userDepartment) {
            console.log('Department admin without department');
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Department information missing." 
            });
        }

        // Get students from the department admin's department
        console.log('Querying students with:', { Department: userDepartment });
        const students = await User.find({ 
            Department: userDepartment
        })
        .select('-password')
        .sort({ full_name: 1 });

        console.log('Raw students data:', students);
        console.log(`Found ${students.length} students in department ${userDepartment}`);

        // Format student data
        const formattedStudents = students.map(student => {
            console.log('Processing student:', student);
            return {
                _id: student._id,
                full_name: student.full_name,
                registration_number: student.registration_number,
                department: student.Department,
                current_semester: student.current_semester,
                email: student.email,
                Mobile_No: student.Mobile_No,
                photo_url: student.photo_url,
                class_rank: student.class_rank || 'Not Available',
                cgpa: student.previous_cgpa?.length > 0 ? student.previous_cgpa[student.previous_cgpa.length - 1] : '0.00',
                sgpa: student.previous_cgpa?.length > 0 ? student.previous_cgpa[student.previous_cgpa.length - 1] : '0.00',
                attendance: student.attendance?.length > 0 
                    ? (student.attendance.reduce((sum, entry) => sum + entry.attendance, 0) / student.attendance.length).toFixed(2)
                    : '0'
            };
        });

        console.log('Formatted students data:', formattedStudents);

        return res.status(200).json({
            success: true,
            message: `Found ${formattedStudents.length} students`,
            students: formattedStudents
        });
    } catch (error) {
        console.error('Error in getStudentsByDepartment:', error);
        console.error('Error stack:', error.stack);
        return res.status(500).json({ 
            success: false,
            message: "Server error",
            error: error.message 
        });
    }
};

// Get teachers by department (department admin only)
export const getTeachersByDepartment = async (req, res) => {
    try {
        const userDepartment = req.department;
        console.log('Department admin fetching teachers for department:', userDepartment);

        if (!userDepartment) {
            console.log('Department admin without department');
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Department information missing." 
            });
        }

        // Get teachers from the department admin's department
        const teachers = await Teacher.find({ 
            department: userDepartment 
        })
        .select('-password')
        .sort({ full_name: 1 });

        console.log(`Found ${teachers.length} teachers in department ${userDepartment}`);

        // Format teacher data
        const formattedTeachers = teachers.map(teacher => ({
            _id: teacher._id,
            full_name: teacher.full_name,
            email: teacher.email,
            department: teacher.department,
            Mobile_No: teacher.Mobile_No,
            qualification: teacher.qualification || 'Not Available',
            experience: teacher.yearOfExperience || 'Not Available',
            photo_url: teacher.photo_url || '',
            subjects: teacher.subjects || []
        }));

        return res.status(200).json({
            success: true,
            message: `Found ${formattedTeachers.length} teachers`,
            teachers: formattedTeachers
        });
    } catch (error) {
        console.error('Error in getTeachersByDepartment:', error);
        return res.status(500).json({ 
            success: false,
            message: "Server error",
            error: error.message 
        });
    }
};

// Update student details (department admin only)
export const updateStudentDetails = async (req, res) => {
    try {
        const { studentId } = req.params;
        const userDepartment = req.department;
        const updateData = req.body;

        if (!userDepartment) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Department information missing." 
            });
        }

        // Get student
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ message: "Student not found" });
        }

        // Verify student is from admin's department
        if (student.Department !== userDepartment) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Student not in your department" 
            });
        }

        // Only allow updating specific fields
        const allowedFields = [
            'Mobile_No',
            'Parent_No',
            'previous_cgpa',
            'achievements',
            'previous_percentages',
            'class_rank',
            'current_semester',
            'semesterProgress',
            'attendance',
            'photo_url',
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
        return res.status(500).json({ 
            success: false,
            message: "Server error",
            error: error.message 
        });
    }
};

// Get admin details by ID
export const getAdminDetails = async (req, res) => {
    try {
        const { adminId } = req.params;
        
        const admin = await Admin.findById(adminId).select('-password');
        
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        res.status(200).json(admin);
    } catch (error) {
        console.error('Error fetching admin details:', error);
        res.status(500).json({ message: 'Error fetching admin details' });
    }
};

// Update admin details
export const updateAdminDetails = async (req, res) => {
    try {
        const { adminId } = req.params;
        const updates = req.body;
        
        // Remove sensitive fields that shouldn't be updated directly
        delete updates.password;
        delete updates.role;
        
        const admin = await Admin.findById(adminId);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Update admin details
        Object.keys(updates).forEach(key => {
            admin[key] = updates[key];
        });

        await admin.save();
        
        // Return updated admin without password
        const updatedAdmin = await Admin.findById(adminId).select('-password');
        res.status(200).json(updatedAdmin);
    } catch (error) {
        console.error('Error updating admin details:', error);
        res.status(500).json({ message: 'Error updating admin details' });
    }
};

// module.exports = {
//     addAdmin,
//     getAllAdmins,
//     getAdmin,
//     updateAdmin,
//     deleteAdmin,
//     updateAdminPassword,
//     getAllStudents,
//     getAllTeachers,
//     getStudentsByDepartment,
//     getTeachersByDepartment,
//     updateStudentDetails,
//     getAdminDetails,
//     updateAdminDetails
// }; 