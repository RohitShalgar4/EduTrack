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
    <div className="flex h-screen bg-gray-50">
      <SideBar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4">
          <Outlet />
        </main>
      </div>
      {showPasswordPopup && <UpdatePasswordPopup onClose={handleClosePopup} />}
    </div>
  );
};

export default MainLayout;
