import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { BASE_URL } from '../../../main';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';

const AddTeacher = ({ onClose, department }) => {
  const [loading, setLoading] = useState(false);
  const authUser = useSelector((state) => state.user.authUser);
  const isSuperAdmin = authUser?.role === 'super_admin';

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    Mobile_No: '',
    department: isSuperAdmin ? '' : department,
    yearOfExperience: '',
    qualification: ''
  });

  const allowedDepartments = ["CSE", "ENTC", "ELE", "MECH", "CIVIL"];

  console.log('[AddTeacher] Initial Form Data:', formData);
  console.log('[AddTeacher] User Role:', authUser?.role);
  console.log('[AddTeacher] Department:', department);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    console.log(`[AddTeacher] Field ${name} updated:`, value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const requiredFields = [
        'full_name', 'email', 'Mobile_No', 'department',
        'yearOfExperience', 'qualification'
      ];

      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        console.error('[AddTeacher] Missing required fields:', missingFields);
        toast.error(`Please fill all required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        console.error('[AddTeacher] Invalid email format:', formData.email);
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }

      const phoneRegex = /^[0-9]{10}$/;
      const cleanPhone = formData.Mobile_No.replace(/\D/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        console.error('[AddTeacher] Invalid phone number format:', formData.Mobile_No);
        toast.error('Please enter a valid 10-digit phone number');
        setLoading(false);
        return;
      }

      const experience = parseInt(formData.yearOfExperience);
      if (isNaN(experience) || experience < 0) {
        console.error('[AddTeacher] Invalid experience value:', formData.yearOfExperience);
        toast.error('Please enter a valid number of years for experience');
        setLoading(false);
        return;
      }

      const submissionData = {
        ...formData,
        department: isSuperAdmin ? formData.department : department,
        yearOfExperience: experience,
        Mobile_No: cleanPhone
      };
      
      console.log('[AddTeacher] Submitting form data:', submissionData);

      const response = await axios.post(
        `${BASE_URL}/api/v1/teacher/add`,
        submissionData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[AddTeacher] Registration response:', response.data);
      
      if (response.data.success) {
        toast.success('Teacher registered successfully');
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to register teacher');
      }
    } catch (error) {
      console.error('[AddTeacher] Registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || 'Failed to register teacher');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Teacher</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name *</label>
              <input
                type="text"
                name="full_name"
                required
                value={formData.full_name}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Mobile Number *</label>
              <input
                type="tel"
                name="Mobile_No"
                required
                value={formData.Mobile_No}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="10-digit mobile number"
              />
            </div>

            {isSuperAdmin && (
              <div>
                <label className="block text-sm font-medium text-gray-700">Department *</label>
                <select
                  name="department"
                  required
                  value={formData.department}
                  onChange={handleChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                >
                  <option value="">Select Department</option>
                  {allowedDepartments.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Years of Experience *</label>
              <input
                type="number"
                name="yearOfExperience"
                required
                min="0"
                value={formData.yearOfExperience}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Qualification *</label>
            <textarea
              name="qualification"
              required
              value={formData.qualification}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="e.g., Ph.D. in Computer Science, M.Tech in Electronics"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 text-sm font-medium text-white bg-blue-500 rounded-md ${
                loading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-600'
              }`}
            >
              {loading ? 'Registering...' : 'Register Teacher'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddTeacher.propTypes = {
  onClose: PropTypes.func.isRequired,
  department: PropTypes.string.isRequired
};

export default AddTeacher;
