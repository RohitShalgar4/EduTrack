// Login.js
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setAuthUser, logoutUser } from '../redux/userSlice';
import { clearStudentData } from '../redux/studentSlice';
import { BASE_URL } from '../main';

const Login = () => {
  const [user, setUser] = useState({
    email: '',
    password: '',
  });
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    // Clear all previous state when mounting login component
    dispatch(logoutUser());
    dispatch(clearStudentData());
  }, [dispatch]);

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    try {
      // Clear any existing state before login attempt
      dispatch(logoutUser());
      dispatch(clearStudentData());

      const res = await axios.post(`${BASE_URL}/api/v1/user/login`, user, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });
  
      console.log("Login response:", res.data);
      
      if (!res.data._id) {
        throw new Error('Invalid response from server - no user ID');
      }

      // Set the auth user with the response data
      dispatch(setAuthUser(res.data));
      
      // Role-based navigation
      switch (res.data.role) {
        case 'super_admin':
          navigate('/admin/dashboard');
          break;
        case 'department_admin':
          navigate('/department-admin/dashboard');
          break;
        case 'teacher':
          navigate('/teacher/dashboard');
          break;
        case 'student':
        default:
          navigate('/dashboard');
          break;
      }
    } catch (error) {
      console.error("Login Error:", error);
      toast.error(error.response?.data?.message || "An error occurred during login");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-gray-800 rounded-xl shadow-2xl p-8 border border-gray-700">
          <h1 className="text-3xl font-bold text-center mb-8 text-white">Login</h1>
          <form onSubmit={onSubmitHandler} className="space-y-6">
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Email</label>
              <input
                value={user.email}
                onChange={(e) => setUser({ ...user, email: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition duration-200"
                type="email"
                placeholder="Enter your email"
              />
            </div>
            <div>
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <input
                value={user.password}
                onChange={(e) => setUser({ ...user, password: e.target.value })}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-white placeholder-gray-400 transition duration-200"
                type="password"
                placeholder="Enter your password"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition duration-200 transform hover:-translate-y-0.5"
            >
              Login
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;