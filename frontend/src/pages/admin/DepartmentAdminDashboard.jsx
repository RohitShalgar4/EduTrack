import { useState, useEffect } from 'react';
import { Users, BookOpen, UserCog, BarChart3, UserPlus, Search, Trash2, AlertCircle } from 'lucide-react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ResponsiveContainer, Tooltip } from 'recharts';
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
    courses: 12,
    performance: 78
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [deleteType, setDeleteType] = useState(null);
  const [performanceData, setPerformanceData] = useState([]);
  
  const authUser = useSelector((state) => state.user.authUser);
  
  console.log("[DepartmentAdminDashboard] Initial Render - Auth User:", {
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

  const getDepartmentFullName = (dept) => {
    console.log("[DepartmentAdminDashboard] Getting department name for:", dept);
    if (!dept) {
      console.log("[DepartmentAdminDashboard] No department provided");
      return 'Loading...';
    }
    const upperDept = dept.toUpperCase();
    const fullName = departmentFullNames[upperDept];
    console.log("[DepartmentAdminDashboard] Mapped department name:", fullName);
    return fullName || `${dept} Department`;
  };

  const departmentName = getDepartmentFullName(authUser?.department);
  console.log("[DepartmentAdminDashboard] Final Department Name:", departmentName);

  const fetchDashboardData = async () => {
    console.log("[DepartmentAdminDashboard] Starting data fetch...");
    try {
      if (!authUser?.department) {
        console.error('[DepartmentAdminDashboard] No department found in auth user data');
        toast.error('Department information missing');
        return;
      }

      console.log('[DepartmentAdminDashboard] Fetching students data...');
      const studentsResponse = await axios.get(`${BASE_URL}/api/v1/admin/department/students`, {
        withCredentials: true
      });
      console.log('[DepartmentAdminDashboard] Students Response:', {
        status: studentsResponse.status,
        count: studentsResponse.data.students?.length,
        data: studentsResponse.data
      });

      if (studentsResponse.data.success) {
        setStudents(studentsResponse.data.students);
        setStats(prev => ({ ...prev, students: studentsResponse.data.students.length }));
        console.log('[DepartmentAdminDashboard] Updated students count:', studentsResponse.data.students.length);
      }

      console.log('[DepartmentAdminDashboard] Fetching teachers data...');
      const teachersResponse = await axios.get(`${BASE_URL}/api/v1/admin/department/teachers`, {
        withCredentials: true
      });
      console.log('[DepartmentAdminDashboard] Teachers Response:', {
        status: teachersResponse.status,
        count: teachersResponse.data.teachers?.length,
        data: teachersResponse.data
      });

      if (teachersResponse.data.success) {
        setTeachers(teachersResponse.data.teachers);
        setStats(prev => ({ ...prev, teachers: teachersResponse.data.teachers.length }));
        console.log('[DepartmentAdminDashboard] Updated teachers count:', teachersResponse.data.teachers.length);
      }

      // Fetch performance data
      const performanceResponse = await axios.get(`${BASE_URL}/api/v1/admin/department/performance`, {
        withCredentials: true
      });

      if (performanceResponse.data.success) {
        console.log('[DepartmentAdminDashboard] Performance data:', performanceResponse.data.performance);
        setPerformanceData(performanceResponse.data.performance);
      }

    } catch (error) {
      console.error('[DepartmentAdminDashboard] Error fetching data:', {
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

  // Initial fetch
  useEffect(() => {
    console.log('[DepartmentAdminDashboard] Initial useEffect triggered');
    
    if (!authUser || authUser.role !== 'department_admin') {
      console.log('[DepartmentAdminDashboard] Unauthorized access, redirecting to login');
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [authUser, navigate]);

  // Set up polling for real-time updates
  useEffect(() => {
    console.log('[DepartmentAdminDashboard] Setting up polling interval');
    const pollInterval = setInterval(() => {
      console.log('[DepartmentAdminDashboard] Polling for fresh data...');
      fetchDashboardData();
    }, 30000); // Poll every 30 seconds

    return () => {
      console.log('[DepartmentAdminDashboard] Cleaning up polling interval');
      clearInterval(pollInterval);
    };
  }, [authUser?.department]);

  // Log when search results change
  useEffect(() => {
    console.log('[DepartmentAdminDashboard] Search Results Updated:', {
      type: searchType,
      query: searchQuery,
      resultsCount: filteredResults.length
    });
  }, [searchQuery, searchType, students, teachers]);

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
        default:
          return;
      }

      const response = await axios.delete(endpoint, {
        withCredentials: true
      });

      if (response.data.success) {
        toast.success(`${deleteType.charAt(0).toUpperCase() + deleteType.slice(1)} deleted successfully`);
        // Refresh the data
        fetchDashboardData();
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

  const renderPerformanceChart = () => {
    if (loading) {
      return (
        <div className="h-72 flex items-center justify-center">
          <div className="flex flex-col items-center space-y-3">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 font-medium">Loading performance data...</p>
          </div>
        </div>
      );
    }
    
    if (!performanceData.length) {
      return (
        <div className="h-72 flex flex-col items-center justify-center space-y-4">
          <AlertCircle size={36} className="text-gray-400" />
          <div className="text-center">
            <p className="text-gray-600 font-medium">No performance data available</p>
            <p className="text-gray-500 text-sm mt-1">Performance metrics will appear here once data is available</p>
          </div>
        </div>
      );
    }
    
    // Radar data with No. of Students and No. of 9+ CGPA Students
    const radarData = [
      {
        subject: 'Attendance',
        value: performanceData[0]?.attendance || 0,
        fullMark: 100,
        color: '#3B82F6',
        description: 'Average student attendance rate'
      },
      {
        subject: 'Result',
        value: performanceData[0]?.result || 0,
        fullMark: 100,
        color: '#10B981',
        description: 'Average academic performance'
      },
      {
        subject: 'Achievements',
        value: performanceData[0]?.achievements || 0,
        fullMark: 100,
        color: '#8B5CF6',
        description: 'Special accomplishments and awards'
      },
      {
        subject: 'No. of Students',
        value: performanceData[0]?.students || 0,
        fullMark: 100,
        color: '#F59E0B',
        description: 'Total number of students in the department'
      },
      {
        subject: 'No. of 9+ CGPA Students',
        value: performanceData[0]?.cgpa9plus || 0,
        fullMark: 100,
        color: '#EC4899',
        description: 'Students with latest CGPA ≥ 9'
      },
    ];
    
    // Enhanced custom tooltip
    const CustomTooltip = ({ active = false, payload = [] }) => {
      if (active && payload && payload.length) {
        const item = radarData.find(d => d.subject === payload[0]?.payload?.subject);
        if (!item) return null;
        return (
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-3">
            <div className="flex items-center space-x-2 mb-1">
              <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
              <h3 className="font-semibold text-gray-800">{item.subject}</h3>
            </div>
            <div className="mb-1">
              <span className="text-2xl font-bold" style={{ color: item.color }}>{item.value}</span>
              {item.fullMark === 100 && <span className="text-gray-500 text-sm ml-1">/ 100%</span>}
            </div>
            <p className="text-xs text-gray-600">{item.description}</p>
          </div>
        );
      }
      return null;
    };
    CustomTooltip.propTypes = {
      active: PropTypes.bool,
      payload: PropTypes.array
    };
    
    // Custom legend renderer
    const CustomLegend = ({ payload = [] }) => {
      return (
        <div className="flex flex-wrap justify-center mt-4 gap-3">
          {payload.map((entry, index) => (
            <div key={`legend-${index}`} className="flex items-center space-x-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-700">{entry.value}</span>
            </div>
          ))}
        </div>
      );
    };
    CustomLegend.propTypes = {
      payload: PropTypes.array
    };
    
    return (
      <div className="flex flex-col h-full">
        <div className="flex justify-between items-center mb-2">
          <div>
            <h3 className="text-lg font-semibold text-gray-800">Departmental Metrics</h3>
            <p className="text-sm text-gray-500">Performance overview for {departmentName}</p>
          </div>
        </div>
        <div style={{ height: 400, width: '100%' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart 
              cx="50%" 
              cy="50%" 
              outerRadius="70%" 
              data={radarData}
            >
              <PolarGrid stroke="#E5E7EB" strokeDasharray="3 3" />
              <PolarAngleAxis 
                dataKey="subject" 
                tick={{ 
                  fill: '#374151', 
                  fontSize: 12, 
                  fontWeight: 600 
                }} 
                axisLine={{ stroke: '#E5E7EB' }}
              />
              <PolarRadiusAxis 
                angle={90} 
                domain={[0, 100]} 
                axisLine={false} 
                tick={{ fill: '#6B7280', fontSize: 10 }}
                tickCount={5}
                tickFormatter={(value) => `${value}%`}
              />
              <Radar 
                name="Performance" 
                dataKey="value" 
                stroke="#3B82F6" 
                fill="url(#radarGradient)" 
                fillOpacity={0.6} 
                strokeWidth={2}
                dot={{ 
                  fill: '#fff',
                  stroke: '#3B82F6',
                  strokeWidth: 2,
                  r: 4,
                }}
                activeDot={{
                  fill: '#2563EB',
                  stroke: '#fff',
                  strokeWidth: 2,
                  r: 8,
                }}
              />
              <Legend content={<CustomLegend />} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.8} />
                  <stop offset="100%" stopColor="#93C5FD" stopOpacity={0.2} />
                </linearGradient>
              </defs>
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {['Attendance', 'Result', 'No. of 9+ CGPA Students'].map((metric, index) => {
            const item = radarData.find(d => d.subject === metric);
            const value = item?.value || 0;
            
            return (
              <div key={index} className="bg-gray-50 rounded-lg p-2 text-center">
                <div className="text-sm text-gray-600">{metric}</div>
                <div className="font-bold text-lg" style={{ color: item?.color }}>{value}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full overflow-auto py-6 px-4">

      <div className="max-w-9xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mt-8 text-gray-800">Welcome back, Department Admin : {authUser?.full_name}!</h1>
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
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          if (searchType === 'teacher') {
                            navigate(`/teacher/${result._id}`);
                          } else {
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
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold">Department Performance</h2>
            </div>
            {renderPerformanceChart()}
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

export default DepartmentAdminDashboard; 