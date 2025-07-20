import React, { useState } from "react";

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("");
  return (
    <div>
      <h2>Login</h2>
      <input
        placeholder="Enter username"
        value={username}
        onChange={e => setUsername(e.target.value)}
      />
      <button onClick={() => onLogin(username)}>Login</button>
    </div>
  );
}