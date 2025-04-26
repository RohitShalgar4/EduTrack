import { useState, useEffect } from 'react';
import axios from 'axios';
import { BASE_URL } from '../../main';
import { Download, Loader2 } from 'lucide-react';
import * as XLSX from 'xlsx';
import { toast } from 'react-hot-toast';
import { useSelector } from 'react-redux';

const ExportPage = () => {
  const [exportType, setExportType] = useState('student');
  const [selectedFields, setSelectedFields] = useState([]);
  const [filterValue, setFilterValue] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [classes, setClasses] = useState([]);
  const authUser = useSelector((state) => state.user.authUser);

  // Field groups for better organization
  const fieldGroups = {
    personal: [
      { id: 'full_name', label: 'Name' },
      { id: 'registration_number', label: 'Registration Number' },
      { id: 'Mobile_No', label: 'Mobile Number' },
      { id: 'Parent_No', label: 'Parent\'s Number' },
      { id: 'address', label: 'Address' },
      { id: 'gender', label: 'Gender' }
    ],
    academic: [
      { id: 'Department', label: 'Department' },
      { id: 'class', label: 'Class' },
      { id: 'current_semester', label: 'Current Semester' },
      { id: 'cgpa', label: 'CGPA' }
    ],
    semester_data: [
      { id: 'semester_results', label: 'Semester Results' }
    ],
    attendance: [
      { id: 'overall_attendance', label: 'Overall Attendance' },
      { id: 'semester_attendance', label: 'Semester-wise Attendance' }
    ],
    achievements: [
      { id: 'achievements', label: 'Achievements' }
    ]
  };

  // Fetch initial data
  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [studentsRes, departmentsRes, classesRes] = await Promise.all([
        axios.get(`${BASE_URL}/api/v1/admin/export/students`, { withCredentials: true }),
        axios.get(`${BASE_URL}/api/v1/admin/export/departments`, { withCredentials: true }),
        axios.get(
          authUser?.role === 'super_admin' 
            ? `${BASE_URL}/api/v1/admin/all/classes`
            : `${BASE_URL}/api/v1/admin/department/classes`,
          { withCredentials: true }
        )
      ]);

      if (studentsRes.data.success) {
        setStudents(studentsRes.data.data);
      } else {
        toast.error(studentsRes.data.message || 'Failed to fetch students');
      }

      if (departmentsRes.data.success) {
        setDepartments(departmentsRes.data.data);
      } else {
        toast.error(departmentsRes.data.message || 'Failed to fetch departments');
      }

      if (classesRes.data.success) {
        setClasses(classesRes.data.data);
      } else {
        toast.error(classesRes.data.message || 'Failed to fetch classes');
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
      toast.error(error.response?.data?.message || 'Failed to fetch initial data');
    }
  };

  const handleFieldChange = (fieldId) => {
    setSelectedFields(prev => {
      if (prev.includes(fieldId)) {
        return prev.filter(id => id !== fieldId);
      } else {
        return [...prev, fieldId];
      }
    });
  };

  const handleGroupChange = (groupFields) => {
    setSelectedFields(prev => {
      const newFields = [...prev];
      groupFields.forEach(field => {
        if (!newFields.includes(field.id)) {
          newFields.push(field.id);
        }
      });
      return newFields;
    });
  };

  const generateReport = async () => {
    if (selectedFields.length === 0) {
      toast.error('Please select at least one field');
      return;
    }

    if (exportType !== 'college' && !filterValue) {
      toast.error('Please select a filter value');
      return;
    }

    if (exportType === 'class' && !selectedDepartment) {
      toast.error('Please select a department for class-wise export');
      return;
    }

    setLoading(true);
    try {
      console.log('Generating report with fields:', selectedFields);
      const response = await axios.post(
        `${BASE_URL}/api/v1/admin/export/generate`,
        {
          exportType,
          filterValue,
          selectedFields,
          department: selectedDepartment
        },
        { withCredentials: true }
      );

      if (response.data.success) {
        console.log('Report data received:', response.data.data);
        // Ensure all fields have values
        const processedData = response.data.data.map(row => {
          const processedRow = { ...row };
          selectedFields.forEach(field => {
            if (processedRow[field] === undefined || processedRow[field] === '') {
              processedRow[field] = '0.00';
            }
          });
          return processedRow;
        });
        setReportData(processedData);
        setTotalPages(Math.ceil(processedData.length / 10));
        setCurrentPage(1);
      } else {
        toast.error(response.data.message || 'Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error(error.response?.data?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (reportData.length === 0) {
      toast.error('No data to export');
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Student Report');
    XLSX.writeFile(workbook, 'student_report.xlsx');
  };

  const renderFilterInput = () => {
    switch (exportType) {
      case 'student':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Student
            </label>
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a student</option>
              {students.map(student => (
                <option key={student._id} value={student._id}>
                  {student.full_name} - {student.registration_number}
                </option>
              ))}
            </select>
          </div>
        );
      case 'class':
        return (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Department
              </label>
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a department</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>
                    {dept}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Class
              </label>
              <select
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select a class</option>
                {classes.map(cls => (
                  <option key={cls} value={cls}>
                    {cls}
                  </option>
                ))}
              </select>
            </div>
          </>
        );
      case 'department':
        return (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Select Department
            </label>
            <select
              value={filterValue}
              onChange={(e) => setFilterValue(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a department</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>
          </div>
        );
      default:
        return null;
    }
  };

  // Function to get all fields to display in the table
  const getTableFields = () => {
    const fields = [];
    selectedFields.forEach(field => {
      if (field === 'semester_results') {
        // Add semester fields based on the first student's current semester
        if (reportData.length > 0) {
          const currentSem = reportData[0].current_semester || 1;
          for (let sem = 1; sem < currentSem; sem++) {
            fields.push(`sem${sem}_percentage`);
            fields.push(`sem${sem}_sgpa`);
          }
        }
      } else if (field === 'semester_attendance') {
        // Add semester attendance fields
        if (reportData.length > 0) {
          const currentSem = reportData[0].current_semester || 1;
          for (let sem = 1; sem < currentSem; sem++) {
            fields.push(`sem${sem}_attendance`);
          }
        }
      } else {
        fields.push(field);
      }
    });
    return fields;
  };

  // Function to get field label
  const getFieldLabel = (field) => {
    if (field.startsWith('sem')) {
      const [sem, type] = field.split('_');
      const semester = sem.replace('sem', '');
      if (type === 'percentage') {
        return `Semester ${semester} Percentage`;
      } else if (type === 'sgpa') {
        return `Semester ${semester} SGPA`;
      } else if (type === 'attendance') {
        return `Semester ${semester} Attendance`;
      }
    }
    return fieldGroups[Object.keys(fieldGroups).find(group =>
      fieldGroups[group].some(f => f.id === field)
    )]?.find(f => f.id === field)?.label || field;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Export Student Data</h1>

      {/* Export Type Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Export Type</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {['student', 'class', 'department', 'college'].map((type) => (
            <label
              key={type}
              className={`flex items-center p-4 border rounded-lg cursor-pointer ${
                exportType === type ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
              }`}
            >
              <input
                type="radio"
                name="exportType"
                value={type}
                checked={exportType === type}
                onChange={(e) => setExportType(e.target.value)}
                className="mr-2"
              />
              <span className="capitalize">{type} Wise</span>
            </label>
          ))}
        </div>
      </div>

      {/* Filter Input */}
      {renderFilterInput()}

      {/* Field Selection */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Select Fields</h2>
        <div className="space-y-6">
          {Object.entries(fieldGroups).map(([group, fields]) => (
            <div key={group} className="border-b pb-4">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-md font-medium capitalize">{group} Details</h3>
                <button
                  onClick={() => handleGroupChange(fields)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Select All
                </button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {fields.map((field) => (
                  <label
                    key={field.id}
                    className="flex items-center space-x-2"
                  >
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field.id)}
                      onChange={() => handleFieldChange(field.id)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>{field.label}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Generate Report Button */}
      <div className="flex justify-end mb-6">
        <button
          onClick={generateReport}
          disabled={loading}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Generating...
            </>
          ) : (
            'Generate Report'
          )}
        </button>
      </div>

      {/* Report Table */}
      {reportData.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Generated Report</h2>
            <button
              onClick={exportToExcel}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="w-5 h-5" />
              Export to Excel
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {getTableFields().map((field) => (
                    <th
                      key={field}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                    >
                      {getFieldLabel(field)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {reportData
                  .slice((currentPage - 1) * 10, currentPage * 10)
                  .map((row, index) => (
                    <tr key={index}>
                      {getTableFields().map((field) => (
                        <td key={field} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {row[field] !== undefined ? row[field] : 'N/A'}
                        </td>
                      ))}
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <nav className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 rounded border border-gray-300 disabled:opacity-50"
                >
                  Next
                </button>
              </nav>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExportPage; 