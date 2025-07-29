import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router';
import { loginUser, clearError } from '../../store/slices/authSlice';
import styles from './Login.module.css';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location  =  useLocation();
  const { loading, error, isAuthenticated } = useSelector((state) => state.auth);

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  // Memoize the navigation function to prevent dependency changes
  const navigateToDestination = useCallback(() => {
    const from = location.state?.from?.pathname || '/dashboard';
    navigate(from, { replace: true });
  }, [navigate, location.state?.from?.pathname]);

  useEffect(() => {
    if (isAuthenticated) {
      navigateToDestination();
    }
  }, [isAuthenticated,navigateToDestination]);

  // Clear errors on component unmount only
  useEffect(() => {
    return () => dispatch(clearError());
  }, []);

  const handleChange = (e) => {
    if (error) {
      dispatch(clearError());
    }

    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Basic validation
    if (!formData.email || !formData.password) {
      return;
    }
    dispatch(loginUser(formData));
  };

  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginBox}>
        <h2>Welcome Back</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          {error && <div className={styles.error}>{error}</div>}

          <button 
            type="submit" 
            className={styles.loginButton}
            disabled={loading || !formData.email || !formData.password}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;