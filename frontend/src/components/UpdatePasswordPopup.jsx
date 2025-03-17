import { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { setAuthUser } from '../redux/userSlice';
import { BASE_URL } from '../main';

const UpdatePasswordPopup = ({ onClose }) => {
    const [formData, setFormData] = useState({
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const dispatch = useDispatch();
    const { role } = useSelector(state => state.user.authUser);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        // Clear error when user types
        setError('');
    };

    const validatePasswords = () => {
        if (formData.newPassword.length < 6) {
            setError('Password must be at least 6 characters long');
            return false;
        }
        if (formData.newPassword !== formData.confirmPassword) {
            setError('Passwords do not match');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate passwords before submitting
        if (!validatePasswords()) {
            return;
        }

        setLoading(true);

        try {
            console.log('Starting password update process...');
            // Determine the endpoint based on user role
            let endpoint = '/api/v1/user/update-password';
            let method = 'post';

            if (role === 'teacher') {
                endpoint = '/api/v1/teacher/update-password';
                method = 'post';
            } else if (role === 'super_admin' || role === 'department_admin') {
                endpoint = '/api/v1/admin/update-password';
                method = 'post';
            }

            console.log('Using endpoint:', endpoint);
            console.log('Request method:', method);
            console.log('User role:', role);

            const config = {
                method: method,
                url: `${BASE_URL}${endpoint}`,
                data: { newPassword: formData.newPassword },
                withCredentials: true,
                headers: {
                    'Content-Type': 'application/json'
                }
            };

            console.log('Sending request with config:', {
                ...config,
                data: '***REDACTED***' // Don't log the actual password
            });

            const response = await axios(config);

            console.log('Password update response:', {
                status: response.status,
                success: response.data.success,
                message: response.data.message
            });

            if (response.data.success) {
                // Update the Redux store with the updated user data
                dispatch(setAuthUser({
                    ...response.data.user,
                    isFirstLogin: false
                }));
                toast.success('Password updated successfully');
                onClose();
            } else {
                setError(response.data.message || 'Failed to update password');
                toast.error(response.data.message || 'Failed to update password');
            }
        } catch (error) {
            console.error('Password update error details:', {
                status: error.response?.status,
                statusText: error.response?.statusText,
                message: error.response?.data?.message,
                error: error.message
            });
            setError(error.response?.data?.message || 'Error updating password');
            toast.error(error.response?.data?.message || 'Error updating password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-8 max-w-md w-full">
                <h2 className="text-2xl font-bold mb-6">Update Your Password</h2>
                <p className="mb-6 text-gray-600">
                    This appears to be your first login. Please update your password to continue.
                </p>
                
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="mb-4 p-2 bg-red-100 border border-red-400 text-red-700 rounded">
                            {error}
                        </div>
                    )}
                    
                    <div className="mb-4">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            New Password
                        </label>
                        <input
                            type="password"
                            name="newPassword"
                            value={formData.newPassword}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                            minLength={6}
                            placeholder="Enter new password (min. 6 characters)"
                        />
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-700 text-sm font-bold mb-2">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            required
                            minLength={6}
                            placeholder="Confirm your new password"
                        />
                    </div>
                    
                    <div className="flex items-center justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline disabled:opacity-50"
                        >
                            {loading ? 'Updating...' : 'Update Password'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

UpdatePasswordPopup.propTypes = {
    onClose: PropTypes.func.isRequired
};

export default UpdatePasswordPopup; 