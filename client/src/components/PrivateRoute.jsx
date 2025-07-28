import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuthStatus } from '../store/slices/authSlice'; // Import your auth check action

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(true);
  const { loading, user, isAuthenticated } = useSelector((state) => state.auth);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await dispatch(checkAuthStatus()).unwrap();
      } catch (error) {
        console.error('Auth check failed:', error);
      } finally {
        setIsChecking(false);
      }
    };

    if (!isAuthenticated && !user) {
      checkAuth();
    } else {
      setIsChecking(false);
    }
  }, [dispatch, isAuthenticated, user]);

  // Show loading state while checking authentication
  if (loading || isChecking) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default PrivateRoute;