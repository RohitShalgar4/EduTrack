import { User } from "../models/userModel.js";

// Controller to fetch student data
export const getStudentData = async (req, res) => {
  try {
    // Fetch the student data from the database
    const student = await User.findOne(); // Adjust this query as needed (e.g., find by ID)

    if (!student) {
      return res.status(404).json({ message: 'Student data not found' });
    }

    // Calculate the current CGPA (latest semester's CGPA)
    const currentCgpa = student.semester_results.length > 0
      ? student.semester_results[student.semester_results.length - 1].cgpa
      : 0;

    // Calculate the overall attendance percentage
    const totalAttendance = student.attendance.reduce((sum, entry) => sum + entry.attendance, 0);
    const averageAttendance = student.attendance.length > 0
      ? (totalAttendance / student.attendance.length).toFixed(2)
      : 0;

    // Map the response to match the frontend's expected structure
    const studentData = {
      full_name: student.full_name,
      registration_number: student.registration_number,
      cgpa: currentCgpa,
      current_semester: student.current_semester,
      class_rank: student.class_rank,
      attendance: averageAttendance,
    };

    res.status(200).json(studentData);
  } catch (error) {
    console.error('Error fetching student data:', error);
    res.status(500).json({ message: 'Server error' });
  }
};