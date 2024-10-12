import './App.css';
import AuthLogin from './components/AuthLogin.jsx';
import AuthSignup from './components/AuthSignup.jsx';
import { Routes, Route, useNavigate } from 'react-router-dom';
import AuthRecovery from './components/AuthRecovery.jsx';
import GlobalContainer from './components/GlobalContainer.jsx';
import { useCookies } from 'react-cookie';
import { useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Import Toastify CSS

function App() {
  const navigate = useNavigate();
  const [cookies] = useCookies(['jwt']);

  useEffect(() => {
    const checkAuth = async () => {
      const token = cookies.jwt;
      const currentPath = window.location.pathname;
  
      if (token) {
        try {
          const response = await fetch('http://localhost:5000/verify', {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
  
          if (!response.ok) {
            navigate("/login");
          }
        } catch (error) {
          console.error('Error verifying token:', error);
          navigate("/login");
        }
      } else {
        // Only navigate to login if the current path is not one of the allowed routes
        if (currentPath !== "/login" && currentPath !== "/forgot-password" && currentPath !== "/signup") {
          navigate("/login");
        }
      }
    };
  
    checkAuth();
  }, [cookies, navigate]);
  
  return (<>
    <Routes>
      <Route path="/forgot-password" element={<AuthRecovery />} />
      <Route path="/login" element={<AuthLogin />} />
      <Route path="/signup" element={<AuthSignup />} />
      <Route path="/*" element={<GlobalContainer />} />
    </Routes>
    <ToastContainer 
    position="top-right" 
    autoClose={5000} 
    hideProgressBar={false} 
    closeOnClick 
    pauseOnHover 
    draggable 
    theme="light" 
  />
  </>
  );
}

export default App;
