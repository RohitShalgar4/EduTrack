import React, { useState } from 'react';

const RemarksFeedback = () => {
  const [remarks, setRemarks] = useState([]);
  const [newRemark, setNewRemark] = useState({
    studentId: '',
    remark: '',
  });

  const handleAddRemark = () => {
    setRemarks([...remarks, newRemark]);
    setNewRemark({ studentId: '', remark: '' });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Remarks & Feedback</h2>
      <div className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Student ID"
            value={newRemark.studentId}
            onChange={(e) => setNewRemark({ ...newRemark, studentId: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Remark"
            value={newRemark.remark}
            onChange={(e) => setNewRemark({ ...newRemark, remark: e.target.value })}
            className="p-2 border rounded"
          />
          <button onClick={handleAddRemark} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add Remark
          </button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Student ID</th>
              <th className="p-2 border">Remark</th>
            </tr>
          </thead>
          <tbody>
            {remarks.map((remark, index) => (
              <tr key={index} className="border">
                <td className="p-2 border">{remark.studentId}</td>
                <td className="p-2 border">{remark.remark}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RemarksFeedback;