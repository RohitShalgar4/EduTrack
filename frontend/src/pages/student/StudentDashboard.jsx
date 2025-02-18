import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStudentData } from '../../redux/studentSlice';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Book, Award, Trophy, Clock, Download } from 'lucide-react';
import { BASE_URL } from '../../main';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';

const StudentDashboard = () => {
  const student = useSelector((state) => state.student.data); // Access student data from Redux store
  const dispatch = useDispatch();

  // Debugging: Log Redux state
  console.log('StudentDashboard - Redux student data:', student);

  // Fetch student data from the server
  useEffect(() => {
    const fetchStudentData = async () => {
      try {
        axios.defaults.withCredentials = true;
        const res = await axios.get(`${BASE_URL}/api/v1/student`);
        console.log('StudentDashboard - API Response:', res.data); // Debugging: Log API response
        if (res.data) {
          dispatch(setStudentData(res.data));
        } else {
          console.error('StudentDashboard - No data received from the server');
          toast.error('No data received from the server');
        }
      } catch (error) {
        console.error('StudentDashboard - Error fetching student data:', error);
        toast.error('Failed to fetch student data. Please try again.');
      }
    };
    fetchStudentData();
  }, [dispatch]);

  const generatePDF = () => {
    if (!student) {
      toast.error('No student data available to generate PDF');
      return;
    }

    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Student Progress Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${student.full_name}`, 20, 40);
    doc.text(`Registration Number: ${student.registration_number}`, 20, 50);
    doc.text(`CGPA: ${student.cgpa}`, 20, 60);
    doc.text(`Current Semester: ${student.current_semester}`, 20, 70);
    doc.text(`Class Rank: ${student.class_rank}`, 20, 80);
    doc.text(`Attendance: ${student.attendance}%`, 20, 90);
    doc.save(`${student.full_name}-progress-report.pdf`);
  };

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
        {[
          { icon: Book, label: 'Current CGPA', value: student.cgpa },
          { icon: Book, label: 'Current SGPA', value: student.sgpa },
          { icon: Award, label: 'Current Semester', value: student.current_semester },
          { icon: Trophy, label: 'Class Rank', value: student.class_rank },
          { icon: Clock, label: 'Attendance', value: `${student.attendance}%` },
        ].map((stat, index) => (
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
        <div className="bg-white p-6 rounded-xl shadow-sm max-w-full overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Semester-wise Progress</h2>
          <BarChart width={400} height={300} data={student.semesterProgress}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="semester" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="percentage" fill="#3B82F6" name="Overall Percentage" />
          </BarChart>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm max-w-full overflow-hidden">
  <h2 className="text-lg font-semibold mb-4">Attendance Trend</h2>
  <div className="overflow-x-auto">
    <LineChart width={500} height={300} data={student.attendanceData}>
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
    </div>
  );
};

export default StudentDashboard;