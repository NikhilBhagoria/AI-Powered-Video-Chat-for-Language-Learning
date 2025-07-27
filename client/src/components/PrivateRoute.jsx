import React from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSelector } from 'react-redux';

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const {loading ,user, isAuthenticated} = useSelector((state) => state.auth)

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If not authenticated, redirect to login
  // Save the attempted URL for redirecting after login
  if (!user || !isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated, render the protected component
  return children;
};

export default PrivateRoute;