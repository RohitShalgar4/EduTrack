import React from 'react';
import { jsPDF } from 'jspdf';

const GenerateReports = ({ students }) => {
  const generatePDF = (student) => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text('Student Report', 20, 20);
    doc.setFontSize(12);
    doc.text(`Name: ${student.full_name}`, 20, 40);
    doc.text(`Registration Number: ${student.registration_number}`, 20, 50);
    doc.text(`CGPA: ${student.cgpa}`, 20, 60);
    doc.save(`${student.full_name}-report.pdf`);
  };

  if (!Array.isArray(students)) {
    return <div className="text-red-600">Error: Students data is not available.</div>;
  }

  // If students array is empty, render a message
  if (students.length === 0) {
    return <div className="text-gray-600">No students found.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Generate Reports</h2>
      <div className="space-y-4">
        {students.map((student) => (
          <div key={student.registration_number} className="flex justify-between items-center p-2 border-b">
            <div>
              <p className="font-bold">{student.full_name}</p>
              <p>{student.registration_number}</p>
            </div>
            <button
              onClick={() => generatePDF(student)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Download Report
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default GenerateReports;