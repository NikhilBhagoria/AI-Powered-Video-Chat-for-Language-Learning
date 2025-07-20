import React, { useState, useRef } from "react";

export default function Matchmaking({ user, onMatched }) {
  const [native, setNative] = useState("English");
  const [learning, setLearning] = useState("Spanish");
  const [status, setStatus] = useState("");
  const [searching, setSearching] = useState(false);
  const userIdRef = useRef(null);

  // Generate a unique userId for this session
  if (!userIdRef.current) {
    userIdRef.current = user + "_" + Math.floor(Math.random() * 1000000);
  }
  const userId = userIdRef.current;
  const socketId = userId; // For demo, use same as userId

  // Polling function to repeatedly try matchmaking
  const pollForMatch = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/matchmaking/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          nativeLanguage: native,
          learningLanguage: learning,
          socketId,
        }),
      });
      const data = await res.json();
      if (data.matched) {
        setStatus("Matched! Connecting...");
        setSearching(false);
        onMatched({
          partner: data.partner,
          userId,
          native,
          learning,
        });
      } else {
        setStatus("Waiting for partner...");
        setTimeout(() => {
          // Only continue polling if still searching
          if (searching) pollForMatch();
        }, 3000);
      }
    } catch (err) {
      setStatus("Error connecting to server.");
      setSearching(false);
    }
  };

  const joinQueue = () => {
    setStatus("Searching...");
    setSearching(true);
    pollForMatch();
  };

  // Optionally let users leave queue (not required for basic MVP)
  const leaveQueue = async () => {
    setSearching(false);
    setStatus("Left matchmaking queue.");
    await fetch(`${process.env.REACT_APP_API_URL}/matchmaking/leave`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    });
  };

  return (
    <div style={{ maxWidth: 350, margin: "0 auto" }}>
      <h2>Find a Language Partner</h2>
      <label>
        <div>Your native language:</div>
        <select value={native} onChange={e => setNative(e.target.value)} disabled={searching}>
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
          <option>German</option>
          <option>Hindi</option>
        </select>
      </label>
      <br />
      <label>
        <div>Language you want to learn:</div>
        <select value={learning} onChange={e => setLearning(e.target.value)} disabled={searching}>
          <option>English</option>
          <option>Spanish</option>
          <option>French</option>
          <option>German</option>
          <option>Hindi</option>
        </select>
      </label>
      <br />
      <button onClick={joinQueue} disabled={searching}>Find Partner</button>
      {searching && (
        <button onClick={leaveQueue} style={{ marginLeft: 8 }}>Leave Queue</button>
      )}
      <p>{status}</p>
    </div>
  );
}