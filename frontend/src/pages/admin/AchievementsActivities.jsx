import React, { useState } from 'react';

const AchievementsActivities = () => {
  const [achievements, setAchievements] = useState([]);
  const [newAchievement, setNewAchievement] = useState({
    studentId: '',
    achievement: '',
  });

  const handleAddAchievement = () => {
    setAchievements([...achievements, newAchievement]);
    setNewAchievement({ studentId: '', achievement: '' });
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Achievements & Activities</h2>
      <div className="space-y-4">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="Student ID"
            value={newAchievement.studentId}
            onChange={(e) => setNewAchievement({ ...newAchievement, studentId: e.target.value })}
            className="p-2 border rounded"
          />
          <input
            type="text"
            placeholder="Achievement"
            value={newAchievement.achievement}
            onChange={(e) => setNewAchievement({ ...newAchievement, achievement: e.target.value })}
            className="p-2 border rounded"
          />
          <button onClick={handleAddAchievement} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
            Add Achievement
          </button>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="p-2 border">Student ID</th>
              <th className="p-2 border">Achievement</th>
            </tr>
          </thead>
          <tbody>
            {achievements.map((achievement, index) => (
              <tr key={index} className="border">
                <td className="p-2 border">{achievement.studentId}</td>
                <td className="p-2 border">{achievement.achievement}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AchievementsActivities;