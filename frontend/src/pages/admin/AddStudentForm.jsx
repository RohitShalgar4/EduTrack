import React, { useState } from 'react';

const AddStudentForm = ({ onAddStudent }) => {
  const [formData, setFormData] = useState({
    full_name: '',
    registration_number: '',
    cgpa: '',
    current_semester: '',
    class_rank: '',
    attendance: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddStudent(formData);
    setFormData({
      full_name: '',
      registration_number: '',
      cgpa: '',
      current_semester: '',
      class_rank: '',
      attendance: '',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input
        type="text"
        name="full_name"
        placeholder="Full Name"
        value={formData.full_name}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="text"
        name="registration_number"
        placeholder="Registration Number"
        value={formData.registration_number}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="number"
        name="cgpa"
        placeholder="CGPA"
        value={formData.cgpa}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="number"
        name="current_semester"
        placeholder="Current Semester"
        value={formData.current_semester}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="number"
        name="class_rank"
        placeholder="Class Rank"
        value={formData.class_rank}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <input
        type="number"
        name="attendance"
        placeholder="Attendance (%)"
        value={formData.attendance}
        onChange={handleChange}
        className="w-full p-2 border rounded"
        required
      />
      <button type="submit" className="w-full p-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Add Student
      </button>
    </form>
  );
};

export default AddStudentForm;