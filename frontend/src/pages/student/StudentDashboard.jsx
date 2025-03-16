import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStudentData, clearStudentData } from '../../redux/studentSlice';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Book, Award, Trophy, Clock, Download } from 'lucide-react';
import { BASE_URL } from '../../main';
import { jsPDF } from 'jspdf';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const student = useSelector((state) => state.student.data);
  const authUser = useSelector((state) => state.user.authUser);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!authUser?._id) {
        dispatch(clearStudentData());
        navigate('/login');
        return;
      }

      try {
        console.log('Fetching data for user ID:', authUser._id);
        
        const res = await axios.get(`${BASE_URL}/api/v1/student/${authUser._id}`, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${authUser.token}`
          },
          withCredentials: true,
        });

        if (res.data) {
          // Store the data with the user ID
          const studentData = {
            ...res.data,
            _id: authUser._id // Ensure we use the auth user's ID
          };
          console.log('Setting student data:', studentData);
          dispatch(setStudentData(studentData));
        } else {
          console.error('No data received from server');
          dispatch(clearStudentData());
          toast.error('No data received from server');
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        dispatch(clearStudentData());
        
        if (error.response?.status === 401) {
          navigate('/login');
          toast.error('Session expired. Please login again.');
        } else if (error.response?.status === 404) {
          toast.error('Student data not found. Please contact support.');
        } else {
          toast.error('Failed to fetch student data. Please try again.');
        }
      }
    };

    fetchStudentData();
  }, [authUser, dispatch, navigate]);

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

  if (!student || !authUser) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl mt-15 font-bold text-gray-800">Welcome back, {student.full_name}!</h1>
          <p className="text-gray-600">Track your academic progress</p>
        </div>
        <button
          onClick={generatePDF}
          className="flex items-center gap-2 mt-10 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
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
          <div className="overflow-x-auto">
            <BarChart width={400} height={300} data={student.semesterProgress}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="semester" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="percentage" fill="#3B82F6" name="Overall Percentage" />
            </BarChart>
          </div>
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