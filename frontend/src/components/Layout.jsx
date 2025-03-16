import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';
import Navbar from './Navbar';
import SideBar from './Sidebar';
import UpdatePasswordPopup from './UpdatePasswordPopup';

const MainLayout = () => {
  const [showPasswordPopup, setShowPasswordPopup] = useState(false);
  const user = useSelector((state) => state.user.authUser);

  useEffect(() => {
    if (user?.isFirstLogin) {
      setShowPasswordPopup(true);
    }
  }, [user]);

  const handleClosePopup = () => {
    setShowPasswordPopup(false);
  };

  return (
    <div className="flex min-h-screen">
      <SideBar />  
      <div className="flex flex-col flex-grow">
        <Navbar />
        <div className="flex-1 mt-16 p-4">
          <Outlet />
        </div>
      </div>
      {showPasswordPopup && <UpdatePasswordPopup onClose={handleClosePopup} />}
    </div>
  );
};

export default MainLayout;
