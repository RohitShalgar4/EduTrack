import { useState, useEffect } from 'react';
import { Users, BookOpen, UserCog, BarChart3, UserPlus, Search } from 'lucide-react';
import AddStudent from './forms/AddStudent';
import AddTeacher from './forms/AddTeacher';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../main';
import toast from 'react-hot-toast';

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
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('student');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    courses: 12, // This could be made dynamic later
    performance: 78 // This could be made dynamic later
  });
  
  // Get the authenticated user's data from Redux
  const authUser = useSelector((state) => state.user.authUser);
  
  console.log("DepartmentAdminDashboard - Auth User:", {
    hasUser: Boolean(authUser),
    role: authUser?.role,
    department: authUser?.department,
    fullData: authUser
  });
  
  // Department mapping
  const departmentFullNames = {
    'CSE': 'Computer Science and Engineering',
    'ENTC': 'Electronics and Telecommunication Engineering',
    'MECH': 'Mechanical Engineering',
    'CIVIL': 'Civil Engineering',
    'ELE': 'Electrical Engineering'
  };

  // Get the full department name
  const getDepartmentFullName = (dept) => {
    console.log("Getting department name for:", dept); // Debug log
    if (!dept) {
      console.log("No department provided"); // Debug log
      return 'Loading...';
    }
    const upperDept = dept.toUpperCase();
    const fullName = departmentFullNames[upperDept];
    console.log("Mapped to full name:", fullName); // Debug log
    return fullName || `${dept} Department`;
  };

  const departmentName = getDepartmentFullName(authUser?.department);
  console.log("Final Department Name:", departmentName); // Debug log

  useEffect(() => {
    // Check if user is authenticated and is a department admin
    if (!authUser || authUser.role !== 'department_admin') {
      console.log('DepartmentAdminDashboard - Unauthorized access, redirecting to login');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        console.log('Auth State:', {
          hasDepartment: Boolean(authUser?.department),
          department: authUser?.department,
          role: authUser?.role
        });
        
        if (!authUser?.department) {
          console.error('No department found');
          toast.error('Department information missing');
          return;
        }

        console.log('Fetching data with department:', authUser.department);
        
        // Fetch students
        console.log('Making request to:', `${BASE_URL}/api/v1/admin/department/students`);
        const studentsResponse = await axios.get(`${BASE_URL}/api/v1/admin/department/students`, {
          withCredentials: true
        });

        console.log('Students API Response:', {
          status: studentsResponse.status,
          success: studentsResponse.data.success,
          count: studentsResponse.data.students?.length,
          data: studentsResponse.data,
          headers: studentsResponse.headers,
          config: {
            url: studentsResponse.config.url,
            method: studentsResponse.config.method,
            headers: studentsResponse.config.headers
          }
        });

        if (studentsResponse.data.success) {
          console.log('Setting students state with:', studentsResponse.data.students);
          setStudents(studentsResponse.data.students);
          setStats(prev => ({ ...prev, students: studentsResponse.data.students.length }));
          console.log('Updated students state:', studentsResponse.data.students.length);
        } else {
          console.error('Failed to fetch students:', studentsResponse.data);
          toast.error(studentsResponse.data.message || 'Failed to fetch students');
        }

        // Fetch teachers
        const teachersResponse = await axios.get(`${BASE_URL}/api/v1/admin/department/teachers`, {
          withCredentials: true
        });

        console.log('Teachers API Response:', {
          status: teachersResponse.status,
          success: teachersResponse.data.success,
          count: teachersResponse.data.teachers?.length,
          data: teachersResponse.data
        });

        if (teachersResponse.data.success) {
          setTeachers(teachersResponse.data.teachers);
          setStats(prev => ({ ...prev, teachers: teachersResponse.data.teachers.length }));
          console.log('Updated teachers state:', teachersResponse.data.teachers.length);
        }

      } catch (error) {
        console.error('Error fetching data:', {
          message: error.message,
          response: error.response?.data,
          status: error.response?.status
        });
        
        if (error.response?.status === 401) {
          toast.error('Session expired. Please login again');
          navigate('/login');
        } else {
          toast.error(error.response?.data?.message || 'Failed to fetch data');
        }
      } finally {
        setLoading(false);
      }
    };

    if (authUser?.department) {
      console.log('Starting data fetch with:', {
        department: authUser.department
      });
      fetchData();
    } else {
      console.log('Waiting for auth data:', { 
        hasDepartment: Boolean(authUser?.department),
        authUser: authUser
      });
      setLoading(false);
    }
  }, [authUser?.department, navigate]);

  const filteredResults = searchType === 'student' 
    ? students.filter(student => 
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : teachers.filter(teacher => 
        teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase())
      );

  const statsData = [
    { label: 'Department Students', value: String(stats.students), icon: <Users size={24} className="text-blue-500" /> },
    { label: 'Department Teachers', value: String(stats.teachers), icon: <BookOpen size={24} className="text-green-500" /> },
    { label: 'Department Courses', value: String(stats.courses), icon: <BarChart3 size={24} className="text-orange-500" /> },
    { label: 'Average Performance', value: `${stats.performance}%`, icon: <UserCog size={24} className="text-purple-500" /> },
  ];

  const closeModal = () => {
    setOpenModal(null);
  };

  return (
    <div className="w-full h-full overflow-auto py-6 px-4">

      <div className="max-w-9xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mt-8 text-gray-800">Welcome back, Department Admin!</h1>
          <p className="text-gray-600 mt-2">Managing: {departmentName}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
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
                  placeholder={`Search ${searchType}s by name or email...`}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>

            <div className="space-y-4 max-h-[200px] overflow-y-auto pr-2">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
                </div>
              ) : filteredResults.length > 0 ? (
                filteredResults.map((result) => (
                  <div key={result._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div>
                      <h3 className="font-medium text-gray-900">{result.full_name}</h3>
                      <p className="text-sm text-gray-500">{result.email}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        {searchType === 'student' 
                          ? `Semester ${result.current_semester} - ${result.department}`
                          : `${result.department} Department`}
                      </p>
                    </div>
                    <button 
                      onClick={() => navigate(`/student/${result._id}`)}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {searchQuery ? `No ${searchType}s found matching your search criteria` : `Enter a search term to find ${searchType}s`}
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
                description={`John Doe has registered as a new student in ${departmentName}`}
                time="2 hours ago"
              />
              <ActivityItem
                title="Course Updated"
                description="Advanced Programming syllabus has been updated"
                time="5 hours ago"
              />
              <ActivityItem
                title="Teacher Added"
                description={`Sarah Johnson has been added as a ${departmentName} teacher`}
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
              {openModal === 'student' && <AddStudent onClose={closeModal} department={authUser?.department} />}
              {openModal === 'teacher' && <AddTeacher onClose={closeModal} department={authUser?.department} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentAdminDashboard; 