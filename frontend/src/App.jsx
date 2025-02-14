import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './App.css'
import Login from './pages/Login'
import StudentDashboard from './pages/student/StudentDashboard';
import MainLayout from './components/Layout';

// For debugging purposes
console.log('MainLayout:', MainLayout);
console.log('Login:', Login);
console.log('StudentDashboard:', StudentDashboard);

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { 
        path: "/", // or index: true
        element: <StudentDashboard /> 
      },
      { 
        path: "login", 
        element: <Login />,
      },
      { 
        path: "dashboard", 
        element: <StudentDashboard /> 
      },
    ],
  },
]);

function App() {
  return (
    <RouterProvider router={appRouter} />
  )
}

export default App