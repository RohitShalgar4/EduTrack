import React, { useState } from 'react';

const StudentList = ({ students = [], onUpdateStudent, onDeleteStudent }) => {
  const [editingStudent, setEditingStudent] = useState(null);

  const handleEdit = (student) => {
    setEditingStudent(student);
  };

  const handleSave = (updatedStudent) => {
    onUpdateStudent(updatedStudent);
    setEditingStudent(null);
  };

  // If students is not an array, render a fallback UI
  if (!Array.isArray(students)) {
    return <div className="text-red-600">Error: Students data is not available.</div>;
  }

  // If students array is empty, render a message
  if (students.length === 0) {
    return <div className="text-gray-600">No students found.</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Student List</h2>
      {students.map((student) => (
        <div key={student.registration_number} className="bg-white p-4 rounded shadow">
          {editingStudent?.registration_number === student.registration_number ? (
            <EditStudentForm student={editingStudent} onSave={handleSave} />
          ) : (
            <div className="flex justify-between items-center">
              <div>
                <p className="font-bold">{student.full_name}</p>
                <p>{student.registration_number}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(student)} className="text-blue-600 hover:text-blue-800">
                  Edit
                </button>
                <button onClick={() => onDeleteStudent(student.registration_number)} className="text-red-600 hover:text-red-800">
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default StudentList;