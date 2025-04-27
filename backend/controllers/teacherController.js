import { Teacher } from "../models/teacherModel.js";
import bcrypt from "bcryptjs";
import { User } from "../models/userModel.js";

export const addTeacher = async (req, res) => {
    try {
        console.log('[addTeacher] Request details:', {
            body: req.body,
            userRole: req.role,
            userDepartment: req.department
        });

        const {
            full_name,
            email,
            phone_number,
            designation,
            specialization,
            yearOfExperience,
            qualification,
            department: requestDepartment
        } = req.body;

        // Validate required fields
        if (!full_name || !email || !phone_number || !designation || 
            !specialization || !yearOfExperience || !qualification) {
            console.error('[addTeacher] Missing required fields:', {
                full_name: !!full_name,
                email: !!email,
                phone_number: !!phone_number,
                designation: !!designation,
                specialization: !!specialization,
                yearOfExperience: !!yearOfExperience,
                qualification: !!qualification
            });
            return res.status(400).json({ 
                success: false,
                message: "Please fill all required fields" 
            });
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid email format" 
            });
        }

        // Validate phone number
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(phone_number)) {
            return res.status(400).json({ 
                success: false,
                message: "Invalid phone number format. Must be 10 digits." 
            });
        }

        const password = "Teacher@123";
        
        // Extract department based on admin role
        let department;
        
        if (req.role === 'super_admin') {
            department = requestDepartment;
            if (!department) {
                return res.status(400).json({ 
                    success: false,
                    message: "Department is required" 
                });
            }
        } else if (req.role === 'department_admin') {
            department = req.department;
            if (!department) {
                return res.status(400).json({ 
                    success: false,
                    message: "Department admin's department not found" 
                });
            }
        } else {
            return res.status(403).json({ 
                success: false,
                message: "Unauthorized to add teachers" 
            });
        }

        console.log('[addTeacher] Department determination:', {
            userRole: req.role,
            userDepartment: req.department,
            requestedDepartment: requestDepartment,
            finalDepartment: department
        });
        
        // Validate department
        const validDepartments = ["CSE", "ENTC", "MECH", "CIVIL", "ELE"];
        if (!validDepartments.includes(department)) {
            return res.status(400).json({ 
                success: false,
                message: `Invalid department. Must be one of: ${validDepartments.join(', ')}` 
            });
        }
        
        // Check if teacher already exists
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ 
                success: false,
                message: "Teacher with this email already exists" 
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create teacher data object with correct field names matching the model
        const teacherData = {
            full_name,
            email,
            password: hashedPassword,
            department,
            qualification,
            yearOfExperience: parseInt(yearOfExperience),
            designation,
            specialization,
            phone_number,
            photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(full_name)}&background=random`,
            isFirstLogin: true,
            role: 'teacher'
        };

        console.log('[addTeacher] Creating teacher with data:', {
            ...teacherData,
            password: '[REDACTED]'
        });

        // Create new teacher
        const teacher = await Teacher.create(teacherData);

        // Remove password from response
        const teacherResponse = teacher.toObject();
        delete teacherResponse.password;

        return res.status(201).json({
            success: true,
            message: "Teacher added successfully",
            teacher: teacherResponse
        });
    } catch (error) {
        console.error('[addTeacher] Error:', {
            message: error.message,
            stack: error.stack,
            name: error.name,
            code: error.code
        });
        return res.status(500).json({ 
            success: false,
            message: "Server error while adding teacher",
            error: error.message 
        });
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
        const teacherId = req.params.teacherId;
        const teacher = await Teacher.findById(teacherId).select('-password');
        if (!teacher) {
            return res.status(404).json({ 
              success: false,
              message: "Teacher not found" 
            });
        }
        return res.status(200).json({ 
          success: true,
          teacher 
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ 
          success: false,
          message: "Server error" 
        });
    }
};

export const updateTeacher = async (req, res) => {
    try {
        const teacherId = req.params.teacherId;
        console.log("Updating teacher with ID:", teacherId);
        console.log("Update data:", req.body);
        
        const updates = { ...req.body };
        
        // Remove fields that shouldn't be updated directly
        delete updates.password;
        
        // If photo_url is being updated, validate it
        if (updates.photo_url) {
            // Validate that the photo_url is a valid URL
            try {
                new URL(updates.photo_url);
            } catch (error) {
                return res.status(400).json({
                    success: false,
                    message: "Invalid photo URL format"
                });
            }
        }
        
        const teacher = await Teacher.findByIdAndUpdate(
            teacherId,
            updates,
            { new: true }
        ).select('-password');

        if (!teacher) {
            console.log("Teacher not found with ID:", teacherId);
            return res.status(404).json({ 
                success: false,
                message: "Teacher not found" 
            });
        }

        console.log("Teacher updated successfully:", teacher.full_name);
        return res.status(200).json({
            success: true,
            message: "Teacher updated successfully",
            teacher
        });
    } catch (error) {
        console.error('Error in updateTeacher:', error);
        return res.status(500).json({ 
            success: false,
            message: "Server error" 
        });
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
            'current_semester',
            'achievements',
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

export const getTeachersByDepartment = async (req, res) => {
  try {
    console.log("User in getTeachersByDepartment:", req.user);
    
    // Get department from authenticated user
    const department = req.user?.department;
    console.log("Department from auth user:", department);
    
    if (!department) {
      return res.status(400).json({
        success: false,
        message: "Department information not found for current user"
      });
    }

    console.log("Fetching teachers for department:", department);
    
    // Use department property name that matches the model
    const teachers = await Teacher.find({ department })
      .select('-password')
      .sort({ full_name: 1 });

    console.log(`Found ${teachers.length} teachers in department ${department}:`);
    teachers.forEach(t => {
      console.log(`- ${t.full_name}, yearOfExperience: ${t.yearOfExperience}, id: ${t._id}`);
    });

    res.status(200).json({
      success: true,
      teachers
    });
  } catch (error) {
    console.error('Error in getTeachersByDepartment:', error);
    res.status(500).json({
      success: false,
      message: "Error fetching teachers"
    });
  }
};

// Verify teacher authentication
export const verifyTeacher = async (req, res) => {
    try {
        const teacherId = req.id;
        if (!teacherId) {
            return res.status(401).json({
                success: false,
                message: "Teacher not authenticated"
            });
        }

        const teacher = await Teacher.findById(teacherId).select('-password');
        if (!teacher) {
            return res.status(404).json({
                success: false,
                message: "Teacher not found"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Teacher verified successfully",
            teacher: {
                _id: teacher._id,
                full_name: teacher.full_name,
                email: teacher.email,
                department: teacher.department
            }
        });
    } catch (error) {
        console.error('Error in verifyTeacher:', error);
        return res.status(500).json({
            success: false,
            message: "Server error"
        });
    }
}; 