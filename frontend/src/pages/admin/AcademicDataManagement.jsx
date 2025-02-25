import React, { useState } from 'react';

const AcademicDataManagement = () => {
  const [semesterResults, setSemesterResults] = useState([]);
  const [newResult, setNewResult] = useState({
    semester: '',
    subject: '',
    marks: '',
  });

  const handleAddResult = () => {
    setSemesterResults([...semesterResults, newResult]);
    setNewResult({ semester: '', subject: '', marks: '' });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Academic Data Management</h2>
      <div className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Semester"
            value={newResult.semester}
            onChange={(e) => setNewResult({ ...newResult, semester: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Subject"
            value={newResult.subject}
            onChange={(e) => setNewResult({ ...newResult, subject: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="number"
            placeholder="Marks"
            value={newResult.marks}
            onChange={(e) => setNewResult({ ...newResult, marks: e.target.value })}
            className="p-2 border rounded"
          />
          <button onClick={handleAddResult} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add Result
          </button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Semester</th>
              <th className="p-2 border">Subject</th>
              <th className="p-2 border">Marks</th>
            </tr>
          </thead>
          <tbody>
            {semesterResults.map((result, index) => (
              <tr key={index} className="border">
                <td className="p-2 border">{result.semester}</td>
                <td className="p-2 border">{result.subject}</td>
                <td className="p-2 border">{result.marks}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AcademicDataManagement;