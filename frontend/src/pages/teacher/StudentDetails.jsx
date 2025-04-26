import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { BASE_URL } from '../../main';
import { useSelector } from 'react-redux';
import { Plus, Trash2, Upload } from 'lucide-react';

const StudentDetails = () => {
  const { studentId } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [newAttendance, setNewAttendance] = useState({
    semester: '',
    average_attendance: ''
  });
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
    achievements: [],
    current_semester: '',
    semesterProgress: []
  });
  const [isUploading, setIsUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

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
        achievements: achievementsArray,
        current_semester: studentData.current_semester ? parseInt(studentData.current_semester) : '',
        semesterProgress: studentData.semesterProgress || []
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
      const endpoint = authUser.role === 'department_admin' || authUser.role === 'super_admin'
        ? `${BASE_URL}/api/v1/admin/student/${studentId}`
        : `${BASE_URL}/api/v1/teacher/student/${studentId}`;

      // Format the semester history data
      const currentSemester = parseInt(formData.current_semester) || 0;
      const previousCgpa = Array.isArray(formData.previous_cgpa) 
        ? formData.previous_cgpa.slice(0, currentSemester - 1).map(cgpa => parseFloat(cgpa) || 0)
        : [];
      
      const previousPercentages = Array.isArray(formData.previous_percentages)
        ? formData.previous_percentages.slice(0, currentSemester - 1).map(percentage => parseFloat(percentage) || 0)
        : [];

      // Create semester progress data with the correct structure for MongoDB
      const semesterProgress = previousPercentages.map((percentage, index) => ({
        semester: index + 1,
        percentage: parseFloat(percentage) || 0
      }));

      // Create a complete payload with all fields matching the backend model
      const payload = {
        Mobile_No: formData.Mobile_No || '',
        Parent_No: formData.Parent_No || '',
        previous_cgpa: previousCgpa,
        previous_percentages: previousPercentages,
        class_rank: parseInt(formData.class_rank) || 0,
        attendance: Array.isArray(formData.attendance) ? formData.attendance : [],
        address: formData.address || '',
        class: formData.class || '',
        achievements: Array.isArray(formData.achievements) 
          ? formData.achievements
              .filter(achievement => achievement && achievement.trim() !== '')
              .map(achievement => achievement.trim())
          : [],
        current_semester: currentSemester,
        semesterProgress: semesterProgress
      };

      console.log('Submitting payload:', payload);

      await axios.put(
        endpoint,
        payload,
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );
      
      await fetchStudentDetails();
      setIsEditing(false);
      toast.success('Student details updated successfully');
    } catch (error) {
      console.error('Error updating student details:', error);
      toast.error(error.response?.data?.message || 'Error updating student details');
    }
  };

  // Modify getSemesterOptions to show semesters up to current semester minus 1
  const getSemesterOptions = () => {
    const semesters = [];
    const currentSem = parseInt(formData.current_semester) || 0;
    // Only show semesters up to current semester minus 1
    for (let sem = 1; sem < currentSem; sem++) {
      // Check if attendance already exists for this semester
      const semesterExists = formData.attendance.some(record => record.semester === sem);
      if (!semesterExists) {
        semesters.push({ value: sem, label: `Semester ${sem}` });
      }
    }
    return semesters;
  };

  // Modify handleAddAttendance to handle semester format
  const handleAddAttendance = () => {
    if (!newAttendance.semester || !newAttendance.average_attendance) {
      toast.error('Please fill in both semester and attendance percentage');
      return;
    }

    if (parseFloat(newAttendance.average_attendance) < 0 || parseFloat(newAttendance.average_attendance) > 100) {
      toast.error('Attendance percentage must be between 0 and 100');
      return;
    }

    const semester = parseInt(newAttendance.semester);
    if (semester >= parseInt(formData.current_semester)) {
      toast.error('Cannot add attendance for current or future semesters');
      return;
    }

    // Check if semester already exists
    const semesterExists = formData.attendance.some(record => record.semester === semester);

    if (semesterExists) {
      toast.error('Attendance for this semester already exists');
      return;
    }

    const updatedAttendance = [...formData.attendance, {
      semester: semester,
      average_attendance: parseFloat(newAttendance.average_attendance)
    }];

    // Sort attendance records by semester
    updatedAttendance.sort((a, b) => a.semester - b.semester);

    setFormData(prev => ({
      ...prev,
      attendance: updatedAttendance
    }));

    setNewAttendance({ semester: '', average_attendance: '' });
    setShowAttendanceModal(false);
    toast.success('Attendance added successfully');
  };

  const handleRemoveAttendance = (index) => {
    const updatedAttendance = [...formData.attendance];
    updatedAttendance.splice(index, 1);
    setFormData(prev => ({
      ...prev,
      attendance: updatedAttendance
    }));
    toast.success('Attendance removed successfully');
  };

  // Modify handleSemesterChange to handle numbers properly
  const handleSemesterChange = (newSemester) => {
    const currentSemester = parseInt(newSemester);
    const currentCgpaLength = formData.previous_cgpa.length;
    const currentPercentageLength = formData.previous_percentages.length;

    // Adjust CGPA history
    let updatedCgpa = [...formData.previous_cgpa];
    if (currentCgpaLength < currentSemester - 1) {
      // Add empty entries for missing semesters
      while (updatedCgpa.length < currentSemester - 1) {
        updatedCgpa.push(0);
      }
    } else if (currentCgpaLength > currentSemester - 1) {
      // Remove extra entries
      updatedCgpa = updatedCgpa.slice(0, currentSemester - 1);
    }

    // Adjust percentage history
    let updatedPercentages = [...formData.previous_percentages];
    if (currentPercentageLength < currentSemester - 1) {
      // Add empty entries for missing semesters
      while (updatedPercentages.length < currentSemester - 1) {
        updatedPercentages.push(0);
      }
    } else if (currentPercentageLength > currentSemester - 1) {
      // Remove extra entries
      updatedPercentages = updatedPercentages.slice(0, currentSemester - 1);
    }

    setFormData(prev => ({
      ...prev,
      current_semester: currentSemester,
      previous_cgpa: updatedCgpa,
      previous_percentages: updatedPercentages
    }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      e.target.value = ''; // Clear the input
      return;
    }

    // Check file size (10MB limit)
    const maxSize = 10 * 1024 * 1024; // 10MB in bytes
    if (file.size > maxSize) {
      toast.error('File size should be less than 10MB');
      e.target.value = ''; // Clear the input
      return;
    }

    // Check image dimensions
    const img = new Image();
    img.onload = function() {
      const maxDimension = 2000; // Maximum dimension in pixels
      if (this.width > maxDimension || this.height > maxDimension) {
        toast.error('Image dimensions should be less than 2000x2000 pixels');
        e.target.value = ''; // Clear the input
        return;
      }
      setSelectedFile(file);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleAvatarUpload = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first');
      return;
    }

    setIsUploading(true);
    try {
      // First, get the Cloudinary configuration from the backend
      const configResponse = await axios.get(`${BASE_URL}/api/v1/config/cloudinary`, {
        withCredentials: true
      });

      console.log('Cloudinary config response:', configResponse.data); // Debug log

      if (!configResponse.data) {
        throw new Error('No configuration data received from server');
      }

      const { cloudName, uploadPreset } = configResponse.data;

      if (!cloudName || !uploadPreset) {
        console.error('Missing configuration:', { cloudName, uploadPreset });
        throw new Error(`Invalid Cloudinary configuration received. Cloud Name: ${cloudName}, Upload Preset: ${uploadPreset}`);
      }

      // Create form data
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('upload_preset', uploadPreset);
      formData.append('cloud_name', cloudName);
      formData.append('resource_type', 'image');
      formData.append('folder', 'student_avatars');

      console.log('Uploading to Cloudinary with:', { cloudName, uploadPreset }); // Debug log

      // Upload to Cloudinary
      const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
          transformRequest: [(data) => data], // Prevent axios from transforming the form data
        }
      );

      console.log('Cloudinary response:', response.data); // Debug log

      if (!response.data || !response.data.secure_url) {
        throw new Error('No secure URL received from Cloudinary');
      }

      // Update the student's photo_url in the database
      const endpoint = authUser.role === 'department_admin' || authUser.role === 'super_admin'
        ? `${BASE_URL}/api/v1/admin/student/${studentId}`
        : `${BASE_URL}/api/v1/teacher/student/${studentId}`;

      await axios.put(
        endpoint,
        {
          photo_url: response.data.secure_url
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json'
          }
        }
      );

      // Update local state
      setStudent(prev => ({
        ...prev,
        photo_url: response.data.secure_url
      }));

      setShowUploadModal(false);
      setSelectedFile(null);
      toast.success('Avatar updated successfully');
    } catch (error) {
      console.error('Error uploading avatar:', error);
      // Log the detailed error response
      if (error.response) {
        console.error('Error response:', error.response.data);
        console.error('Error status:', error.response.status);
        console.error('Error headers:', error.response.headers);
      }
      toast.error(error.response?.data?.message || error.message || 'Failed to upload avatar. Please try again.');
    } finally {
      setIsUploading(false);
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
            <div className="mb-4 md:mb-0 md:mr-6 relative">
              {student.photo_url ? (
                <div className="relative">
                  <img 
                    src={student.photo_url} 
                    alt={student.full_name} 
                    className="w-40 h-40 object-cover rounded-full border-4 border-blue-100 shadow-md"
                  />
                  {isEditing && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="w-40 h-40 bg-gray-200 rounded-full flex items-center justify-center border-4 border-blue-100 shadow-md relative">
                  <span className="text-gray-500 text-xl font-semibold">
                    {student.full_name ? student.full_name.charAt(0).toUpperCase() : "N/A"}
                  </span>
                  {isEditing && (
                    <button
                      onClick={() => setShowUploadModal(true)}
                      className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full shadow-lg hover:bg-blue-600 transition-colors"
                    >
                      <Upload className="w-5 h-5" />
                    </button>
                  )}
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
                  {isEditing ? (
                    <select
                      value={formData.current_semester || ''}
                      onChange={(e) => handleSemesterChange(e.target.value)}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Select Semester</option>
                      {[1, 2, 3, 4, 5, 6, 7, 8].map((sem) => (
                        <option key={sem} value={sem}>
                          {sem}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <p className="mt-1 text-gray-900 font-medium">
                      {student.current_semester || 'N/A'}
                    </p>
                  )}
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
                  <label className="block text-sm font-medium text-gray-700">Parent&apos;s Number</label>
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
                  {Array.isArray(formData.previous_cgpa) && formData.previous_cgpa.length > 0
                    ? formData.previous_cgpa[formData.previous_cgpa.length - 1]
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
                      {Array.isArray(formData.previous_cgpa) && formData.previous_cgpa.length > 0 ? (
                        formData.previous_cgpa.map((cgpa, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">Semester {index + 1}</td>
                            <td className="py-2 px-4 border-b text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  max="10"
                                  step="0.01"
                                  value={cgpa}
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
                      {Array.isArray(formData.previous_percentages) && formData.previous_percentages.length > 0 ? (
                        formData.previous_percentages.map((percentage, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">Semester {index + 1}</td>
                            <td className="py-2 px-4 border-b text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  value={percentage}
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
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-blue-800 border-b border-blue-200 pb-2">Attendance</h2>
                {isEditing && (
                  <button
                    onClick={() => setShowAttendanceModal(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Add Attendance
                  </button>
                )}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white rounded-lg shadow-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="py-2 px-4 border-b text-left">Semester</th>
                      <th className="py-2 px-4 border-b text-right">Attendance</th>
                      {isEditing && <th className="py-2 px-4 border-b text-right">Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(formData.attendance) && formData.attendance.length > 0 ? (
                      formData.attendance
                        .filter(record => record.average_attendance > 0)
                        .map((record, index) => (
                          <tr key={index} className="hover:bg-gray-50">
                            <td className="py-2 px-4 border-b">
                              Semester {record.semester}
                            </td>
                            <td className="py-2 px-4 border-b text-right">
                              <span className="font-medium">{record.average_attendance}%</span>
                            </td>
                            {isEditing && (
                              <td className="py-2 px-4 border-b text-right">
                                <button
                                  onClick={() => handleRemoveAttendance(index)}
                                  className="text-red-600 hover:text-red-800 flex items-center gap-1"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Remove
                                </button>
                              </td>
                            )}
                          </tr>
                        ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="py-4 px-4 text-center text-gray-500">
                          No attendance data available
                        </td>
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

        {/* Attendance Modal */}
        {showAttendanceModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Add Attendance</h3>
                <button
                  onClick={() => {
                    setShowAttendanceModal(false);
                    setNewAttendance({ semester: '', average_attendance: '' });
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Semester
                  </label>
                  <select
                    value={newAttendance.semester}
                    onChange={(e) => setNewAttendance(prev => ({ ...prev, semester: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">Select a semester</option>
                    {getSemesterOptions().map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Attendance Percentage
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.01"
                      value={newAttendance.average_attendance}
                      onChange={(e) => setNewAttendance(prev => ({ ...prev, average_attendance: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <span className="absolute right-3 top-2 text-gray-500">%</span>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAttendanceModal(false);
                      setNewAttendance({ semester: '', average_attendance: '' });
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddAttendance}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Add Attendance
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Avatar Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">Upload New Avatar</h3>
                <button
                  onClick={() => {
                    setShowUploadModal(false);
                    setSelectedFile(null);
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  {selectedFile && (
                    <p className="mt-2 text-sm text-gray-600">
                      Selected file: {selectedFile.name}
                    </p>
                  )}
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => {
                      setShowUploadModal(false);
                      setSelectedFile(null);
                    }}
                    className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAvatarUpload}
                    disabled={isUploading || !selectedFile}
                    className={`px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2 ${
                      isUploading ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    {isUploading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white"></div>
                        Uploading...
                      </>
                    ) : (
                      'Upload'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetails;