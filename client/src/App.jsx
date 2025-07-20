import React, { useState } from "react";
import Login from "./components/Login";
import Matchmaking from "./components/Matchmaking";
import VideoChat from "./components/VideoChat";

function App() {
  const [user, setUser] = useState(null);
  const [matched, setMatched] = useState(null);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  if (!matched) {
    return <Matchmaking user={user} onMatched={setMatched} />;
  }

  return <VideoChat myId={matched.userId} partner={matched.partner} />;
}

export default App;