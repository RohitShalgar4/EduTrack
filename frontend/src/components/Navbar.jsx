import { useState, useEffect } from 'react';
import { School, Menu } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'; // Assuming you use axios for API calls
import { BASE_URL } from '../main';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [user, setUser] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch user data from your backend API
        const fetchUser = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/api/v1/student`); // Adjust API endpoint
                setUser(response.data); 
            } catch (error) {
                console.error('Error fetching user:', error);
            }
        };

        fetchUser();
    }, []);

    const handleLogout = () => {
        setIsDropdownOpen(false);
        setUser(null); // Clear user state on logout
        navigate('/login');
    };

    return (
        <nav className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 fixed top-0 left-0 right-0 z-10">
            {/* Desktop Navigation */}
            <div className="max-w-7xl mx-auto hidden md:flex justify-between items-center h-full px-4">
                {/* Logo */}
                <Link to="/" className="flex items-center gap-2">
                    <School className="h-8 w-8" />
                    <span className="font-extrabold text-2xl">EduTrack</span>
                </Link>

                {/* Right side items */}
                <div className="flex items-center gap-6">
                    {user ? (
                        <div className="flex items-center gap-4">
                            {user.photo_url && (
                                <img
                                    src={user.photo_url}
                                    alt="User Avatar" 
                                    className="w-10 h-10 rounded-full border border-gray-300 object-cover"
                                />
                            )}

                            <div className="relative dropdown-container">
                                <button
                                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                                >
                                    <Menu className="h-6 w-6" />
                                </button>

                                {/* Dropdown Menu */}
                                {isDropdownOpen && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-1">
                                        <Link 
                                            to="/my-learning" 
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            My Learning
                                        </Link>
                                        <Link 
                                            to="/profile"
                                            onClick={() => setIsDropdownOpen(false)}
                                            className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Edit Profile
                                        </Link>
                                        {user.role === 'instructor' && (
                                            <Link 
                                                to="/admin/dashboard"
                                                onClick={() => setIsDropdownOpen(false)}
                                                className="block px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                            >
                                                Dashboard
                                            </Link>
                                        )}
                                        <button 
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700"
                                        >
                                            Log out
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link 
                                to="/login"
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-600 dark:hover:bg-gray-700"
                            >
                                Login
                            </Link>
                        </div>
                    )}
                </div>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex justify-between items-center h-full px-4">
                <Link to="/" className="flex items-center gap-2">
                    <School className="h-6 w-6" />
                    <span className="font-extrabold text-xl">EduTrack</span>
                </Link>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                    <Menu className="h-6 w-6" />
                </button>

                {/* Mobile Menu */}
                {isOpen && (
                    <div className="absolute top-16 left-0 right-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                        <div className="flex flex-col p-4 space-y-4">
                            <Link 
                                to="/my-learning" 
                                onClick={() => setIsOpen(false)}
                                className="hover:text-blue-600"
                            >
                                My Learning
                            </Link>
                            <Link 
                                to="/profile"
                                onClick={() => setIsOpen(false)}
                                className="hover:text-blue-600"
                            >
                                Edit Profile
                            </Link>
                            {user?.role === 'instructor' && (
                                <Link 
                                    to="/admin/dashboard"
                                    onClick={() => setIsOpen(false)}
                                    className="hover:text-blue-600"
                                >
                                    Dashboard
                                </Link>
                            )}
                            <button 
                                onClick={handleLogout}
                                className="text-left hover:text-blue-600"
                            >
                                Log out
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;
