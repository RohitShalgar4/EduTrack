import { Admin } from "../models/adminModel.js";
import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";
import { Teacher } from "../models/teacherModel.js";

export const addAdmin = async (req, res) => {
    try {
        const {
            full_name,
            email,
            phone_number,
            role,
            department
        } = req.body;

        // Define allowed departments and roles
        const allowedDepartments = ["CSE", "ENTC", "MECH", "CIVIL", "ELE"];
        const allowedRoles = ["super_admin", "department_admin"];

        // Validate required fields
        if (!full_name || !email || !phone_number || !role) {
            return res.status(400).json({ 
                success: false,
                message: "Required fields missing: full name, email, phone number, and role are mandatory." 
            });
        }

        // Validate role
        if (!allowedRoles.includes(role)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid role. Must be 'super_admin' or 'department_admin'." 
            });
        }

        // Validate department if role is department_admin
        if (role === 'department_admin') {
            if (!department || !allowedDepartments.includes(department)) {
                return res.status(400).json({ 
                    success: false,
                    message: "Department is required and must be valid for department admin role." 
                });
            }
        }

        // Validate phone number (10 digits)
        const phoneRegex = /^[0-9]{10}$/;
        const cleanPhone = phone_number.toString().replace(/\D/g, '');
        if (!phoneRegex.test(cleanPhone)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid phone number format. Must be 10 digits." 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid email format." 
            });
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({ 
                success: false,
                message: "Admin with this email already exists." 
            });
        }

        // Generate temporary password (using registration number pattern)
        const tempPassword = "Admin@123";
        const hashedPassword = await bcrypt.hash(tempPassword, 10);

        // Create new admin
        const admin = await Admin.create({
            full_name,
            email,
            password: hashedPassword,
            role,
            department: role === 'department_admin' ? department : undefined,
            phone_number: cleanPhone,
            isFirstLogin: true,
            photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(full_name)}&background=random`
        });

        // Remove password from response
        const adminResponse = admin.toObject();
        delete adminResponse.password;

        return res.status(201).json({
            success: true,
            message: "Admin added successfully",
            admin: adminResponse,
            tempPassword // Include temporary password in response
        });
    } catch (error) {
        console.error('Error in addAdmin:', error);
        return res.status(500).json({ 
            success: false,
            message: "Server error",
            error: error.message 
        });
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

// Import students from CSV
export const importStudentsFromCSV = async (req, res) => {
    try {
        console.log('[importStudentsFromCSV] Starting import process');
        console.log('[importStudentsFromCSV] Request body:', req.body);
        
        const { csvData, user } = req.body;
        
        if (!user || !user.role) {
            console.error('[importStudentsFromCSV] Missing user information');
            return res.status(400).json({
                success: false,
                message: 'Missing user information'
            });
        }

        console.log('[importStudentsFromCSV] User:', user);

        if (!csvData || !Array.isArray(csvData)) {
            console.error('[importStudentsFromCSV] Invalid CSV data format:', {
                csvData: csvData,
                type: typeof csvData,
                isArray: Array.isArray(csvData)
            });
            return res.status(400).json({
                success: false,
                message: 'Invalid CSV data format'
            });
        }

        const createdStudents = [];
        const errors = [];

        // Process each row
        for (const row of csvData) {
            try {
                console.log('[importStudentsFromCSV] Processing row:', row);

                // Validate required fields
                const requiredFields = ['full_name', 'email', 'registration_number', 'abc_id', 'address', 'Mobile_No', 'Parent_No', 'gender', 'class'];
                const missingFields = requiredFields.filter(field => !row[field]);
                
                if (missingFields.length > 0) {
                    console.error('[importStudentsFromCSV] Missing required fields:', {
                        student: row.full_name,
                        missingFields
                    });
                    errors.push(`Missing required fields for student ${row.full_name}: ${missingFields.join(', ')}`);
                    continue;
                }

                // Validate phone numbers
                const mobileNoRegex = /^\d{10}$/;
                const cleanMobileNo = row.Mobile_No.toString().replace(/\D/g, '');
                const cleanParentNo = row.Parent_No.toString().replace(/[eE].*$/, '').replace(/\D/g, '');

                console.log('[importStudentsFromCSV] Phone numbers:', {
                    original: {
                        mobile: row.Mobile_No,
                        parent: row.Parent_No
                    },
                    cleaned: {
                        mobile: cleanMobileNo,
                        parent: cleanParentNo
                    }
                });

                if (!mobileNoRegex.test(cleanMobileNo) || !mobileNoRegex.test(cleanParentNo)) {
                    console.error('[importStudentsFromCSV] Invalid phone number format:', {
                        student: row.full_name,
                        mobileNo: cleanMobileNo,
                        parentNo: cleanParentNo
                    });
                    errors.push(`Invalid phone number format for student ${row.full_name}. Phone numbers must be 10 digits.`);
                    continue;
                }

                // Validate gender
                const validGenders = ['Male', 'Female', 'Other'];
                if (!validGenders.includes(row.gender)) {
                    console.error('[importStudentsFromCSV] Invalid gender:', {
                        student: row.full_name,
                        gender: row.gender
                    });
                    errors.push(`Invalid gender for student ${row.full_name}. Must be one of: ${validGenders.join(', ')}`);
                    continue;
                }

                // Validate current_semester
                const current_semester = parseInt(row.current_semester);
                if (isNaN(current_semester) || current_semester < 1 || current_semester > 8) {
                    console.error('[importStudentsFromCSV] Invalid current_semester:', {
                        student: row.full_name,
                        current_semester: row.current_semester
                    });
                    errors.push(`Invalid current_semester for student ${row.full_name}. Must be a number between 1 and 8.`);
                    continue;
                }

                // Check for existing users
                const existingUser = await User.findOne({
                    $or: [
                        { email: row.email },
                        { registration_number: row.registration_number },
                        { abc_id: row.abc_id }
                    ]
                });

                if (existingUser) {
                    console.error('[importStudentsFromCSV] User already exists:', {
                        student: row.full_name,
                        existingUser: {
                            email: existingUser.email,
                            registration_number: existingUser.registration_number,
                            abc_id: existingUser.abc_id
                        }
                    });
                    errors.push(`Student ${row.full_name} already exists with email ${row.email} or registration number ${row.registration_number} or ABC ID ${row.abc_id}`);
                    continue;
                }

                // Determine department and current semester based on user role
                let department;
                if (user.role === 'super_admin') {
                    department = row.Department || user.department;
                } else {
                    department = user.department;
                }

                console.log('[importStudentsFromCSV] Creating student with:', {
                    name: row.full_name,
                    department,
                    current_semester,
                    class: row.class
                });

                // Create new student with all required fields
                const newStudent = await User.create({
                    full_name: row.full_name,
                    email: row.email,
                    password: await bcrypt.hash(row.registration_number, 10),
                    role: 'student',
                    Department: department,
                    registration_number: row.registration_number,
                    current_semester: current_semester,
                    abc_id: row.abc_id,
                    address: row.address,
                    Mobile_No: cleanMobileNo,
                    Parent_No: cleanParentNo,
                    gender: row.gender,
                    class: row.class,
                    previous_cgpa: [0],
                    previous_percentages: [0],
                    class_rank: 0,
                    attendance: [],
                    semesterProgress: [],
                    achievements: [],
                    photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(row.full_name)}&background=random`,
                    isFirstLogin: true
                });

                console.log('[importStudentsFromCSV] Student created successfully:', {
                    id: newStudent._id,
                    name: newStudent.full_name
                });

                createdStudents.push({
                    id: newStudent._id,
                    name: newStudent.full_name,
                    email: newStudent.email,
                    abc_id: newStudent.abc_id
                });
            } catch (error) {
                console.error('[importStudentsFromCSV] Error processing row:', {
                    row,
                    error: error.message,
                    stack: error.stack
                });
                errors.push(`Error processing student ${row.full_name}: ${error.message}`);
            }
        }

        console.log('[importStudentsFromCSV] Import completed:', {
            createdCount: createdStudents.length,
            errorCount: errors.length,
            errors: errors
        });

        res.status(200).json({
            success: true,
            message: `Successfully imported ${createdStudents.length} students${errors.length > 0 ? ` with ${errors.length} errors` : ''}`,
            createdStudents,
            errors: errors.length > 0 ? errors : undefined
        });
    } catch (error) {
        console.error('[importStudentsFromCSV] Error:', {
            message: error.message,
            stack: error.stack
        });
        res.status(500).json({
            success: false,
            message: 'Error importing students',
            error: error.message
        });
    }
};

// Delete student (both super admin and department admin)
export const deleteStudent = async (req, res) => {
    try {
        const { studentId } = req.params;
        const userDepartment = req.department;
        const userRole = req.role;

        // Get student
        const student = await User.findById(studentId);
        if (!student) {
            return res.status(404).json({ 
                success: false,
                message: "Student not found" 
            });
        }

        // Check permissions
        if (userRole === 'department_admin' && student.Department !== userDepartment) {
            return res.status(403).json({ 
                success: false,
                message: "Access denied. Student not in your department" 
            });
        }

        // Delete student
        await User.findByIdAndDelete(studentId);

        return res.status(200).json({
            success: true,
            message: "Student deleted successfully"
        });
    } catch (error) {
        console.error('Error in deleteStudent:', error);
        return res.status(500).json({ 
            success: false,
            message: "Server error",
            error: error.message 
        });
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