import React from 'react';

const SystemLogs = () => {
  const logs = [
    { id: 1, action: 'Student added', timestamp: '2023-10-01 10:00 AM' },
    { id: 2, action: 'Student updated', timestamp: '2023-10-01 11:00 AM' },
    { id: 3, action: 'Remark added', timestamp: '2023-10-01 12:00 PM' },
  ];

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">System Logs</h2>
      <div className="space-y-4">
        {logs.map((log) => (
          <div key={log.id} className="p-2 border-b">
            <p className="font-bold">{log.action}</p>
            <p>{log.timestamp}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SystemLogs;