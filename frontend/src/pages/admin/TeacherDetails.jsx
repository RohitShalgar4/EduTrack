import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../main';
import toast from 'react-hot-toast';
import { Camera } from 'lucide-react';

const TeacherDetails = () => {
  const { teacherId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [teacher, setTeacher] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    department: '',
    qualification: '',
    yearOfExperience: 0,
    photo_url: ''
  });

  useEffect(() => {
    const fetchTeacherDetails = async () => {
      try {
        // Try direct fetch first as it's more reliable
        const directEndpoint = `${BASE_URL}/api/v1/admin/teacher/${teacherId}`;
        console.log("Fetching teacher details directly:", directEndpoint);
        
        try {
          const directResponse = await axios.get(directEndpoint, {
            withCredentials: true
          });
          
          console.log("Direct teacher API response:", directResponse.data);
          
          if (directResponse.data.success && directResponse.data.teacher) {
            const teacherData = directResponse.data.teacher;
            console.log("Full teacher data:", teacherData);
            
            setTeacher(teacherData);
            setFormData({
              full_name: teacherData.full_name || '',
              email: teacherData.email || '',
              department: teacherData.department || '',
              qualification: teacherData.qualification || '',
              yearOfExperience: Number(teacherData.yearOfExperience) || 0,
              photo_url: teacherData.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherData.full_name || 'Teacher')}`
            });
            
            console.log("Form data set from direct fetch:", {
              full_name: teacherData.full_name,
              email: teacherData.email,
              department: teacherData.department,
              qualification: teacherData.qualification,
              yearOfExperience: Number(teacherData.yearOfExperience),
              photo_url: teacherData.photo_url
            });
            
            setLoading(false);
            return;
          }
        } catch (directError) {
          console.error("Error in direct fetch, falling back to department list:", directError);
        }
        
        // Fall back to department list if direct fetch fails
        const endpoint = `${BASE_URL}/api/v1/admin/department/teachers`;
        console.log("Fetching from department teachers:", endpoint);
        
        const response = await axios.get(endpoint, {
          withCredentials: true
        });

        console.log("Department teachers API response:", response.data);

        if (response.data.success && response.data.teachers) {
          // Find the specific teacher by ID
          const teacherData = response.data.teachers.find(t => t._id === teacherId);
          
          if (!teacherData) {
            console.log("Teacher not found in any source");
            toast.error('Teacher not found');
            setLoading(false);
            return;
          }

          console.log("Teacher found in department data:", teacherData);
          setTeacher(teacherData);
          
          // Convert yearOfExperience to number explicitly
          setFormData({
            full_name: teacherData.full_name || '',
            email: teacherData.email || '',
            department: teacherData.department || '',
            qualification: teacherData.qualification || '',
            yearOfExperience: Number(teacherData.yearOfExperience) || 0,
            photo_url: teacherData.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(teacherData.full_name || 'Teacher')}`
          });
          
          console.log("Form data set from department list:", {
            full_name: teacherData.full_name,
            email: teacherData.email,
            department: teacherData.department,
            qualification: teacherData.qualification,
            yearOfExperience: Number(teacherData.yearOfExperience),
            photo_url: teacherData.photo_url
          });
        } else {
          toast.error(response.data.message || 'Failed to fetch teacher details');
        }
      } catch (error) {
        console.error('Error fetching teacher details:', error);
        toast.error(error.response?.data?.message || 'Error fetching teacher details');
      } finally {
        setLoading(false);
      }
    };

    if (teacherId) {
      fetchTeacherDetails();
    }
  }, [teacherId]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} with value:`, value);
    
    setFormData(prev => {
      const updatedValue = name === 'yearOfExperience' ? Number(value) : value;
      console.log(`Setting ${name} to:`, updatedValue);
      
      return {
        ...prev,
        [name]: updatedValue
      };
    });
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      setSaving(true);
      const response = await axios.post(`${BASE_URL}/api/v1/admin/department/teachers/${teacherId}/photo`, formData, {
        withCredentials: true,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (response.data.success) {
        setFormData(prev => ({
          ...prev,
          photo_url: response.data.photo_url
        }));
        toast.success('Photo updated successfully');
      }
    } catch (error) {
      console.error('Error updating photo:', error);
      toast.error(error.response?.data?.message || 'Error updating photo');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Create data with yearOfExperience as number
    const submitData = {
      ...formData,
      yearOfExperience: Number(formData.yearOfExperience)
    };
    
    console.log("Submitting data:", submitData);
    
    try {
      setSaving(true);
      const endpoint = `${BASE_URL}/api/v1/admin/department/teachers/${teacherId}`;
      console.log("Updating teacher at:", endpoint);
      
      const response = await axios.put(
        endpoint,
        submitData,
        {
          withCredentials: true
        }
      );
      
      console.log("Update response:", response.data);
      
      if (response.data.success) {
        setTeacher(response.data.teacher);
        setIsEditing(false);
        toast.success('Teacher details updated successfully');
      } else {
        toast.error(response.data.message || 'Failed to update teacher');
      }
    } catch (error) {
      console.error('Error updating teacher details:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.message || 'Error updating teacher details');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">Teacher not found</h2>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-md">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">Teacher Details</h1>
            <div className="space-x-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Edit Details
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Debug Info */}
          <div className="bg-gray-100 p-3 mb-6 rounded text-xs">
            <p>Teacher data from DB: ID: {teacher._id}</p>
            <p>Full Name: {teacher.full_name}</p>
            <p>Email: {teacher.email}</p>
            <p>Department: {teacher.department}</p>
            <p>Qualification: {teacher.qualification}</p>
            <p>Years of Experience: {teacher.yearOfExperience}</p>
            <p>Photo URL: {teacher.photo_url}</p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <div className="relative w-32 h-32 mx-auto mb-4">
                <img
                  src={formData.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name || 'Teacher')}`}
                  alt="Teacher profile"
                  className="w-full h-full rounded-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name || 'Teacher')}`;
                  }}
                />
                {isEditing && (
                  <label className="absolute bottom-0 right-0 bg-blue-500 p-2 rounded-full cursor-pointer hover:bg-blue-600">
                    <Camera size={20} className="text-white" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handlePhotoChange}
                    />
                  </label>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  <option value="CSE">Computer Science and Engineering</option>
                  <option value="ENTC">Electronics and Telecommunication</option>
                  <option value="MECH">Mechanical Engineering</option>
                  <option value="CIVIL">Civil Engineering</option>
                  <option value="ELE">Electrical Engineering</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Qualification
                </label>
                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="yearOfExperience"
                  value={formData.yearOfExperience}
                  onChange={handleInputChange}
                  min="0"
                  step="1"
                  disabled={!isEditing}
                  className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-500 mt-1">Current value in database: {teacher.yearOfExperience}</p>
              </div>
            </div>

            {isEditing && (
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className={`px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 ${
                    saving ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails; 