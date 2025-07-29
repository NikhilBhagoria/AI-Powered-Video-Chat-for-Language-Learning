import React, { useEffect, useRef, useState } from 'react';
import { Navigate, useLocation } from 'react-router';
import { useSelector, useDispatch } from 'react-redux';
import { checkAuthStatus } from '../store/slices/authSlice'; // Import your auth check action

const PrivateRoute = ({ children }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const [isChecking, setIsChecking] = useState(true);
  const hasCheckedRef = useRef(false);
  const { loading, user, isAuthenticated, initialized, token } = useSelector((state) => state.auth);

  // useEffect(() => {
  //   const checkAuth = async () => {
  //     try {
  //       await dispatch(checkAuthStatus()).unwrap();
  //     } catch (error) {
  //       console.error('Auth check failed:', error);
  //     } finally {
  //       setIsChecking(false);
  //     }
  //   };

  //   if (!isAuthenticated && !user) {
  //     checkAuth();
  //   } else {
  //     setIsChecking(false);
  //   }
  // }, [dispatch, isAuthenticated, user]);

  useEffect(() => {
    // Only check auth if not initialized and there's a token
    if (!hasCheckedRef.current && !initialized && token) {
      hasCheckedRef.current = true;
      dispatch(checkAuthStatus());
    } 
    // else if (!initialized && !token) {
    //   // If no token and not initialized, mark as initialized to avoid infinite loop
    //   dispatch({ type: 'auth/setInitialized' });
    // }
  }, []);

  // Show loading state while checking authentication
  if (loading || (!initialized && token)) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  // If no token or not authenticated after check, redirect to login
  if (!token || (!isAuthenticated && initialized)) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If we have a token but haven't verified it yet, and we're not loading
  if (token && !initialized && !loading) {
    return (
      <div className="loading-screen">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  return children;
};

export default PrivateRoute;