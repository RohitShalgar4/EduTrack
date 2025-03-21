import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { BASE_URL } from '../../main';
import toast from 'react-hot-toast';
import { Camera, ArrowLeft, Save, Edit, X, Shield, Phone, Mail, Building } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { updateUser } from '../../redux/features/userSlice';

const AdminDetails = () => {
  const { adminId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [admin, setAdmin] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const userRole = useSelector((state) => state.user.authUser?.role);
  const authUser = useSelector((state) => state.user.authUser);

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: '',
    department: '',
    phone_number: '',
    photo_url: ''
  });

  useEffect(() => {
    const fetchAdminDetails = async () => {
      try {
        // First check if user is authenticated and has super_admin role
        if (userRole !== 'super_admin') {
          toast.error('You do not have permission to access this page');
          navigate('/dashboard');
          return;
        }

        const response = await axios.get(`${BASE_URL}/api/v1/admin/admin/${adminId}`, {
          withCredentials: true
        });
        
        const adminData = response.data;
        setAdmin(adminData);
        
        setFormData({
          full_name: adminData.full_name || '',
          email: adminData.email || '',
          role: adminData.role || '',
          department: adminData.department || '',
          phone_number: adminData.phone_number || '',
          photo_url: adminData.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(adminData.full_name || 'Admin')}&size=200&background=6366F1&color=fff`
        });
      } catch (error) {
        console.error('Error fetching admin details:', error);
        if (error.response?.status === 401) {
          toast.error('Please login to continue');
          navigate('/login');
        } else {
          toast.error(error.response?.data?.message || 'Error fetching admin details');
        }
      } finally {
        setLoading(false);
      }
    };

    if (adminId) {
      fetchAdminDetails();
    }
  }, [adminId, navigate, userRole]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      setSaving(true);
      const response = await axios.post(`${BASE_URL}/api/v1/admin/${adminId}/photo`, formData, {
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
    
    try {
      setSaving(true);
      const response = await axios.put(
        `${BASE_URL}/api/v1/admin/admin/${adminId}`,
        formData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      setAdmin(response.data);
      setIsEditing(false);

      // If the updated admin is the currently logged-in user, update Redux state
      if (authUser && authUser._id === adminId) {
        dispatch(updateUser({
          ...authUser,
          ...response.data
        }));
      }

      // Refresh the page data
      const refreshResponse = await axios.get(`${BASE_URL}/api/v1/admin/admin/${adminId}`, {
        withCredentials: true
      });
      
      setAdmin(refreshResponse.data);
      setFormData({
        full_name: refreshResponse.data.full_name || '',
        email: refreshResponse.data.email || '',
        role: refreshResponse.data.role || '',
        department: refreshResponse.data.department || '',
        phone_number: refreshResponse.data.phone_number || '',
        photo_url: refreshResponse.data.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(refreshResponse.data.full_name || 'Admin')}&size=200&background=6366F1&color=fff`
      });

      toast.success('Admin details updated successfully');
    } catch (error) {
      console.error('Error updating admin details:', error);
      toast.error(error.response?.data?.message || 'Error updating admin details');
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
    return departments[code] || 'Not Assigned';
  };

  const getRoleBadgeStyle = (role) => {
    return role === 'super_admin' 
      ? 'bg-red-100 text-red-800' 
      : 'bg-blue-100 text-blue-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-indigo-600"></div>
      </div>
    );
  }

  if (!admin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Admin Not Found</h2>
          <p className="text-gray-600 mb-6">The administrator you're looking for doesn't exist or has been removed.</p>
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

  // Prevent non-super_admin users from viewing this page
  if (userRole !== 'super_admin') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-xl shadow-lg max-w-md">
          <div className="text-red-500 text-6xl mb-4">🔒</div>
          <h2 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You do not have permission to view this page. Only Super Admins can access administrator details.</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center justify-center mx-auto px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            <ArrowLeft className="mr-2" size={18} />
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-12 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-6"
        >
          <ArrowLeft size={20} className="mr-2" />
          <span>Back to Administrators</span>
        </button>
        
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header with gradient background */}
          <div className="bg-gradient-to-r from-gray-800 to-indigo-900 px-8 py-6 text-white">
            <div className="flex justify-between items-center">
              <h1 className="text-3xl font-bold">Administrator Profile</h1>
              <div>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center space-x-2 bg-white text-indigo-900 px-4 py-2 rounded-lg hover:bg-gray-100 transition-colors"
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
              {/* Left column - Photo and badges */}
              <div className="md:w-1/3 flex flex-col items-center">
                <div className="relative group">
                  <div className={`w-48 h-48 rounded-full overflow-hidden border-4 ${isEditing ? 'border-indigo-400' : 'border-gray-200'} shadow-lg`}>
                    <img
                      src={formData.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name || 'Admin')}&size=200&background=6366F1&color=fff`}
                      alt="Admin profile"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name || 'Admin')}&size=200&background=6366F1&color=fff`;
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
                
                {/* Role badge */}
                <div className={`mt-6 py-2 px-6 rounded-full font-medium text-center flex items-center ${getRoleBadgeStyle(formData.role)}`}>
                  <Shield size={18} className="mr-2" />
                  {formData.role === 'super_admin' ? 'Super Administrator' : 'Department Administrator'}
                </div>
                
                {/* Department badge - only show for department admins */}
                {formData.role === 'department_admin' && formData.department && (
                  <div className="mt-4 bg-indigo-100 text-indigo-800 py-2 px-6 rounded-full font-medium text-center flex items-center">
                    <Building size={18} className="mr-2" />
                    {getDepartmentFullName(formData.department)}
                  </div>
                )}
                
                {/* Contact information cards */}
                <div className="mt-6 w-full space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center text-gray-700">
                      <Mail size={18} className="mr-3 text-indigo-600" />
                      <div>
                        <p className="text-xs text-gray-500">Email Address</p>
                        <p className="font-medium break-all">{formData.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center text-gray-700">
                      <Phone size={18} className="mr-3 text-indigo-600" />
                      <div>
                        <p className="text-xs text-gray-500">Phone Number</p>
                        <p className="font-medium">{formData.phone_number}</p>
                      </div>
                    </div>
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

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={formData.phone_number}
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
                        Role
                      </label>
                      <select
                        name="role"
                        value={formData.role}
                        onChange={handleInputChange}
                        disabled={!isEditing}
                        className={`w-full px-4 py-3 rounded-lg border ${
                          isEditing 
                            ? 'border-indigo-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200' 
                            : 'border-gray-200 bg-gray-50'
                        } transition-colors`}
                      >
                        <option value="">Select Role</option>
                        <option value="super_admin">Super Administrator</option>
                        <option value="department_admin">Department Administrator</option>
                      </select>
                    </div>

                    {/* Show department dropdown only if role is department_admin */}
                    {(formData.role === 'department_admin' || isEditing) && (
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Department
                        </label>
                        <select
                          name="department"
                          value={formData.department}
                          onChange={handleInputChange}
                          disabled={!isEditing || formData.role !== 'department_admin'}
                          className={`w-full px-4 py-3 rounded-lg border ${
                            isEditing && formData.role === 'department_admin'
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
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="mt-8">
                    <button
                      type="submit"
                      disabled={saving}
                      className={`w-full flex items-center justify-center py-3 px-6 bg-gradient-to-r from-gray-800 to-indigo-900 text-white rounded-lg font-medium hover:from-gray-900 hover:to-indigo-950 transition-colors ${
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

export default AdminDetails;