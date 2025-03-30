import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { BASE_URL } from '../../../main';
import toast from 'react-hot-toast';
import { Upload } from 'lucide-react';
import Papa from 'papaparse';

const AddStudent = ({ onClose, department }) => {
  console.log('[AddStudent] Component mounted with department:', department);
  
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    registration_number: '',
    current_semester: 1,
    gender: '',
    Mobile_No: '',
    Parent_No: '',
    address: '',
    abc_id: '',
    class: '',
    Department: department,
    password: 'Student@123', // Default password
    previous_cgpa: [0],
    previous_percentages: [0],
    class_rank: 0,
    attendance: [],
    semesterProgress: [],
    achievements: [],
    photo_url: `https://ui-avatars.com/api/?name=Student&background=random`,
    isFirstLogin: true
  });

  console.log('[AddStudent] Initial Form Data:', formData);

  const handleChange = (e) => {
    const { name, value } = e.target;
    console.log(`[AddStudent] Field ${name} changing from ${formData[name]} to ${value}`);
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    console.log('[AddStudent] Form submission started');
    console.log('[AddStudent] Current form data:', formData);

    try {
      // Validate required fields
      const requiredFields = [
        'full_name', 'email', 'registration_number', 'current_semester',
        'gender', 'Mobile_No', 'Parent_No', 'address', 'abc_id', 'class'
      ];

      console.log('[AddStudent] Validating required fields:', requiredFields);
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        console.log('[AddStudent] Missing required fields:', missingFields);
        toast.error(`Please fill in all required fields: ${missingFields.join(', ')}`);
        setLoading(false);
        return;
      }

      // Validate email format
      console.log('[AddStudent] Validating email format');
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        console.log('[AddStudent] Invalid email format:', formData.email);
        toast.error('Please enter a valid email address');
        setLoading(false);
        return;
      }

      // Validate phone numbers
      console.log('[AddStudent] Validating phone numbers');
      console.log('[AddStudent] Mobile number:', formData.Mobile_No);
      console.log('[AddStudent] Parent number:', formData.Parent_No);
      
      // Remove any spaces or special characters from phone numbers
      const cleanMobileNo = formData.Mobile_No.replace(/\D/g, '');
      const cleanParentNo = formData.Parent_No.replace(/\D/g, '');
      
      console.log('[AddStudent] Cleaned mobile number:', cleanMobileNo);
      console.log('[AddStudent] Cleaned parent number:', cleanParentNo);
      
      const phoneRegex = /^[0-9]{10}$/;
      if (!phoneRegex.test(cleanMobileNo)) {
        console.log('[AddStudent] Invalid mobile number format:', cleanMobileNo);
        toast.error('Please enter a valid 10-digit mobile number');
        setLoading(false);
        return;
      }
      if (!phoneRegex.test(cleanParentNo)) {
        console.log('[AddStudent] Invalid parent number format:', cleanParentNo);
        toast.error('Please enter a valid 10-digit parent number');
        setLoading(false);
        return;
      }

      // Prepare submission data
      console.log('[AddStudent] Preparing submission data');
      const submissionData = {
        ...formData,
        current_semester: parseInt(formData.current_semester),
        Mobile_No: cleanMobileNo,
        Parent_No: cleanParentNo,
        Department: department,
        previous_cgpa: [0],
        previous_percentages: [0],
        class_rank: 0,
        attendance: [],
        semesterProgress: [],
        achievements: [],
        photo_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(formData.full_name)}&background=random`,
        isFirstLogin: true
      };

      console.log('[AddStudent] Final submission data:', submissionData);

      console.log('[AddStudent] Making API request to:', `${BASE_URL}/api/v1/user/register`);
      const response = await axios.post(
        `${BASE_URL}/api/v1/user/register`,
        submissionData,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('[AddStudent] API Response:', response.data);
      
      if (response.data.success) {
        console.log('[AddStudent] Registration successful');
        toast.success('Student registered successfully');
        onClose();
      } else {
        console.log('[AddStudent] Registration failed:', response.data.message);
        toast.error(response.data.message || 'Failed to register student');
      }
    } catch (error) {
      console.error('[AddStudent] Registration error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      toast.error(error.response?.data?.message || 'Failed to register student');
    } finally {
      setLoading(false);
      console.log('[AddStudent] Form submission completed');
    }
  };

  const handleCSVImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setImporting(true);
    try {
      // Parse CSV file
      Papa.parse(file, {
        complete: async (results) => {
          try {
            console.log('CSV Parse Results:', results);
            console.log('Department from props:', department);
            
            if (!results.data || results.data.length < 2) {
              toast.error('CSV file is empty or invalid');
              return;
            }

            // Get headers from first row and clean them
            const headers = results.data[0].map(header => header.trim());
            console.log('CSV Headers:', headers);

            // Validate required headers
            const requiredHeaders = [
              'full_name', 'email', 'registration_number', 'Department',
              'gender', 'Mobile_No', 'Parent_No', 'address', 'abc_id', 'class'
            ];

            const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
            if (missingHeaders.length > 0) {
              toast.error(`Missing required columns: ${missingHeaders.join(', ')}`);
              return;
            }

            // Convert remaining rows to objects and add department
            const students = results.data.slice(1).map(row => {
              const student = {};
              headers.forEach((header, index) => {
                student[header] = row[index]?.trim() || '';
              });
              return student;
            });

            console.log('Processed Students with Department:', students);

            // Send to backend
            const response = await axios.post(
              `${BASE_URL}/api/v1/admin/import-students`,
              students,
              {
                withCredentials: true,
                headers: {
                  'Content-Type': 'application/json'
                }
              }
            );

            const { results: importResults } = response.data;
            
            // Show results
            if (importResults.success.length > 0) {
              toast.success(`Successfully imported ${importResults.success.length} students`);
            }
            if (importResults.errors.length > 0) {
              toast.error(`${importResults.errors.length} students failed to import`);
              console.error('Import errors:', importResults.errors);
            }

            onClose();
          } catch (error) {
            console.error('Error processing CSV:', error);
            toast.error(error.response?.data?.message || 'Error importing students');
          } finally {
            setImporting(false);
          }
        },
        error: (error) => {
          console.error('Error parsing CSV:', error);
          toast.error('Error parsing CSV file');
          setImporting(false);
        },
        header: false, // We'll handle headers manually
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        transform: (value) => value.trim()
      });
    } catch (error) {
      console.error('Error handling CSV file:', error);
      toast.error('Error processing CSV file');
      setImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Add New Student</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* CSV Import Section */}
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium text-blue-800 mb-2">Import Students from CSV</h3>
          <p className="text-sm text-gray-600 mb-4">
            Upload a CSV file with student details. The CSV should include the following columns:
            full_name, email, registration_number, current_semester, gender, Mobile_No, Parent_No, address, abc_id, class
          </p>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer">
              <Upload className="w-4 h-4" />
              {importing ? 'Importing...' : 'Import CSV'}
              <input
                type="file"
                accept=".csv"
                onChange={handleCSVImport}
                className="hidden"
                disabled={importing}
              />
            </label>
            {importing && (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
            )}
          </div>
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
              <label className="block text-sm font-medium text-gray-700">Registration Number *</label>
              <input
                type="text"
                name="registration_number"
                required
                value={formData.registration_number}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Current Semester *</label>
              <select
                name="current_semester"
                required
                value={formData.current_semester}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(sem => (
                  <option key={sem} value={sem}>{sem}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Gender *</label>
              <select
                name="gender"
                required
                value={formData.gender}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Parent&apos;s Number *</label>
              <input
                type="tel"
                name="Parent_No"
                required
                value={formData.Parent_No}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">ABC ID *</label>
              <input
                type="text"
                name="abc_id"
                required
                value={formData.abc_id}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Class *</label>
              <input
                type="text"
                name="class"
                required
                value={formData.class}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700">Address *</label>
            <textarea
              name="address"
              required
              value={formData.address}
              onChange={handleChange}
              rows="3"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
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
              {loading ? 'Registering...' : 'Register Student'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

AddStudent.propTypes = {
  onClose: PropTypes.func.isRequired,
  department: PropTypes.string.isRequired
};

export default AddStudent;
