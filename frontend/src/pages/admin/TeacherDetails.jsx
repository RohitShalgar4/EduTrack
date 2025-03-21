import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../main';
import toast from 'react-hot-toast';
import { Camera, ArrowLeft, Save, Edit, X } from 'lucide-react';

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

  const getDepartmentFullName = (code) => {
    const departments = {
      'CSE': 'Computer Science and Engineering',
      'ENTC': 'Electronics and Telecommunication',
      'MECH': 'Mechanical Engineering',
      'CIVIL': 'Civil Engineering',
      'ELE': 'Electrical Engineering'
    };
    return departments[code] || code;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!teacher) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Teacher Not Found</h2>
          <p className="text-gray-600 mb-6">The teacher you're looking for doesn't exist or has been removed.</p>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center mx-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="mr-2" size={18} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Back to Teachers</span>
        </button>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Faculty Profile</h1>
              <div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    <Edit size={18} />
                    <span>Edit Profile</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(false)}
                    className="flex items-center space-x-2 bg-white text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <X size={18} />
                    <span>Cancel</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <form onSubmit={handleSubmit} className="p-8">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Left column - Photo */}
              <div className="md:w-1/3 flex flex-col items-center">
                <div className="relative group">
                  <div className={`w-48 h-48 rounded-full overflow-hidden border-4 ${isEditing ? 'border-indigo-400' : 'border-gray-200'} shadow-lg`}>
                    <img
                      src={formData.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name || 'Teacher')}&size=200&background=8B5CF6&color=fff`}
                      alt="Teacher profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name || 'Teacher')}&size=200&background=8B5CF6&color=fff`;
                      }}
                    />
                  </div>
                  {isEditing && (
                    <label className="absolute bottom-3 right-3 bg-indigo-600 p-3 rounded-full cursor-pointer hover:bg-indigo-700 shadow-md transition-all transform hover:scale-110">
                      <Camera size={24} className="text-white" />
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handlePhotoChange}
                      />
                    </label>
                  )}
                </div>
                
                {/* Department badge */}
                <div className="mt-6 bg-indigo-100 text-indigo-800 py-2 px-6 rounded-full font-medium text-center">
                  {getDepartmentFullName(formData.department) || 'Department Not Set'}
                </div>
                
                {/* Experience badge */}
                <div className="mt-4 flex items-center justify-center gap-2">
                  <div className="bg-amber-100 text-amber-800 py-1 px-4 rounded-full text-sm font-medium">
                    {formData.yearOfExperience} {formData.yearOfExperience === 1 ? 'Year' : 'Years'} Experience
                  </div>
                </div>
              </div>
              
              {/* Right column - Form fields */}
              <div className="md:w-2/3">
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="full_name"
                      value={formData.full_name}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isEditing 
                          ? 'border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' 
                          : 'border-gray-200 bg-gray-50'
                      } transition-colors`}
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isEditing 
                          ? 'border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' 
                          : 'border-gray-200 bg-gray-50'
                      } transition-colors`}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Department
                      </label>
                      <select
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          isEditing 
                            ? 'border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' 
                            : 'border-gray-200 bg-gray-50'
                        } transition-colors`}
                      >
                        <option value="">Select Department</option>
                        <option value="CSE">Computer Science and Engineering</option>
                        <option value="ENTC">Electronics and Telecommunication</option>
                        <option value="MECH">Mechanical Engineering</option>
                        <option value="CIVIL">Civil Engineering</option>
                        <option value="ELE">Electrical Engineering</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700">
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
                        className={`w-full px-4 py-3 rounded-lg border ${
                          isEditing 
                            ? 'border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' 
                            : 'border-gray-200 bg-gray-50'
                        } transition-colors`}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Qualification
                    </label>
                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleInputChange}
                      disabled={!isEditing}
                      className={`w-full px-4 py-3 rounded-lg border ${
                        isEditing 
                          ? 'border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' 
                          : 'border-gray-200 bg-gray-50'
                      } transition-colors`}
                    />
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`w-full flex items-center justify-center py-3 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg font-medium hover:from-indigo-700 hover:to-purple-700 transition-colors ${
                        saving ? 'opacity-70 cursor-not-allowed' : ''
                      }`}
                    >
                      {saving ? (
                        <>
                          <div className="animate-spin h-5 w-5 mr-3 border-2 border-white border-t-transparent rounded-full"></div>
                          Saving Changes...
                        </>
                      ) : (
                        <>
                          <Save size={20} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default TeacherDetails;