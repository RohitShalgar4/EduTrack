import { useState } from 'react';
import { Users, BookOpen, UserCog, BarChart3, UserPlus, Search } from 'lucide-react';
import AddStudent from './forms/AddStudent';
import AddTeacher from './forms/AddTeacher';
import PropTypes from 'prop-types';

const ActivityItem = ({ title, description, time }) => {
  return (
    <div className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
      <h3 className="font-medium">{title}</h3>
      <p className="text-gray-500 text-sm">{description}</p>
      <p className="text-gray-400 text-xs mt-1">{time}</p>
    </div>
  );
};

ActivityItem.propTypes = {
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  time: PropTypes.string.isRequired
};

const DepartmentAdminDashboard = () => {
  const [openModal, setOpenModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('student');
  const [departmentFilter, setDepartmentFilter] = useState('Computer Science'); // Default department

  // Mock data for demonstration
  const mockResults = [
    { id: 1, name: 'John Doe', email: 'john.doe@example.com', type: 'student', details: 'Grade 10 - Computer Science' },
    { id: 2, name: 'Jane Smith', email: 'jane.smith@example.com', type: 'student', details: 'Grade 11 - Computer Science' },
    { id: 3, name: 'Dr. Sarah Johnson', email: 'sarah.j@example.com', type: 'teacher', details: 'Computer Science Department' },
    { id: 4, name: 'Prof. David Wilson', email: 'david.w@example.com', type: 'teacher', details: 'Computer Science Department' },
  ];

  const filteredResults = mockResults.filter(
    (result) =>
      result.type === searchType &&
      result.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Department Students', value: '245', icon: <Users size={24} className="text-blue-500" /> },
    { label: 'Department Teachers', value: '18', icon: <BookOpen size={24} className="text-green-500" /> },
    { label: 'Department Courses', value: '12', icon: <BarChart3 size={24} className="text-orange-500" /> },
    { label: 'Average Performance', value: '78%', icon: <UserCog size={24} className="text-purple-500" /> },
  ];

  const closeModal = () => {
    setOpenModal(null);
  };

  return (
    <div className="w-full h-full overflow-auto py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Welcome back, Department Admin!</h1>
          <p className="text-gray-600 mt-2">Manage your department: {departmentFilter}</p>
        </div>

        <div className="mb-6">
          <label htmlFor="departmentFilter" className="block text-sm font-medium text-gray-700 mb-2">
            Department
          </label>
          <select
            id="departmentFilter"
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Computer Science">Computer Science</option>
            <option value="Electrical Engineering">Electrical Engineering</option>
            <option value="Mechanical Engineering">Mechanical Engineering</option>
            <option value="Civil Engineering">Civil Engineering</option>
          </select>
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
          <div className="bg-white rounded-lg shadow-md p-6 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Search {searchType === 'student' ? 'Students' : 'Teachers'}</h2>
              <div className="flex space-x-2">
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    searchType === 'student'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setSearchType('student')}
                >
                  Students
                </button>
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    searchType === 'teacher'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setSearchType('teacher')}
                >
                  Teachers
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${searchType}s by name, email, or ${
                    searchType === 'student' ? 'grade' : 'department'
                  }...`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <div className="space-y-4">
              {filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <div key={result.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div>
                      <h3 className="font-medium text-gray-900">{result.name}</h3>
                      <p className="text-sm text-gray-500">{result.email}</p>
                      <p className="text-sm text-gray-600 mt-1">{result.details}</p>
                    </div>
                    <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">
                      View Details
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No {searchType}s found matching your search criteria
                </div>
              )}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="space-y-3">
              <button
                onClick={() => setOpenModal('student')}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <UserPlus size={18} className="mr-2" />
                Add Student
              </button>
              <button
                onClick={() => setOpenModal('teacher')}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <UserPlus size={18} className="mr-2" />
                Add Teacher
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Department Performance</h2>
              <select className="border border-gray-300 rounded-md text-sm p-2">
                <option>Last 30 Days</option>
                <option>Last 3 Months</option>
                <option>Last 6 Months</option>
                <option>Last Year</option>
              </select>
            </div>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg">
              <p className="text-gray-500">Department performance chart will be displayed here</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Recent Activities</h2>
              <button className="text-blue-500 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-4">
              <ActivityItem
                title="New Student Registered"
                description="John Doe has registered as a new student in Computer Science"
                time="2 hours ago"
              />
              <ActivityItem
                title="Course Updated"
                description="Advanced Programming syllabus has been updated"
                time="5 hours ago"
              />
              <ActivityItem
                title="Teacher Added"
                description="Sarah Johnson has been added as a Computer Science teacher"
                time="Yesterday"
              />
              <ActivityItem
                title="Exam Results Published"
                description="Mid-term exam results have been published for CS101"
                time="2 days ago"
              />
            </div>
          </div>
        </div>
      </div>

      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {openModal === 'student' && 'Add Student'}
                {openModal === 'teacher' && 'Add Teacher'}
              </h2>
              <button
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div>
              {openModal === 'student' && <AddStudent onClose={closeModal} departmentFilter={departmentFilter} />}
              {openModal === 'teacher' && <AddTeacher onClose={closeModal} departmentFilter={departmentFilter} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentAdminDashboard; 