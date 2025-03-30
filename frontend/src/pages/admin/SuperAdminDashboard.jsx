import { useState, useEffect } from 'react';
import { Users, BookOpen, UserCog, BarChart3, UserPlus, Search, Trash2, AlertCircle } from 'lucide-react';
import AddStudent from './forms/AddStudent'; // Import your AddStudent component
import AddTeacher from './forms/AddTeacher'; // Import your AddTeacher component
import AddAdmin from './forms/AddAdmin'; // Import your AddAdmin component
// import AddCourse from './AddCourse'; // Import your AddCourse component
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

const SuperAdminDashboard = () => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(null); // State to track which modal is open
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('student');
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    students: 0,
    teachers: 0,
    admins: 8,
    courses: 32
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  
  // Get the authenticated user's data from Redux
  const authUser = useSelector((state) => state.user.authUser);

  useEffect(() => {
    // Check if user is authenticated and is a super admin
    if (!authUser || authUser.role !== 'super_admin') {
      console.log('SuperAdminDashboard - Unauthorized access, redirecting to login');
      navigate('/login');
      return;
    }

    const fetchData = async () => {
      try {
        // Fetch all students
        const studentsResponse = await axios.get(`${BASE_URL}/api/v1/admin/all/students`, {
          withCredentials: true
        });

        console.log('Students API Response:', {
          status: studentsResponse.status,
          success: studentsResponse.data.success,
          count: studentsResponse.data.students?.length,
          data: studentsResponse.data
        });

        if (studentsResponse.data.success) {
          setStudents(studentsResponse.data.students);
          setStats(prev => ({ ...prev, students: studentsResponse.data.students.length }));
        } else {
          console.error('Failed to fetch students:', studentsResponse.data);
          toast.error(studentsResponse.data.message || 'Failed to fetch students');
        }

        // Fetch all teachers
        const teachersResponse = await axios.get(`${BASE_URL}/api/v1/admin/all/teachers`, {
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
        } else {
          console.error('Failed to fetch teachers:', teachersResponse.data);
          toast.error(teachersResponse.data.message || 'Failed to fetch teachers');
        }

        // Fetch all admins
        const adminsResponse = await axios.get(`${BASE_URL}/api/v1/admin/all`, {
          withCredentials: true
        });

        if (adminsResponse.data.admins) {
          setAdmins(adminsResponse.data.admins);
          setStats(prev => ({ ...prev, admins: adminsResponse.data.admins.length }));
        } else {
          console.error('Failed to fetch admins:', adminsResponse.data);
          toast.error('Failed to fetch admins');
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

    fetchData();
  }, [authUser, navigate]);

  const filteredResults = searchType === 'student' 
    ? students.filter(student => 
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.registration_number.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : searchType === 'teacher'
    ? teachers.filter(teacher => 
        teacher.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.department.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : admins.filter(admin => 
        // Exclude the current super admin from search results
        admin._id !== authUser._id && (
          admin.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          admin.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (admin.department && admin.department.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      );

  const statsData = [
    { label: 'Total Students', value: String(stats.students), icon: <Users size={24} className="text-blue-500" /> },
    { label: 'Total Teachers', value: String(stats.teachers), icon: <BookOpen size={24} className="text-green-500" /> },
    { label: 'Total Admins', value: String(stats.admins), icon: <UserCog size={24} className="text-purple-500" /> },
    { label: 'Active Courses', value: String(stats.courses), icon: <BarChart3 size={24} className="text-orange-500" /> },
  ];

  // Function to close the modal
  const closeModal = () => {
    setOpenModal(null);
  };

  const handleDeleteClick = (item, type) => {
    setItemToDelete(item);
    setDeleteType(type);
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      let endpoint = '';
      switch (deleteType) {
        case 'student':
          endpoint = `${BASE_URL}/api/v1/admin/students/${itemToDelete._id}`;
          break;
        case 'teacher':
          endpoint = `${BASE_URL}/api/v1/admin/teachers/${itemToDelete._id}`;
          break;
        case 'admin':
          endpoint = `${BASE_URL}/api/v1/admin/${itemToDelete._id}`;
          break;
        default:
          return;
      }

      const response = await axios.delete(endpoint, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(`${deleteType.charAt(0).toUpperCase() + deleteType.slice(1)} deleted successfully`);
        // Refresh the data
        fetchData();
      }
    } catch (error) {
      console.error(`Error deleting ${deleteType}:`, error);
      toast.error(error.response?.data?.message || `Failed to delete ${deleteType}`);
    } finally {
      setShowDeleteConfirm(false);
      setItemToDelete(null);
      setDeleteType(null);
    }
  };

  return (
    <div className="w-full h-full overflow-auto py-6 px-4">
      <div className="max-w-9xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl mt-8 font-bold text-gray-800">Welcome back, Admin!</h1>
          <p className="text-gray-600 mt-2">Track your academic progress and manage your institution</p>
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
              <h2 className="text-xl font-bold">Search {searchType === 'student' ? 'Students' : searchType === 'teacher' ? 'Teachers' : 'Admins'}</h2>
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
                <button
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${
                    searchType === 'admin'
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  onClick={() => setSearchType('admin')}
                >
                  Admins
                </button>
              </div>
            </div>

            <div className="mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder={`Search ${searchType}s by name, email, or ${
                    searchType === 'student' ? 'registration number' : 
                    searchType === 'teacher' ? 'department' : 
                    'role or department'
                  }...`}
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
                          ? `Registration: ${result.registration_number} - ${result.Department}`
                          : searchType === 'teacher'
                          ? `${result.department} Department`
                          : `${result.role}${result.department ? ` - ${result.department}` : ''}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          if (searchType === 'admin') {
                            navigate(`/admin/${result._id}`);
                          } 
                          else if (searchType === 'teacher') {
                            navigate(`/teacher/${result._id}`);
                          }
                          else {
                            navigate(`/student/${result._id}`);
                          }
                        }}
                        className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                      >
                        View Details
                      </button>
                      <button
                        onClick={() => handleDeleteClick(result, searchType)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title={`Delete ${searchType}`}
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
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
              <button
                onClick={() => setOpenModal('admin')}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-3 px-4 rounded-lg flex items-center justify-center transition-colors duration-200"
              >
                <UserPlus size={18} className="mr-2" />
                Add Admin
              </button>
              {/* <button 
        onClick={() => setOpenModal('course')}
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

          {/* <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
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
  </div> */}

          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
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

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-center mb-4">
              <div className="bg-red-100 rounded-full p-3">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <h2 className="text-xl font-semibold text-center mb-2">Delete {deleteType?.charAt(0).toUpperCase() + deleteType?.slice(1)}</h2>
            <p className="text-gray-600 text-center mb-6">
              Are you sure you want to delete <span className="font-semibold">{itemToDelete?.full_name}</span>?
              <br />
              <span className="text-sm text-red-600">This action cannot be undone.</span>
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setItemToDelete(null);
                  setDeleteType(null);
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteConfirm}
                className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Delete {deleteType?.charAt(0).toUpperCase() + deleteType?.slice(1)}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminDashboard;