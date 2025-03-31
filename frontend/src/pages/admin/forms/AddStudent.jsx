import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { BASE_URL } from '../../../main';
import toast from 'react-hot-toast';
import Papa from 'papaparse';
import { useSelector } from 'react-redux';

const AddStudent = ({ onClose, department }) => {
  console.log('[AddStudent] Component mounted with department:', department);
  
  const [loading, setLoading] = useState(false);
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

  const authUser = useSelector((state) => state.user.authUser);
  const isSuperAdmin = authUser?.role === 'super_admin';

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

  const handleCSVUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    console.log('[AddStudent] Starting CSV upload process');
    console.log('[AddStudent] File details:', {
      name: file.name,
      size: file.size,
      type: file.type
    });

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          console.log('[AddStudent] File read successfully, parsing CSV');
          const result = Papa.parse(e.target.result, {
            header: true,
            skipEmptyLines: true
          });

          console.log('[AddStudent] CSV Parse Result:', {
            hasErrors: result.errors.length > 0,
            errors: result.errors,
            meta: result.meta,
            dataLength: result.data.length
          });

          const csvData = result.data;
          console.log('[AddStudent] First row of CSV:', csvData[0]);

          // Validate CSV data
          if (!csvData || csvData.length === 0) {
            console.error('[AddStudent] CSV file is empty');
            toast.error('CSV file is empty');
            return;
          }

          // Check required headers
          const requiredHeaders = [
            'full_name', 
            'email', 
            'registration_number',
            'abc_id',
            'address',
            'Mobile_No',
            'Parent_No',
            'gender'
          ];
          const headers = Object.keys(csvData[0]);
          console.log('[AddStudent] CSV Headers:', headers);
          console.log('[AddStudent] Required Headers:', requiredHeaders);

          const missingHeaders = requiredHeaders.filter(header => !headers.includes(header));
          console.log('[AddStudent] Missing Headers:', missingHeaders);

          if (missingHeaders.length > 0) {
            console.error('[AddStudent] Missing required headers:', missingHeaders);
            toast.error(`Missing required headers: ${missingHeaders.join(', ')}`);
            return;
          }

          // Map and clean the data
          const mappedData = csvData.map(row => {
            console.log('[AddStudent] Processing row:', row);

            // Clean phone numbers and handle scientific notation
            const cleanMobileNo = row.Mobile_No.toString().replace(/\D/g, '');
            const cleanParentNo = row.Parent_No.toString().replace(/[eE].*$/, '').replace(/\D/g, '');

            console.log('[AddStudent] Phone numbers:', {
              original: {
                mobile: row.Mobile_No,
                parent: row.Parent_No
              },
              cleaned: {
                mobile: cleanMobileNo,
                parent: cleanParentNo
              }
            });

            // Validate phone numbers
            if (cleanMobileNo.length !== 10 || cleanParentNo.length !== 10) {
              throw new Error(`Invalid phone number format for student ${row.full_name}. Phone numbers must be 10 digits.`);
            }

            // Map semester based on class/year
            let current_semester = 1; // Default value
            if (row.current_semester) {
              const semesterMap = {
                'B.Tech 1st Year': 1,
                'B.Tech 2nd Year': 3,
                'B.Tech 3rd Year': 5,
                'B.Tech 4th Year': 7
              };
              current_semester = semesterMap[row.current_semester] || 1;
            }

            // Map the data to match backend expectations
            const mappedRow = {
              full_name: row.full_name,
              email: row.email,
              registration_number: row.registration_number,
              abc_id: row.abc_id,
              address: row.address,
              Mobile_No: cleanMobileNo,
              Parent_No: cleanParentNo,
              gender: row.gender,
              Department: row.Department || department, // Use provided department or default to prop
              current_semester: current_semester,
              class: row.class || row.current_semester || 'B.Tech 1st Year' // Use class or current_semester as fallback
            };

            console.log('[AddStudent] Mapped row:', mappedRow);
            return mappedRow;
          });

          console.log('[AddStudent] Final mapped data:', mappedData);

          // For department admin, remove department field from CSV data
          if (!isSuperAdmin) {
            console.log('[AddStudent] Department Admin detected, removing department field from CSV data');
            mappedData.forEach(row => {
              delete row.Department;
            });
          }

          console.log('[AddStudent] Sending CSV data to backend:', {
            url: `${BASE_URL}/api/v1/admin/import-students`,
            data: mappedData,
            isSuperAdmin,
            user: authUser
          });

          // Send to backend
          const response = await axios.post(
            `${BASE_URL}/api/v1/admin/import-students`,
            { 
              csvData: mappedData,
              user: {
                role: authUser.role,
                department: authUser.department
              }
            },
            {
              withCredentials: true,
              headers: {
                'Content-Type': 'application/json'
              }
            }
          );

          console.log('[AddStudent] Backend Response:', response.data);

          if (response.data.success) {
            console.log('[AddStudent] Import successful:', response.data.message);
            if (response.data.errors && response.data.errors.length > 0) {
              console.error('[AddStudent] Import errors:', response.data.errors);
              toast.error(`Import completed with errors: ${response.data.errors.join(', ')}`);
            } else {
              toast.success(response.data.message);
            }
            onClose();
          } else {
            console.error('[AddStudent] Import failed:', response.data.message);
            toast.error(response.data.message || 'Failed to import students');
          }
        } catch (error) {
          console.error('[AddStudent] Error processing CSV:', {
            message: error.message,
            response: error.response?.data,
            status: error.response?.status,
            headers: error.response?.headers,
            config: error.config
          });
          toast.error(error.response?.data?.message || error.message || 'Error processing CSV file');
        }
      };
      reader.readAsText(file);
    } catch (error) {
      console.error('[AddStudent] Error reading file:', error);
      toast.error('Error reading file');
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

        {/* CSV Upload Section */}
        <div className="mt-4">
          <h3 className="text-lg font-medium text-gray-900 mb-2">CSV Import</h3>
          <p className="text-sm text-gray-600 mb-4">
            Import multiple students at once using a CSV file. The CSV should have the following headers:
          </p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Required Headers:</p>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>full_name</li>
              <li>email</li>
              <li>registration_number</li>
              <li>abc_id</li>
              <li>address</li>
              <li>Mobile_No</li>
              <li>Parent_No</li>
              <li>gender</li>
              {authUser?.role === 'super_admin' && (
                <>
                  <li>department (optional)</li>
                  <li>current_semester (optional, defaults to 1)</li>
                </>
              )}
            </ul>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm font-medium text-gray-700 mb-2">Sample CSV Format:</p>
            <pre className="text-xs text-gray-600 whitespace-pre-wrap">
              full_name,email,registration_number,abc_id,address,Mobile_No,Parent_No,gender{department ? ',department,current_semester' : ''}
              John Doe,john@example.com,REG123,ABC123,123 Main St,9876543210,9876543211,Male{department ? ',CSE,1' : ''}
            </pre>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload CSV File
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleCSVUpload}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-md file:border-0
                file:text-sm file:font-medium
                file:bg-blue-50 file:text-blue-700
                hover:file:bg-blue-100"
            />
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
