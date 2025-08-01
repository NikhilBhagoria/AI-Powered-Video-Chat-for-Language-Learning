import React, { useState } from 'react';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    nativeLanguage: 'English',
    learningLanguages: ['Spanish']
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("for",formData);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();
    } catch (error) {
      console.error('Registration error:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Register</h2>
      <input
        type="text"
        placeholder="Username"
        value={formData.username}
        onChange={(e) => setFormData({...formData, username: e.target.value})}
      />
      <input
        type="email"
        placeholder="Email"
        value={formData.email}
        onChange={(e) => setFormData({...formData, email: e.target.value})}
      />
      <input
        type="password"
        placeholder="Password"
        value={formData.password}
        onChange={(e) => setFormData({...formData, password: e.target.value})}
      />
      <select
        value={formData.nativeLanguage}
        onChange={(e) => setFormData({...formData, nativeLanguage: e.target.value})}
      >
        <option>English</option>
        <option>Spanish</option>
        <option>French</option>
        <option>German</option>
        <option>Hindi</option>
      </select>
      <button type="submit">Register</button>
    </form>
  );
};

export default Register;