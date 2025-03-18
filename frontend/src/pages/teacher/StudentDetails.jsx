import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { BASE_URL } from '../../main';
import { useSelector } from 'react-redux';

const StudentDetails = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const authUser = useSelector((state) => state.user.authUser);
  const [formData, setFormData] = useState({
    Mobile_No: '',
    Parent_No: '',
    previous_cgpa: [],
    previous_percentages: [],
    class_rank: 0,
    attendance: [],
    address: ''
  });

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      // Use the student route endpoint for both roles
      const response = await axios.get(`${BASE_URL}/api/v1/student/${studentId}`, {
        withCredentials: true
      });
      setStudent(response.data);
      setFormData({
        Mobile_No: response.data.Mobile_No,
        Parent_No: response.data.Parent_No,
        previous_cgpa: response.data.previous_cgpa,
        previous_percentages: response.data.previous_percentages,
        class_rank: response.data.class_rank,
        attendance: response.data.attendanceData,
        address: response.data.address
      });
    } catch (error) {
      console.error('Error fetching student details:', error);
      setError(error.response?.data?.message || 'Error fetching student details');
      toast.error(error.response?.data?.message || 'Error fetching student details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAttendanceChange = (index, value) => {
    const newAttendance = [...formData.attendance];
    newAttendance[index] = {
      ...newAttendance[index],
      attendance: parseFloat(value) || 0
    };
    setFormData(prev => ({
      ...prev,
      attendance: newAttendance
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use different endpoints based on user role
      const endpoint = authUser.role === 'department_admin'
        ? `${BASE_URL}/api/v1/admin/student/${studentId}`
        : `${BASE_URL}/api/v1/teacher/student/${studentId}`;

      const response = await axios.put(
        endpoint,
        formData,
        {
          withCredentials: true
        }
      );
      setStudent(response.data.student);
      setIsEditing(false);
      toast.success('Student details updated successfully');
    } catch (error) {
      console.error('Error updating student details:', error);
      toast.error(error.response?.data?.message || 'Error updating student details');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500 text-center">
          <h2 className="text-2xl font-bold mb-4">Error</h2>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500 text-center">
          <h2 className="text-2xl font-bold mb-4">Student Not Found</h2>
          <p>The requested student could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Student Details</h1>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-4 py-2 rounded ${
              isEditing ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            } text-white`}
          >
            {isEditing ? 'Cancel' : 'Edit Details'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Basic Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <p className="mt-1 text-gray-900">{student.full_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Registration Number</label>
              <p className="mt-1 text-gray-900">{student.registration_number}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Department</label>
              <p className="mt-1 text-gray-900">{student.Department}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class</label>
              <p className="mt-1 text-gray-900">{student.class}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current Semester</label>
              <p className="mt-1 text-gray-900">{student.current_semester}</p>
            </div>
          </div>

          {/* Academic Performance */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Academic Performance</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Current CGPA</label>
              <p className="mt-1 text-gray-900">{student.previous_cgpa[student.previous_cgpa.length - 1] || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Class Rank</label>
              {isEditing ? (
                <input
                  type="number"
                  name="class_rank"
                  value={formData.class_rank}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{student.class_rank}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Contact Information</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="Mobile_No"
                  value={formData.Mobile_No}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{student.Mobile_No}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Parent's Number</label>
              {isEditing ? (
                <input
                  type="text"
                  name="Parent_No"
                  value={formData.Parent_No}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                />
              ) : (
                <p className="mt-1 text-gray-900">{student.Parent_No}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Address</label>
              {isEditing ? (
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows="3"
                />
              ) : (
                <p className="mt-1 text-gray-900">{student.address}</p>
              )}
            </div>
          </div>

          {/* Attendance */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-700">Attendance</h2>
            <div className="space-y-2">
              {formData.attendance.map((record, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-700">{record.month}</span>
                  {isEditing ? (
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={record.attendance}
                      onChange={(e) => handleAttendanceChange(index, e.target.value)}
                      className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  ) : (
                    <span className="text-gray-900">{record.attendance}%</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {isEditing && (
          <div className="mt-6 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetails; 