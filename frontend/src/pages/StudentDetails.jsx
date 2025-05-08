import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { BASE_URL } from '../config';
import { FaEdit, FaTrash } from 'react-icons/fa';

const StudentDetails = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const { role, department } = useSelector(state => state.user.authUser);
    const [student, setStudent] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const fetchStudentDetails = async () => {
            try {
                setLoading(true);
                const response = await axios.get(
                    `${BASE_URL}/api/v1/admin/student/${studentId}`,
                    { withCredentials: true }
                );
                setStudent(response.data.student);
            } catch (error) {
                console.error('Error fetching student details:', error);
                setError(error.response?.data?.message || 'Failed to fetch student details');
                toast.error(error.response?.data?.message || 'Failed to fetch student details');
            } finally {
                setLoading(false);
            }
        };

        fetchStudentDetails();
    }, [studentId]);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            const response = await axios.delete(
                `${BASE_URL}/api/v1/admin/student/${studentId}`,
                { withCredentials: true }
            );

            if (response.data.success) {
                toast.success('Student deleted successfully');
                navigate(-1);
            } else {
                toast.error(response.data.message || 'Failed to delete student');
            }
        } catch (error) {
            console.error('Error deleting student:', error);
            toast.error(error.response?.data?.message || 'Failed to delete student');
        } finally {
            setIsDeleting(false);
            setShowDeleteConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-red-500">{error}</div>
            </div>
        );
    }

    if (!student) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="text-gray-500">Student not found</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Student Details */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-bold mb-6">{student.full_name}</h2>
                {/* Add your student details display here */}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-4 mt-6">
                {(role === 'super_admin' || (role === 'department_admin' && student?.Department === department)) && (
                    <>
                        <button
                            onClick={() => navigate(`/edit-student/${studentId}`)}
                            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 flex items-center"
                        >
                            <FaEdit className="mr-2" />
                            Edit Details
                        </button>
                        <button
                            onClick={() => setShowDeleteConfirm(true)}
                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 flex items-center"
                        >
                            <FaTrash className="mr-2" />
                            Delete Student
                        </button>
                    </>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
                        <h3 className="text-xl font-semibold mb-4">Confirm Delete</h3>
                        <p className="mb-6">Are you sure you want to delete this student? This action cannot be undone.</p>
                        <div className="flex justify-end space-x-4">
                            <button
                                onClick={() => setShowDeleteConfirm(false)}
                                className="px-4 py-2 border rounded hover:bg-gray-100"
                                disabled={isDeleting}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StudentDetails; 