import { useState, useEffect } from 'react';
import { School, Menu, X } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../redux/userSlice';
import axios from 'axios';
import { BASE_URL } from '../main';
import { toast } from 'react-hot-toast';

// Custom hook for auth state
export const useAuthStore = () => {
    const authUser = useSelector((state) => state.user.authUser);

    return {
        isAuthenticated: !!authUser,
        role: authUser?.role || "student",
        authUser,
    };
};

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { isAuthenticated, role, authUser } = useAuthStore();

    // Close menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest(".mobile-menu") && !event.target.closest(".menu-button")) {
                setIsOpen(false);
            }
        };
        if (isOpen) {
            document.addEventListener("click", handleClickOutside);
        }
        return () => {
            document.removeEventListener("click", handleClickOutside);
        };
    }, [isOpen]);

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

    return (
        <nav className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-50">
            <div className="max-w-7xl mx-auto flex justify-between items-center h-full px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2 z-50">
                    <School className="h-8 w-8" />
                    <span className="font-extrabold text-2xl">EduTrack</span>
                </Link>

                {/* Mobile Menu Icon */}
                <div className="md:hidden z-50">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsOpen(!isOpen);
                        }}
                        className="menu-button p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-500"
                    >
                        {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>

                {/* Desktop Navigation */}
                <div className="hidden md:flex items-center gap-6">
                    {isAuthenticated && authUser ? (
                        <div className="flex items-center gap-4">
                            <Link to="/my-learning" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                My Learning
                            </Link>
                            <Link to="/profile" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                Edit Profile
                            </Link>
                            {role === 'instructor' && (
                                <Link to="/admin/dashboard" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                    Dashboard
                                </Link>
                            )}
                            <button onClick={handleLogout} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors">
                                Log out
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login" className="px-4 py-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 text-white rounded-lg font-medium transition-all duration-200 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/25">
                                Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Improved Mobile Dropdown Menu */}
            {isOpen && (
                <div className="mobile-menu md:hidden absolute right-4 top-16 w-48 bg-white dark:bg-gray-900 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
                    <div className="flex flex-col py-2">
                        {isAuthenticated && authUser ? (
                            <>
                                <Link to="/my-learning" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                                    My Learning
                                </Link>
                                <Link to="/profile" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                                    Edit Profile
                                </Link>
                                {role === 'instructor' && (
                                    <Link to="/admin/dashboard" className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm">
                                        Dashboard
                                    </Link>
                                )}
                                <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                <button onClick={handleLogout} className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm text-red-500">
                                    Log out
                                </button>
                            </>
                        ) : (
                            <Link to="/login" className="px-4 py-2 mx-2 bg-gradient-to-r from-blue-600 via-blue-700 to-blue-900 text-white rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-blue-600/25 text-center text-sm">
                                Login
                            </Link>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;