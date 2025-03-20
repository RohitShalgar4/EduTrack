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
    address: '',
    class: '',
    achievements: []
  });

  useEffect(() => {
    fetchStudentDetails();
  }, [studentId]);

  const fetchStudentDetails = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/v1/student/${studentId}`, {
        withCredentials: true
      });
      
      const studentData = response.data;
      setStudent(studentData);
      
      // Ensure achievements is always an array
      let achievementsArray = [];
      if (studentData.achievements) {
        if (Array.isArray(studentData.achievements)) {
          achievementsArray = studentData.achievements;
        } else if (typeof studentData.achievements === 'string') {
          try {
            const parsed = JSON.parse(studentData.achievements);
            if (Array.isArray(parsed)) {
              achievementsArray = parsed;
            } else {
              achievementsArray = [studentData.achievements];
            }
          } catch {
            achievementsArray = [studentData.achievements];
          }
        } else {
          achievementsArray = [String(studentData.achievements)];
        }
      }
      
      setFormData({
        Mobile_No: studentData.Mobile_No || '',
        Parent_No: studentData.Parent_No || '',
        previous_cgpa: Array.isArray(studentData.previous_cgpa) ? studentData.previous_cgpa : [],
        previous_percentages: Array.isArray(studentData.previous_percentages) ? studentData.previous_percentages : [],
        class_rank: studentData.class_rank || 0,
        attendance: Array.isArray(studentData.attendanceData) ? studentData.attendanceData : [],
        address: studentData.address || '',
        class: studentData.class || '',
        achievements: achievementsArray
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

  const handleCgpaChange = (index, value) => {
    const newCgpa = [...formData.previous_cgpa];
    newCgpa[index] = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      previous_cgpa: newCgpa
    }));
  };

  const handlePercentageChange = (index, value) => {
    const newPercentages = [...formData.previous_percentages];
    newPercentages[index] = parseFloat(value) || 0;
    setFormData(prev => ({
      ...prev,
      previous_percentages: newPercentages
    }));
  };

  const handleAchievementChange = (index, value) => {
    const newAchievements = [...formData.achievements];
    newAchievements[index] = value;
    setFormData(prev => ({
      ...prev,
      achievements: newAchievements
    }));
  };

  const addAchievement = () => {
    setFormData(prev => ({
      ...prev,
      achievements: [...prev.achievements, '']
    }));
  };

  const removeAchievement = (index) => {
    const newAchievements = [...formData.achievements];
    newAchievements.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      achievements: newAchievements
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Use different endpoints based on user role
      const endpoint = authUser.role === 'department_admin'
        ? `${BASE_URL}/api/v1/admin/student/${studentId}`
        : `${BASE_URL}/api/v1/teacher/student/${studentId}`;

      // Explicitly handle achievements - ensure it's a clean array of strings
      const cleanedAchievements = Array.isArray(formData.achievements) 
        ? formData.achievements
            .filter(achievement => achievement && achievement.trim() !== '')
            .map(achievement => achievement.trim())
        : [];
      
      // Create a complete payload with all fields
      const payload = {
        Mobile_No: formData.Mobile_No || '',
        Parent_No: formData.Parent_No || '',
        previous_cgpa: Array.isArray(formData.previous_cgpa) ? formData.previous_cgpa : [],
        previous_percentages: Array.isArray(formData.previous_percentages) ? formData.previous_percentages : [],
        class_rank: formData.class_rank || 0,
        attendance: Array.isArray(formData.attendance) ? formData.attendance : [],
        address: formData.address || '',
        class: formData.class || '',
        achievements: cleanedAchievements
      };

      const response = await axios.put(
        endpoint,
        payload,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      // Update the local state immediately with the cleaned achievements
      setStudent(prevStudent => ({
        ...prevStudent,
        achievements: cleanedAchievements
      }));
      
      // Wait briefly to ensure the database update is complete
      setTimeout(async () => {
        try {
          // Explicitly refetch the data to get the latest achievements
          const refreshResponse = await axios.get(`${BASE_URL}/api/v1/student/${studentId}`, {
            withCredentials: true
          });
          
          setStudent(refreshResponse.data);
          setFormData(prev => ({
            ...prev,
            achievements: Array.isArray(refreshResponse.data.achievements) 
              ? refreshResponse.data.achievements 
              : []
          }));
          
          setIsEditing(false);
          toast.success('Student details updated successfully');
        } catch (refreshError) {
          console.error('Error refreshing student details:', refreshError);
        }
      }, 300);
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
        {/* Header with Photo and Edit Button */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-8">
          <div className="flex flex-col md:flex-row items-center">
            {/* Student Photo */}
            <div className="mb-4 md:mb-0 md:mr-6">
              {student.photo_url ? (
                <img 
                  src={student.photo_url} 
                  alt={student.full_name} 
                  className="w-40 h-40 object-cover rounded-full border-4 border-blue-100 shadow-md"
                />
              ) : (
                <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center border-4 border-blue-100 shadow-md">
                  <span className="text-gray-500 text-xl font-semibold">
                    {student.full_name ? student.full_name.charAt(0).toUpperCase() : "N/A"}
                  </span>
                </div>
              )}
            </div>
            
            {/* Student Name and ID */}
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold text-gray-800">{student.full_name || 'N/A'}</h1>
              <p className="text-lg text-gray-600">Registration: {student.registration_number || 'N/A'}</p>
              <p className="text-md text-gray-500">Department: {student.Department || 'N/A'}</p>
              <p className="text-md text-gray-500">Class: {student.class || 'N/A'}</p>
            </div>
          </div>
          
          {/* Edit Button */}
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`mt-4 md:mt-0 px-6 py-2 rounded-lg ${
              isEditing ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600'
            } text-white font-medium transition-colors duration-200`}
          >
            {isEditing ? 'Cancel' : 'Edit Details'}
          </button>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-8">
            {/* Basic Information */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">Basic Information</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">ABC ID</label>
                  <p className="mt-1 text-gray-900 font-medium">{student.abc_id || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Gender</label>
                  <p className="mt-1 text-gray-900 font-medium">{student.gender || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Current Semester</label>
                  <p className="mt-1 text-gray-900 font-medium">{student.current_semester || 'N/A'}</p>
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
                    <p className="mt-1 text-gray-900 font-medium">{student.class_rank || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">Contact Information</h2>
              <div className="space-y-4">
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
                    <p className="mt-1 text-gray-900 font-medium">{student.Mobile_No || 'N/A'}</p>
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
                    <p className="mt-1 text-gray-900 font-medium">{student.Parent_No || 'N/A'}</p>
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
                    <p className="mt-1 text-gray-900 font-medium">{student.address || 'N/A'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Achievements */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">Achievements</h2>
              {isEditing ? (
                <div className="space-y-2">
                  {formData.achievements.map((achievement, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={achievement}
                        onChange={(e) => handleAchievementChange(index, e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Enter achievement"
                      />
                      <button
                        type="button"
                        onClick={() => removeAchievement(index)}
                        className="p-1 text-red-500 hover:text-red-700"
                        title="Remove achievement"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                      </button>
                    </div>
                  ))}
                  <button
                    type="button"
                    onClick={addAchievement}
                    className="mt-2 px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600"
                  >
                    Add Achievement
                  </button>
                </div>
              ) : (
                Array.isArray(student.achievements) && student.achievements.length > 0 ? (
                  <ul className="list-disc pl-5 space-y-1">
                    {student.achievements.map((achievement, index) => (
                      <li key={index} className="text-gray-900">{achievement}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-gray-500">No achievements recorded</p>
                )
              )}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-8">
            {/* Academic Performance */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">Academic Performance</h2>
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Current CGPA</h3>
                <p className="text-xl font-bold text-blue-700 mb-4">
                  {Array.isArray(student.previous_cgpa) && student.previous_cgpa.length > 0
                    ? student.previous_cgpa[student.previous_cgpa.length - 1]
                    : 'N/A'}
                </p>
                
                {/* Previous CGPA History */}
                <h3 className="text-lg font-medium text-gray-800 mb-2">CGPA History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg shadow-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border-b text-left">Semester</th>
                        <th className="py-2 px-4 border-b text-right">CGPA</th>
                        {isEditing && <th className="py-2 px-4 border-b"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(student.previous_cgpa) && student.previous_cgpa.length > 0 ? (
                        student.previous_cgpa.map((cgpa, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">Semester {index + 1}</td>
                            <td className="py-2 px-4 border-b text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.01"
                                  value={formData.previous_cgpa[index] || 0}
                                  onChange={(e) => handleCgpaChange(index, e.target.value)}
                                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              ) : (
                                <span className="font-medium">{cgpa}</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="py-4 px-4 text-center text-gray-500">No CGPA history available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
              
              {/* Previous Percentages */}
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-800 mb-2">Percentage History</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full bg-white rounded-lg shadow-sm">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="py-2 px-4 border-b text-left">Semester</th>
                        <th className="py-2 px-4 border-b text-right">Percentage</th>
                        {isEditing && <th className="py-2 px-4 border-b"></th>}
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(student.previous_percentages) && student.previous_percentages.length > 0 ? (
                        student.previous_percentages.map((percentage, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">Semester {index + 1}</td>
                            <td className="py-2 px-4 border-b text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={formData.previous_percentages[index] || 0}
                                  onChange={(e) => handlePercentageChange(index, e.target.value)}
                                  className="w-24 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                              ) : (
                                <span className="font-medium">{percentage}%</span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="2" className="py-4 px-4 text-center text-gray-500">No percentage history available</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
            
            {/* Attendance */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold text-blue-800 mb-4 border-b border-blue-200 pb-2">Attendance</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left">Month</th>
                      <th className="py-2 px-4 border-b text-right">Attendance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(student.attendanceData) && student.attendanceData.length > 0 ? (
                      student.attendanceData.map((record, index) => (
                        <tr key={index} className="hover:bg-gray-50">
                          <td className="py-2 px-4 border-b">{record.month || 'N/A'}</td>
                          <td className="py-2 px-4 border-b text-right">
                            {isEditing ? (
                              <div className="flex items-center justify-end">
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  value={formData.attendance[index]?.attendance || record.attendance || 0}
                                  onChange={(e) => handleAttendanceChange(index, e.target.value)}
                                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                />
                                <span className="ml-1">%</span>
                              </div>
                            ) : (
                              <span className="font-medium">
                                {record.attendance || 0}%
                              </span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="py-4 px-4 text-center text-gray-500">No attendance records available</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Save Changes Button */}
        {isEditing && (
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 font-medium transition-colors duration-200 shadow-md"
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