import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../main';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const TeacherDashboard = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const authUser = useSelector((state) => state.user.authUser);

  const fetchStudents = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/teacher/students/all`, {
        withCredentials: true
      });
      
      // Check if response.data has the correct structure
      if (response.data && response.data.success && Array.isArray(response.data.students)) {
        setStudents(response.data.students);
      } else {
        console.error('Invalid response structure:', response.data);
        toast.error('Invalid response format from server');
        setStudents([]);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error fetching students:', error);
      toast.error(error.response?.data?.message || 'Error fetching students');
      setStudents([]);
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    if (!authUser) {
      navigate('/login');
      return;
    }
    fetchStudents();
  }, [authUser, navigate]);

  // Set up polling for real-time updates
  useEffect(() => {
    if (!authUser) return;
    
    const pollInterval = setInterval(() => {
      fetchStudents();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(pollInterval);
  }, [authUser]);

  const handleViewDetails = (studentId) => {
    navigate(`/student/${studentId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h1>
          <div className="text-gray-600">
            Welcome, {authUser?.fullName || 'Teacher'}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registration Number</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {Array.isArray(students) && students.map((student) => (
                <tr key={student._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={student.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.full_name)}`}
                          alt={student.full_name}
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{student.full_name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.registration_number}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.Department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.class}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleViewDetails(student._id)}
                      className="text-indigo-600 hover:text-indigo-900"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {(!Array.isArray(students) || students.length === 0) && (
          <div className="text-center py-8">
            <p className="text-gray-500">No students found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDashboard; 