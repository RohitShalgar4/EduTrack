import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Home, 
  Award, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { setAuthUser } from '../redux/userSlice'; // Adjust the import path
import { BASE_URL } from '../main';
import axios from 'axios';

const SideBar = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const authUser = useSelector((state) => state.user.authUser);
  const [isOpen, setIsOpen] = useState(false); // Drawer starts closed
  
  // Close drawer when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.sidebar') && !event.target.closest('.sidebar-toggle')) {
        setIsOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close drawer when route changes on mobile
  useEffect(() => {
    if (window.innerWidth < 1024) {
      setIsOpen(false);
    }
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-600 text-white' : 'text-blue-50 hover:bg-blue-600/50';
  };

  const handleLogout = async () => {
    try {
      // Make API call to logout endpoint to clear the cookie
      await axios.get(`${BASE_URL}/api/v1/user/logout`, {}, { withCredentials: true }); // Adjust the endpoint as needed
      
      // Clear the user from Redux store
      dispatch(setAuthUser(null));
      
      // Redirect to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Optionally handle the error (e.g., show a message to the user)
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1 relative">
        {/* Sidebar - fixed on large screens, drawer on mobile */}
        <aside 
          className={`sidebar fixed lg:relative lg:translate-x-0 z-40 h-full lg:h-auto
            ${isOpen ? 'translate-x-0' : '-translate-x-full'} 
            transition-transform duration-300 ease-in-out
            w-64 bg-gradient-to-b from-blue-700 to-blue-800 text-white flex flex-col shadow-xl lg:shadow-md
            mt-16 lg:mt-0`}
        >
          {/* Close button (icon) */}
          <div className="flex justify-end p-4 mt-18">
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 text-white hover:bg-blue-600/50 rounded-lg transition-colors"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
          
          {/* Navigation links - centered */}
          <div className="p-4 flex-grow">
            <nav className="space-y-3 flex flex-col items-center">
              <Link
                to="/dashboard"
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full justify-center ${isActive('/dashboard')}`}
              >
                <Home className="w-5 h-5" />
                <span>Dashboard</span>
              </Link>
              <Link
                to="/achievements"
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full justify-center ${isActive('/achievements')}`}
              >
                <Award className="w-5 h-5" />
                <span>Achievements</span>
              </Link>
              <Link
                to="/reports"
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full justify-center ${isActive('/reports')}`}
              >
                <FileText className="w-5 h-5" />
                <span>Reports</span>
              </Link>
              <Link
                to="/settings"
                className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full justify-center ${isActive('/settings')}`}
              >
                <Settings className="w-5 h-5" />
                <span>Settings</span>
              </Link>
              
              {/* Logout button inline with other links */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-lg text-blue-50 hover:bg-red-500/80 transition-colors w-full justify-center mt-6"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </nav>
          </div>
        </aside>
        
        {/* Backdrop overlay when drawer is open on mobile */}
        {isOpen && (
          <div 
            className="fixed inset-0 bg-black/20 z-30 lg:hidden"
            onClick={() => setIsOpen(false)}
          ></div>
        )}
        
        {/* Main content */}
        <main className="flex-1 lg:ml-0">
          {/* Toggle button for sidebar */}
          <div className="fixed top-4 left-4 z-50 lg:absolute">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="sidebar-toggle p-2 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isOpen ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
            </button>
          </div>
          
          <div className="p-6 mt-12">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SideBar;