import React, { useState } from 'react';

const SearchStudent = ({ students }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);

  const handleSearch = () => {
    const results = students.filter(
      (student) =>
        student.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.registration_number.includes(searchQuery)
    );
    setSearchResults(results);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm">
      <h2 className="text-2xl font-bold mb-4">Search Student</h2>
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Search by name or roll number"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="p-2 border rounded flex-grow"
        />
        <button onClick={handleSearch} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
          Search
        </button>
      </div>
      <div className="mt-4">
        {searchResults.map((student) => (
          <div key={student.registration_number} className="p-2 border-b">
            <p className="font-bold">{student.full_name}</p>
            <p>{student.registration_number}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchStudent;