import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStudentData } from '../../redux/studentSlice';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Book, Award, Trophy, Clock, Download } from 'lucide-react';
import { BASE_URL } from '../../main';
import { jsPDF } from 'jspdf';

const StudentDashboard = () => {
  const student = useSelector((state) => state.student.data); // Access student data from Redux store
  const dispatch = useDispatch();

  // Fetch student data from the server
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.get(`${BASE_URL}/api/v1/student`);
        console.log('API Response:', res.data); // Log the response data
        if (res.data) {
          dispatch(setStudentData(res.data));
        } else {
          console.error('No data received from the server');
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      }
    };
    fetchStudentData();
  }, [dispatch]);

  const generatePDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Student Progress Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${student?.full_name}`, 20, 40);
    doc.text(`Registration Number: ${student?.registration_number}`, 20, 50);
    doc.text(`CGPA: ${student?.cgpa}`, 20, 60);
    doc.text(`Current Semester: ${student?.current_semester}`, 20, 70);
    doc.text(`Class Rank: ${student?.class_rank}`, 20, 80);
    doc.text(`Attendance: ${student?.attendance}%`, 20, 90);
    doc.save(`${student?.full_name}-progress-report.pdf`);
  };

  // Example Data for Semester and Attendance (these can be fetched similarly from the server if needed)
  const semesterProgress = [
    { semester: 'Sem 1', percentage: 85 },
    { semester: 'Sem 2', percentage: 87 },
    { semester: 'Sem 3', percentage: 88 },
    { semester: 'Sem 4', percentage: 90 },
    { semester: 'Sem 5', percentage: 92 },
    { semester: 'Sem 6', percentage: 94 },
  ];

  const attendanceData = [
    { month: 'Jan', attendance: 95 },
    { month: 'Feb', attendance: 93 },
    { month: 'Mar', attendance: 90 },
    { month: 'Apr', attendance: 92 },
    { month: 'May', attendance: 96 },
    { month: 'Jun', attendance: 94 },
    { month: 'Jul', attendance: 91 },
    { month: 'Aug', attendance: 95 },
    { month: 'Sep', attendance: 92 },
    { month: 'Oct', attendance: 94 },
    { month: 'Nov', attendance: 96 },
    { month: 'Dec', attendance: 97 },
  ];

  if (!student) {
    return <div>Loading...</div>; // Render loading state until student data is fetched
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Welcome back, {student.full_name}!</h1>
          <p className="text-gray-600">Track your academic progress</p>
        </div>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Download className="w-5 h-5" />
          Download Report
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[{ icon: Book, label: 'Current CGPA', value: student.cgpa },
          { icon: Award, label: 'Current Semester', value: student.current_semester },
          { icon: Trophy, label: 'Class Rank', value: student.class_rank },
          { icon: Clock, label: 'Attendance', value: `${student.attendance}%` }].map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-xl shadow-sm flex items-center gap-4">
            <div className="p-3 bg-gray-100 rounded-lg">
              <stat.icon className="w-6 h-6 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">{stat.label}</p>
              <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Semester-wise Progress</h2>
          <BarChart width={500} height={300} data={semesterProgress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semester" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="percentage" fill="#3B82F6" name="Overall Percentage" />
          </BarChart>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Attendance Trend</h2>
          <LineChart width={500} height={300} data={attendanceData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="attendance" stroke="#3B82F6" name="Attendance %" />
          </LineChart>
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;