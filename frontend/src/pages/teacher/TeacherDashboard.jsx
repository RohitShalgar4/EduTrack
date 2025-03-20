import { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { BASE_URL } from '../../main';
import { useNavigate } from 'react-router-dom';

const TeacherDashboard = () => {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const authUser = useSelector((state) => state.user.authUser);
  const navigate = useNavigate();

  useEffect(() => {
    console.log('TeacherDashboard - Auth User:', authUser);
    
    // Check if user is authenticated and is a teacher
    if (!authUser || authUser.role !== 'teacher') {
      console.log('TeacherDashboard - Unauthorized access, redirecting to login');
      navigate('/login');
      return;
    }

    // Check if it's first login
    if (authUser.isFirstLogin) {
      console.log('TeacherDashboard - First login detected, redirecting to password update');
      navigate('/update-password');
      return;
    }

    fetchStudents();
  }, [authUser, navigate]);

  const fetchStudents = async () => {
    try {
      console.log('TeacherDashboard - Fetching students');
      const response = await axios.get(`${BASE_URL}/api/v1/teacher/students/all`, {
        withCredentials: true
      });
      console.log('TeacherDashboard - Students fetched:', response.data);
      setStudents(response.data.students);
      setLoading(false);
    } catch (error) {
      console.error('TeacherDashboard - Error fetching students:', error);
      toast.error('Failed to fetch students');
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.registration_number.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleViewStudent = (studentId) => {
    navigate(`/student/${studentId}`);
  };

  if (!authUser || authUser.role !== 'teacher') {
    return null;
  }

  return (
    <div className="w-full h-full overflow-auto py-6 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mt-8 text-gray-800">Welcome back, {authUser.full_name}!</h1>
          <p className="text-gray-600 mt-2">Manage your students and view their progress</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">Students</h2>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search students..."
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : (
            <div className="space-y-4">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((student) => (
                  <div key={student._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                    <div>
                      <h3 className="font-medium text-gray-900">{student.full_name}</h3>
                      <p className="text-sm text-gray-500">{student.email}</p>
                      <p className="text-sm text-gray-600">Registration: {student.registration_number}</p>
                    </div>
                    <button
                      onClick={() => handleViewStudent(student._id)}
                      className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                    >
                      View Details
                    </button>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No students found matching your search criteria
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard; 