import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { GraduationCap, Home, BookOpen, Award, FileText, Settings, LogOut } from 'lucide-react';

const SideBar = ({ children }) => {
  const location = useLocation();
  
  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-700' : '';
  };

  return (
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-700 text-white">
        <div className="p-4">
          <div className="flex items-center gap-2 m-8 mb-8">
            <GraduationCap className="w-8 h-8" />
            <span className="text-xl font-bold">StudentHub</span>
          </div>
          <nav className="space-y-2">
            <Link
              to="/"
              className={`flex items-center gap-2 p-3 rounded-lg bg-blue-700 hover:bg-blue-800 transition-colors ${isActive('/')}`}
            >
              <Home className="w-5 h-5" />
              Dashboard
            </Link>
            <Link
              to="/courses"
              className={`flex items-center gap-2 p-3 rounded-lg bg-blue-700 hover:bg-blue-800 transition-colors ${isActive('/courses')}`}
            >
              <BookOpen className="w-5 h-5" />
              Courses
            </Link>
            <Link
              to="/achievements"
              className={`flex items-center gap-2 p-3 rounded-lg bg-blue-700 hover:bg-blue-800 transition-colors ${isActive('/achievements')}`}
            >
              <Award className="w-5 h-5" />
              Achievements
            </Link>
            <Link
              to="/reports"
              className={`flex items-center gap-2 p-3 rounded-lg bg-blue-700 hover:bg-blue-800 transition-colors ${isActive('/reports')}`}
            >
              <FileText className="w-5 h-5" />
              Reports
            </Link>
            <Link
              to="/settings"
              className={`flex items-center gap-2 p-3 rounded-lg bg-blue-700 hover:bg-blue-800 transition-colors ${isActive('/settings')}`}
            >
              <Settings className="w-5 h-5" />
              Settings
            </Link>
          </nav>
        </div>
        <div className="absolute bottom-0 w-64 p-4">
          <button className="flex items-center gap-2 p-3 w-full text-left rounded-lg bg-blue-700 hover:bg-blue-800 transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
};

export default SideBar;
