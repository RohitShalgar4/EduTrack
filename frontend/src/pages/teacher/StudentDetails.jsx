import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { BASE_URL } from '../../main';

const StudentDetails = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/teacher/student/${studentId}`, {
        withCredentials: true
      });
      setStudent(response.data.student);
      setFormData(response.data.student);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching student details:', error);
      toast.error('Failed to fetch student details');
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${BASE_URL}/api/v1/teacher/student/${studentId}`, formData, {
        withCredentials: true
      });
      toast.success('Student details updated successfully');
      setEditMode(false);
      fetchStudentDetails();
    } catch (error) {
      console.error('Error updating student details:', error);
      toast.error('Failed to update student details');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading...</div>;
  }

  return (
    <div className="w-full h-full overflow-auto py-6 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Student Details</h1>
          <p className="text-gray-600 mt-2">View and update student information</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">{student?.full_name}</h2>
            <button
              onClick={() => setEditMode(!editMode)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              {editMode ? 'Cancel Edit' : 'Edit Details'}
            </button>
          </div>

          {editMode ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Mobile Number</label>
                  <input
                    type="text"
                    name="Mobile_No"
                    value={formData.Mobile_No || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Parent Number</label>
                  <input
                    type="text"
                    name="Parent_No"
                    value={formData.Parent_No || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Previous CGPA</label>
                  <input
                    type="number"
                    step="0.01"
                    name="previous_cgpa"
                    value={formData.previous_cgpa || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Previous Percentages</label>
                  <input
                    type="text"
                    name="previous_percentages"
                    value={formData.previous_percentages || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Class Rank</label>
                  <input
                    type="number"
                    name="class_rank"
                    value={formData.class_rank || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Attendance</label>
                  <input
                    type="number"
                    name="attendance"
                    value={formData.attendance || ''}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                >
                  Save Changes
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium text-gray-900">Personal Information</h3>
                <div className="mt-3 space-y-2">
                  <p><span className="text-gray-600">Full Name:</span> {student?.full_name}</p>
                  <p><span className="text-gray-600">Email:</span> {student?.email}</p>
                  <p><span className="text-gray-600">Mobile:</span> {student?.Mobile_No || 'Not provided'}</p>
                  <p><span className="text-gray-600">Parent Contact:</span> {student?.Parent_No || 'Not provided'}</p>
                  <p><span className="text-gray-600">Address:</span> {student?.address}</p>
                </div>
              </div>
              <div>
                <h3 className="font-medium text-gray-900">Academic Information</h3>
                <div className="mt-3 space-y-2">
                  <p><span className="text-gray-600">Registration Number:</span> {student?.registration_number}</p>
                  <p><span className="text-gray-600">Department:</span> {student?.Department}</p>
                  <p><span className="text-gray-600">Class:</span> {student?.class}</p>
                  <p><span className="text-gray-600">Current Semester:</span> {student?.current_semester}</p>
                  <p><span className="text-gray-600">Previous CGPA:</span> {student?.previous_cgpa || 'Not provided'}</p>
                  <p><span className="text-gray-600">Class Rank:</span> {student?.class_rank || 'Not provided'}</p>
                  <p><span className="text-gray-600">Attendance:</span> {student?.attendance || 'Not provided'}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetails; 