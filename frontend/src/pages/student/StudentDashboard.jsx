import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStudentData, clearStudentData } from '../../redux/studentSlice';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Book, Award, Trophy, Clock, Download, User, Phone, MapPin, GraduationCap, Calendar, Hash } from 'lucide-react';
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

        console.log('Raw response data:', res.data);

        if (res.data) {
          console.log('Processing student data fields:', {
            full_name: res.data.full_name,
            registration_number: res.data.registration_number,
            Department: res.data.Department,
            current_semester: res.data.current_semester,
            Mobile_No: res.data.Mobile_No,
            Parent_No: res.data.Parent_No,
            address: res.data.address,
            gender: res.data.gender,
            cgpa: res.data.cgpa,
            sgpa: res.data.sgpa,
            class_rank: res.data.class_rank,
            attendance: res.data.attendance,
            previous_cgpa: res.data.previous_cgpa,
            previous_percentages: res.data.previous_percentages,
            semesterProgress: res.data.semesterProgress,
            attendanceData: res.data.attendanceData,
            achievements: res.data.achievements,
            photo_url: res.data.photo_url
          });

          const studentData = {
            ...res.data,
            _id: authUser._id,
            full_name: res.data.full_name ?? 'Not Available',
            registration_number: res.data.registration_number ?? 'Not Available',
            Department: res.data.Department ?? 'Not Available',
            current_semester: res.data.current_semester ?? 'Not Available',
            Mobile_No: res.data.Mobile_No ?? 'Not Available',
            Parent_No: res.data.Parent_No ?? 'Not Available',
            address: res.data.address ?? 'Not Available',
            gender: res.data.gender ?? 'Not Available',
            cgpa: res.data.cgpa ?? 0,
            sgpa: res.data.sgpa ?? 0,
            class_rank: res.data.class_rank ?? 0,
            attendance: res.data.attendance ?? 0,
            previous_cgpa: res.data.previous_cgpa ?? [],
            previous_percentages: res.data.previous_percentages ?? [],
            semesterProgress: res.data.semesterProgress ?? [],
            attendanceData: res.data.attendanceData ?? [],
            achievements: res.data.achievements ?? [],
            photo_url: res.data.photo_url ?? 'https://via.placeholder.com/150'
          };

          console.log('Processed student data:', studentData);
          dispatch(setStudentData(studentData));
        } else {
          console.error('No data received from server');
          dispatch(clearStudentData());
          toast.error('No data received from server');
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
        console.error('Error response:', error.response?.data);
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

  useEffect(() => {
    console.log('Current student data in component:', student);
  }, [student]);

  const generatePDF = () => {
    if (!student) {
      toast.error('No student data available to generate PDF');
      return;
    }

    const doc = new jsPDF();
    
    // Set margins and dimensions
    const margin = 20;
    const pageWidth = doc.internal.pageSize.width;
    const contentWidth = pageWidth - (2 * margin);
    
    // Add college header with blue background
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(18);
    doc.text('N B NAVALE SINHGAD COLLEGE OF ENGINEERING', pageWidth / 2, 20, { align: 'center' });
    doc.setFontSize(12);
    doc.text('(Approved by AICTE & Affiliated to P.A.H. Solapur University, Solapur)', pageWidth / 2, 30, { align: 'center' });

    // Add student photo and basic info section
    doc.addImage(student.photo_url, 'JPEG', margin, 50, 35, 45);
    
    // Student basic info with better spacing
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(String(student.full_name), margin + 45, 60);
    doc.setFont(undefined, 'normal');
    doc.setFontSize(11);
    const infoStartY = 70;
    const infoSpacing = 12;
    [
      ['Registration Number:', student.registration_number],
      ['Department:', student.Department],
      ['Current Semester:', student.current_semester],
      ['Mobile Number:', student.Mobile_No],
      ["Parent's Number:", student.Parent_No],
      ['Address:', student.address],
      ['Gender:', student.gender]
    ].forEach((info, index) => {
      doc.setFont(undefined, 'bold');
      doc.text(info[0], margin + 45, infoStartY + (index * infoSpacing));
      doc.setFont(undefined, 'normal');
      doc.text(String(info[1]), margin + 45 + doc.getTextWidth(info[0]) + 5, infoStartY + (index * infoSpacing));
    });

    // Academic Performance section with blue header
    const academicY = infoStartY + (8 * infoSpacing);
    doc.setFillColor(240, 247, 255);
    doc.rect(margin, academicY, contentWidth, 10, 'F');
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('ACADEMIC PERFORMANCE', margin + 5, academicY + 8);
    
    // Academic stats in a grid layout
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    const statsStartY = academicY + 20;
    const statsData = [
      ['Current CGPA:', String(student.cgpa || '0.00')],
      ['Current SGPA:', String(student.sgpa || '0.00')],
      ['Class Rank:', String(student.class_rank || 'N/A')],
      ['Overall Attendance:', `${String(student.attendance || '0')}%`]
    ];

    statsData.forEach((stat, index) => {
      const x = margin + (index % 2) * (contentWidth / 2);
      const y = statsStartY + Math.floor(index / 2) * 15;
      doc.setFont(undefined, 'bold');
      doc.text(stat[0], x, y);
      doc.setFont(undefined, 'normal');
      doc.text(stat[1], x + doc.getTextWidth(stat[0]) + 5, y);
    });

    // Previous Academic Performance section
    const prevAcadY = statsStartY + 40;
    doc.setFillColor(240, 247, 255);
    doc.rect(margin, prevAcadY, contentWidth, 10, 'F');
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('PREVIOUS ACADEMIC RECORDS', margin + 5, prevAcadY + 8);

    // CGPA History and Percentages in two columns
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    const historyStartY = prevAcadY + 25;
    
    // CGPA History
    doc.setFont(undefined, 'bold');
    doc.text('Previous CGPA History:', margin, historyStartY);
    doc.setFont(undefined, 'normal');
    student.previous_cgpa?.forEach((cgpa, index) => {
      doc.text(`Semester ${index + 1}: ${cgpa}`, margin + 10, historyStartY + ((index + 1) * 12));
    });

    // Percentages
    doc.setFont(undefined, 'bold');
    doc.text('Previous Percentages:', margin + (contentWidth / 2), historyStartY);
    doc.setFont(undefined, 'normal');
    student.previous_percentages?.forEach((percentage, index) => {
      doc.text(`Semester ${index + 1}: ${percentage}%`, margin + (contentWidth / 2) + 10, historyStartY + ((index + 1) * 12));
    });

    // Achievements section
    const achieveY = historyStartY + Math.max(
      (student.previous_cgpa?.length || 0),
      (student.previous_percentages?.length || 0)
    ) * 12 + 30;

    doc.setFillColor(240, 247, 255);
    doc.rect(margin, achieveY, contentWidth, 10, 'F');
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(59, 130, 246);
    doc.text('ACHIEVEMENTS', margin + 5, achieveY + 8);

    // List achievements with bullet points
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(11);
    if (student.achievements?.length > 0) {
      student.achievements.forEach((achievement, index) => {
        const y = achieveY + 25 + (index * 25);
        doc.setFont(undefined, 'bold');
        doc.text(`• ${String(achievement.title)}`, margin + 5, y);
        doc.setFont(undefined, 'normal');
        doc.text(String(achievement.description), margin + 10, y + 8);
        doc.setFontSize(10);
        doc.text(String(achievement.date), margin + 10, y + 16);
        doc.setFontSize(11);
      });
    } else {
      doc.setFont(undefined, 'normal');
      doc.text('No achievements recorded', margin + 5, achieveY + 25);
    }

    // Add footer with page numbers
    const pageCount = doc.internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        doc.internal.pageSize.height - margin,
        { align: 'center' }
      );
    }

    // Save the PDF
    doc.save(`${String(student.full_name)}-academic-profile.pdf`);
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

      {/* Student Profile Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-start gap-6">
          {/* Student Photo */}
          <div className="flex-shrink-0">
            <img
              src={student.photo_url}
              alt={student.full_name}
              className="w-32 h-40 object-cover rounded-lg border-2 border-gray-200"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
          </div>
          
          {/* Student Details */}
          <div className="flex-grow grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Full Name:</span>
                <span className="font-medium">{student.full_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <Hash className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Registration Number:</span>
                <span className="font-medium">{student.registration_number}</span>
              </div>
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Department:</span>
                <span className="font-medium">{student.Department}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Current Semester:</span>
                <span className="font-medium">{student.current_semester}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Mobile Number:</span>
                <span className="font-medium">{student.Mobile_No}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Parent&apos;s Number:</span>
                <span className="font-medium">{student.Parent_No}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Address:</span>
                <span className="font-medium">{student.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5 text-gray-500" />
                <span className="text-gray-600">Gender:</span>
                <span className="font-medium">{student.gender}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { icon: Book, label: 'Current CGPA', value: student.cgpa || '0.00' },
          { icon: Book, label: 'Current SGPA', value: student.sgpa || '0.00' },
          { icon: Award, label: 'Current Semester', value: student.current_semester || 'Not Available' },
          { icon: Trophy, label: 'Class Rank', value: student.class_rank || '0' },
          { icon: Clock, label: 'Attendance', value: `${student.attendance || 0}%` },
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

      {/* Previous Academic Performance */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Previous Academic Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-medium mb-2">Previous CGPA History</h3>
            <div className="space-y-2">
              {student.previous_cgpa?.map((cgpa, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">Semester {index + 1}</span>
                  <span className="font-medium">{cgpa}</span>
                </div>
              )) || <p className="text-gray-500">No CGPA history available</p>}
            </div>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-2">Previous Percentages</h3>
            <div className="space-y-2">
              {student.previous_percentages?.map((percentage, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-gray-600">Semester {index + 1}</span>
                  <span className="font-medium">{percentage}%</span>
                </div>
              )) || <p className="text-gray-500">No percentage history available</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm max-w-full overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Semester-wise Progress</h2>
          <div className="overflow-x-auto">
            {student.semesterProgress?.length > 0 ? (
              <BarChart 
                width={500} 
                height={300} 
                data={student.semesterProgress}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="semester" 
                  angle={-45}
                  textAnchor="end"
                  height={70}
                  interval={0}
                  tickFormatter={(value) => `Semester ${value}`}
                />
                <YAxis 
                  domain={[0, 100]}
                  label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Percentage']}
                  labelFormatter={(label) => `Semester ${label}`}
                />
                <Legend />
                <Bar 
                  dataKey="percentage" 
                  fill="#3B82F6" 
                  name="Overall Percentage"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <p className="text-gray-500 text-center py-4">No semester progress data available</p>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm max-w-full overflow-hidden">
          <h2 className="text-lg font-semibold mb-4">Attendance Trend</h2>
          <div className="overflow-x-auto">
            {student.attendanceData?.length > 0 ? (
            <LineChart width={500} height={300} data={student.attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="attendance" stroke="#3B82F6" name="Attendance %" />
            </LineChart>
            ) : (
              <p className="text-gray-500 text-center py-4">No attendance data available</p>
            )}
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">Achievements</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {student.achievements && student.achievements.length > 0 ? (
            student.achievements.map((achievement, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <p className="font-medium text-gray-800">{achievement}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500 col-span-2 text-center py-4">No achievements available</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;