import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, BookOpen, UserCog, BarChart3, UserPlus, ChartPieIcon } from 'lucide-react';
import AddStudent from './forms/AddStudent'; // Import your AddStudent component
import AddTeacher from './forms/AddTeacher'; // Import your AddTeacher component
import AddAdmin from './forms/AddAdmin'; // Import your AddAdmin component
// import AddCourse from './AddCourse'; // Import your AddCourse component

const ActivityItem = ({ title, description, time }) => {
  return (
    <div className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
      <h3 className="font-medium">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
      <p className="text-gray-400 text-xs mt-1">{time}</p>
    </div>
  );
};

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(null); // State to track which modal is open

  const stats = [
    { label: 'Total Students', value: '1,245', icon: <Users size={24} className="text-blue-500" /> },
    { label: 'Total Teachers', value: '48', icon: <BookOpen size={24} className="text-green-500" /> },
    { label: 'Total Admins', value: '8', icon: <UserCog size={24} className="text-purple-500" /> },
    { label: 'Active Courses', value: '32', icon: <BarChart3 size={24} className="text-orange-500" /> },
  ];

  // Function to close the modal
  const closeModal = () => {
    setOpenModal(null);
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, Admin!</h1>
          <p className="text-gray-600 mt-2">Track your academic progress and manage your institution</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm p-6 flex items-center hover:shadow-md transition-shadow duration-200">
              <div className="p-3 rounded-full bg-gray-100 mr-4 flex items-center justify-center">
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm p-6 lg:col-span-2 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Activities</h2>
              <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-4">
              <ActivityItem 
                title="New Student Registered" 
                description="John Doe has registered as a new student" 
                time="2 hours ago" 
              />
              <ActivityItem 
                title="Course Updated" 
                description="Advanced Mathematics syllabus has been updated" 
                time="5 hours ago" 
              />
              <ActivityItem 
                title="Teacher Added" 
                description="Sarah Johnson has been added as a Physics teacher" 
                time="Yesterday" 
              />
              <ActivityItem 
                title="Exam Results Published" 
                description="Mid-term exam results have been published" 
                time="2 days ago" 
              />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button 
                onClick={() => setOpenModal('student')} // Open AddStudent modal
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <UserPlus size={18} className="mr-2" />
                Add Student
              </button>
              <button 
                onClick={() => setOpenModal('teacher')} // Open AddTeacher modal
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <UserPlus size={18} className="mr-2" />
                Add Teacher
              </button>
              <button 
                onClick={() => setOpenModal('admin')} // Open AddAdmin modal
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <UserPlus size={18} className="mr-2" />
                Add Admin
              </button>
              {/* <button 
                onClick={() => setOpenModal('course')} // Open AddCourse modal
                className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <BookOpen size={18} className="mr-2" />
                Add Course
              </button> */}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Student Enrollment</h2>
              <select className="border border-gray-300 rounded-md text-sm p-2">
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Enrollment chart will be displayed here</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Performance Overview</h2>
              <select className="border border-gray-300 rounded-md text-sm p-2">
                <option>All Courses</option>
                <option>Mathematics</option>
                <option>Science</option>
                <option>Literature</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Performance chart will be displayed here</p>
            </div>
          </div>
        </div>
      </div>

      {/* Render the appropriate modal based on openModal state */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {openModal === 'student' && 'Add Student'}
                {openModal === 'teacher' && 'Add Teacher'}
                {openModal === 'admin' && 'Add Admin'}
                {/* {openModal === 'course' && 'Add Course'} */}
              </h2>
              <button 
                onClick={closeModal} // Close the modal
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div>
              {openModal === 'student' && <AddStudent onClose={closeModal} />}
              {openModal === 'teacher' && <AddTeacher onClose={closeModal} />}
              {openModal === 'admin' && <AddAdmin onClose={closeModal} />}
              {/* {openModal === 'course' && <AddCourse onClose={closeModal} />} */}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;