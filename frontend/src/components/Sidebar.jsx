import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { 
  Home, 
  LogOut,
  Menu,
  UserPlus,
  Download
} from 'lucide-react';
import { setAuthUser, logoutUser } from '../redux/userSlice'; // Adjust the import path
import { BASE_URL } from '../main';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import AddStudent from '../pages/admin/forms/AddStudent';
import AddTeacher from '../pages/admin/forms/AddTeacher';
import AddAdmin from '../pages/admin/forms/AddAdmin';

const SideBar = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { authUser } = useSelector((state) => state.user);
  const [isOpen, setIsOpen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [openModal, setOpenModal] = useState(null);
  
  // Handle animation states
  const toggleSidebar = () => {
    setIsAnimating(true);
    setIsOpen(!isOpen);
    
    // Reset animating state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 300); // Match duration with CSS transition
  };
  
  // Close drawer when clicking outside on mobile
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest('.sidebar') && !event.target.closest('.sidebar-toggle')) {
        toggleSidebar();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close drawer when route changes
  useEffect(() => {
    if (isOpen && window.innerWidth < 1024) {
      toggleSidebar();
    }
  }, [location.pathname]);

  const isActive = (path) => {
    return location.pathname === path ? 'bg-blue-600 text-white' : 'text-blue-50 hover:bg-blue-600/50';
  };

  const handleLogout = async () => {
    try {
      // Clear the cookie by making request to backend
      await axios.get(`${BASE_URL}/api/v1/user/logout`, { 
        withCredentials: true 
      });
      
      // Clear Redux state
      dispatch(logoutUser());
      
      // Clear any persisted data from localStorage
      localStorage.clear();
      
      // Navigate to login page
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast.error('Logout failed. Please try again.');
    }
  };

  const menuItems = [
    {
      title: 'Dashboard',
      icon: <Home className="w-5 h-5" />,
      path: authUser?.role === 'student' ? '/student/dashboard' :
            authUser?.role === 'teacher' ? '/teacher/dashboard' :
            authUser?.role === 'department_admin' ? '/department-admin/dashboard' :
            '/admin/dashboard',
      roles: ['student', 'teacher', 'department_admin', 'super_admin']
    },
    {
      title: 'Add Student',
      icon: <UserPlus className="w-5 h-5" />,
      onClick: () => setOpenModal('student'),
      roles: ['department_admin', 'super_admin']
    },
    {
      title: 'Add Teacher',
      icon: <UserPlus className="w-5 h-5" />,
      onClick: () => setOpenModal('teacher'),
      roles: ['department_admin', 'super_admin']
    },
    {
      title: 'Add Admin',
      icon: <UserPlus className="w-5 h-5" />,
      onClick: () => setOpenModal('admin'),
      roles: ['super_admin']
    },
    {
      title: 'Export Data',
      icon: <Download className="w-5 h-5" />,
      path: '/export',
      roles: ['teacher', 'department_admin', 'super_admin']
    }
  ];

  const filteredMenuItems = menuItems.filter(item => 
    item.roles.includes(authUser?.role)
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="flex flex-1 relative">
        {/* Sidebar with zero width when closed */}
        <aside 
          className={`sidebar fixed z-40 h-full
            transition-all duration-300 ease-in-out
            ${isOpen ? 'w-64' : 'w-0'} 
            bg-gradient-to-b from-blue-700 to-blue-800 text-white flex flex-col shadow-xl
            mt-16 overflow-hidden`}
        >
          {/* Close button (icon)
          <div className="flex justify-end p-4">
            <button 
              onClick={toggleSidebar}
              className="p-2 text-white hover:bg-blue-600/50 rounded-lg transition-colors"
              disabled={isAnimating}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div> */}
          
          {/* Navigation links - centered */}
          <div className="p-4 flex-grow">
            <nav className="space-y-3 flex flex-col items-center">
              {filteredMenuItems.map((item, index) => (
                item.onClick ? (
                  <button
                    key={index}
                    onClick={item.onClick}
                    className="flex items-center gap-3 p-3 rounded-lg text-blue-50 hover:bg-blue-600/50 transition-colors w-full justify-center"
                  >
                    {item.icon}
                    {isOpen && <span>{item.title}</span>}
                  </button>
                ) : (
                  <Link
                    key={index}
                    to={item.path}
                    className={`flex items-center gap-3 p-3 rounded-lg transition-colors w-full justify-center ${isActive(item.path)}`}
                  >
                    {item.icon}
                    {isOpen && <span>{item.title}</span>}
                  </Link>
                )
              ))}
              
              {/* Logout button inline with other links */}
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 p-3 rounded-lg text-blue-50 hover:bg-red-500/80 transition-colors w-full justify-center mt-6"
              >
                <LogOut className="w-5 h-5" />
                {isOpen && <span>Logout</span>}
              </button>
            </nav>
          </div>
        </aside>
        
        {/* Backdrop overlay when drawer is open */}
        <div 
          className={`fixed inset-0 bg-black/20 z-30 transition-opacity duration-300 
            ${isOpen ? 'opacity-0 visible' : 'opacity-0 invisible'}`}
          onClick={toggleSidebar}
        ></div>
        
        {/* Main content - shifts when sidebar opens */}
        <main 
          className={`flex-1 transition-all duration-300 ease-in-out w-full
            ${isOpen ? 'ml-0 md:ml-0' : 'ml-0'}`}
        >
          {/* Toggle button for sidebar - always visible */}
          <div className="fixed top-20 left-4 z-50">
            <button 
              onClick={toggleSidebar}
              className={`sidebar-toggle p-2 rounded-full ${isOpen ? 'bg-white text-blue-600 hover:bg-blue-300' : 'bg-blue-600 text-white hover:bg-blue-700'}  shadow-lg  focus:outline-none focus:ring-2 focus:ring-blue-500`}
              disabled={isAnimating}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
          
          {/* Content area - shifts when sidebar opens */}
          <div 
            className={`p-6 mt-12 transition-all duration-300 ease-in-out
              ${isOpen ? 'ml-0 md:ml-64' : 'ml-0'}`}
          >
            {children}
          </div>
        </main>
      </div>

      {/* Modals */}
      {openModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-11/12 md:w-1/2 lg:w-1/3 p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {openModal === 'student' && 'Add Student'}
                {openModal === 'teacher' && 'Add Teacher'}
                {openModal === 'admin' && 'Add Admin'}
              </h2>
              <button
                onClick={() => setOpenModal(null)}
                className="text-gray-500 hover:text-gray-700"
              >
                &times;
              </button>
            </div>
            <div>
              {openModal === 'student' && <AddStudent onClose={() => setOpenModal(null)} department={authUser?.department} />}
              {openModal === 'teacher' && <AddTeacher onClose={() => setOpenModal(null)} department={authUser?.department} />}
              {openModal === 'admin' && <AddAdmin onClose={() => setOpenModal(null)} />}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SideBar;