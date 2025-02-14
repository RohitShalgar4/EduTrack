import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'
import SideBar from './Sidebar';

const MainLayout = () => {
  return (
    <div className="flex min-h-screen">
      <SideBar />  
      <div className="flex flex-col flex-grow">
        <Navbar />
        <div className="flex-1 mt-16 p-4">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default MainLayout;
