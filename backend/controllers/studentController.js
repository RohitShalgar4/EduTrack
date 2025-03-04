import { User } from "../models/userModel.js";

// Controller to fetch student data
export const getStudentData = async (req, res) => {
  try {
    const userId = req.params.id;
    console.log('Fetching data for user ID:', userId);

    // Fetch the student data for the specific user ID
    const student = await User.findById(userId);

    if (!student) {
      console.log('Student not found for ID:', userId);
      return res.status(404).json({ message: 'Student data not found' });
    }

    console.log('Found student:', student.full_name, 'with ID:', student._id);

    // Calculate the current CGPA (last element of previous_cgpa array)
    const currentCgpa = student.previous_cgpa.length > 0
      ? student.previous_cgpa[student.previous_cgpa.length - 1]
      : 0;

    // Calculate the current SGPA (last element of previous_cgpa array)
    const currentSgpa = student.previous_cgpa.length > 0
      ? student.previous_cgpa[student.previous_cgpa.length - 1]
      : 0;

    // Calculate the overall attendance percentage
    const totalAttendance = student.attendance.reduce((sum, entry) => sum + entry.attendance, 0);
    const averageAttendance = student.attendance.length > 0
      ? (totalAttendance / student.attendance.length).toFixed(2)
      : 0;

    // Map the response to match the frontend's expected structure
    const studentData = {
      _id: student._id, // Include the user ID in the response
      full_name: student.full_name,
      registration_number: student.registration_number,
      cgpa: currentCgpa,
      sgpa: currentSgpa,
      current_semester: student.current_semester,
      class_rank: student.class_rank,
      attendance: averageAttendance,
      attendanceData: student.attendance,
      semesterProgress: student.semesterProgress,
    };

    console.log('Sending student data with ID:', studentData._id);
    res.status(200).json(studentData);
  } catch (error) {
    console.error('Error fetching student data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};