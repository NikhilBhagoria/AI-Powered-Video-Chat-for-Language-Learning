// import React, { useState } from "react";
// import Login from "./components/Login";
// import Matchmaking from "./components/Matchmaking";
// import VideoChat from "./components/VideoChat";

// function App() {
//   const [user, setUser] = useState(null);
//   const [matched, setMatched] = useState(null);

//   if (!user) {
//     return <Login onLogin={setUser} />;
//   }

//   if (!matched) {
//     return <Matchmaking user={user} onMatched={setMatched} />;
//   }

//   return <VideoChat myId={matched.userId} partner={matched.partner} />;
// }

// export default App;

// context api
// import React from 'react';
// import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
// import { AuthProvider } from './context/AuthContext';
// import { SocketProvider } from './context/SocketContext';
// import PrivateRoute from './components/PrivateRoute'
// import Login from './components/Auth/Login';
// import Register from './components/Auth/Register';
// import Dashboard from './components/Dashboard';
// import VideoChat from './components/Chat/VideoChat';

// const App = () => {
//   return (
//     <AuthProvider>
//       <SocketProvider>
//         <Router>
//           <Routes>
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//             <Route
//               path="/dashboard"
//               element={
//                 <PrivateRoute>
//                   <Dashboard />
//                 </PrivateRoute>
//               }
//             />
//             <Route
//               path="/chat/:partnerId"
//               element={
//                 <PrivateRoute>
//                   <VideoChat />
//                 </PrivateRoute>
//               }
//             />
//             <Route path="/" element={<Navigate to="/dashboard" replace />} />
//           </Routes>
//         </Router>
//       </SocketProvider>
//     </AuthProvider>
//   );
// };

// export default App;

// Redux 
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { checkAuthStatus } from './store/slices/authSlice';
import PrivateRoute from './components/PrivateRoute';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';

function App() {
  useEffect(() => {
    store.dispatch(checkAuthStatus());
  }, []);

  return (
    <Provider store={store}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/dashboard"
            element={
              <PrivateRoute>
                <Dashboard />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;