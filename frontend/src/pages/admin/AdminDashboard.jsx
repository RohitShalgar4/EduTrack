import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setStudentData, addStudent, updateStudent, deleteStudent } from '../../redux/studentSlice';
import { Plus, BarChart, Users, Award, FileText, Clock } from 'lucide-react';
import AddStudentForm from './AddStudentForm';
import StudentList from './StudentList';
import AcademicDataManagement from './AcademicDataManagement';
import RemarksFeedback from './RemarksFeedback';
import AchievementsActivities from './AchievementsActivities';
import SearchStudent from './SearchStudent';
import GenerateReports from './GenerateReports';
import SystemLogs from './SystemLogs';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('students');
  const students = useSelector((state) => state.student.data);
  const dispatch = useDispatch();

  const handleAddStudent = (newStudent) => {
    dispatch(addStudent(newStudent));
  };

  const handleUpdateStudent = (updatedStudent) => {
    dispatch(updateStudent(updatedStudent));
  };

  const handleDeleteStudent = (studentId) => {
    dispatch(deleteStudent(studentId));
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'students':
        return (
          <>
            <SearchStudent students={students} />
            <StudentList
              students={students}
              onUpdateStudent={handleUpdateStudent}
              onDeleteStudent={handleDeleteStudent}
            />
          </>
        );
      case 'academic':
        return <AcademicDataManagement />;
      case 'remarks':
        return <RemarksFeedback />;
      case 'achievements':
        return <AchievementsActivities />;
      case 'reports':
        return <GenerateReports students={students} />;
      case 'logs':
        return <SystemLogs />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-2">Manage your student data efficiently</p>
          </div>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
            onClick={() => document.getElementById('addStudentModal')?.showModal()}
          >
            <Plus className="w-4 h-4" />
            Add New Student
          </button>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Users, label: 'Total Students', value: students?.length || 0, color: 'blue' },
            { icon: BarChart, label: 'Average CGPA', value: '3.5', color: 'green' },
            { icon: Award, label: 'Achievements', value: '24', color: 'purple' },
            { icon: FileText, label: 'Reports', value: '12', color: 'orange' },
          ].map((stat, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className={`p-3 bg-${stat.color}-100 rounded-full`}>
                  <stat.icon className={`w-6 h-6 text-${stat.color}-600`} />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <div className="flex overflow-x-auto">
            {[
              'students',
              'academic',
              'remarks',
              'achievements',
              'reports',
              'logs',
            ].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {renderTabContent()}
        </div>

        {/* Add Student Modal */}
        <dialog id="addStudentModal" className="bg-white rounded-lg shadow-xl p-0 w-full max-w-md">
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">Add New Student</h2>
              <button
                onClick={() => document.getElementById('addStudentModal')?.close()}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <AddStudentForm onAddStudent={handleAddStudent} />
          </div>
        </dialog>
      </div>
    </div>
  );
};

export default AdminDashboard;