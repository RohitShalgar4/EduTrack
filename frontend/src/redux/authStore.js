import { useSelector } from 'react-redux';

export const useAuthStore = () => {
  const authUser = useSelector((state) => state.user.authUser);

  // Debugging: Log the authUser state
  console.log("useAuthStore - authUser:", authUser);

  return {
    isAuthenticated: !!authUser,
    role: authUser?.role || "student", // Ensure role is always defined
    isLoading: false, // Modify if needed
  };
};
