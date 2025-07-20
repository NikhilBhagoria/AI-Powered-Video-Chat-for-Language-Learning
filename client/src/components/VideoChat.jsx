import React, { useRef, useState, useEffect } from "react";
import { translateText, correctText } from "../api";
import Peer from "peerjs";

export default function VideoChat({ myId, partner }) {
  const [conn, setConn] = useState(null);
  const [message, setMessage] = useState("");
  const [aiResult, setAiResult] = useState("");
  const [targetLang, setTargetLang] = useState(partner.learningLanguage || "Spanish");

  const myVideo = useRef();
  const remoteVideo = useRef();
  const [peer, setPeer] = useState(null);

  // Initialize PeerJS
  useEffect(() => {
    const newPeer = new Peer(myId);
    setPeer(newPeer);

    newPeer.on("open", (id) => {
      // Do nothing, just log id
    });

    newPeer.on("call", (call) => {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        myVideo.current.srcObject = stream;
        call.answer(stream);
        call.on("stream", (remoteStream) => {
          remoteVideo.current.srcObject = remoteStream;
        });
      });
    });

    newPeer.on("connection", (connection) => {
      setConn(connection);
      connection.on("data", (data) => {
        setAiResult(`Partner: ${data}`);
      });
    });

    // If I'm the one initiating (myId !== partner.socketId)
    if (myId !== partner.socketId) {
      navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
        myVideo.current.srcObject = stream;
        const call = newPeer.call(partner.socketId, stream);
        call.on("stream", (remoteStream) => {
          remoteVideo.current.srcObject = remoteStream;
        });
      });
      const connection = newPeer.connect(partner.socketId);
      setConn(connection);
      connection.on("data", (data) => {
        setAiResult(`Partner: ${data}`);
      });
    }

    return () => newPeer.destroy();
    // eslint-disable-next-line
  }, []);

  // Send message + AI translation/correction
  const sendMessage = async () => {
    if (conn && message) {
      conn.send(message);
      setAiResult("...");
      const translation = await translateText(message, targetLang);
      const correction = await correctText(message, targetLang);
      setAiResult(`Translation: ${translation}\nCorrection: ${correction}`);
      setMessage("");
    }
  };

  return (
    <div>
      <h2>Video Chat</h2>
      <div>Your ID: <b>{myId}</b></div>
      <div>Partner ID: <b>{partner.socketId}</b></div>
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <video ref={myVideo} autoPlay muted width={250} height={200} style={{ border: "1px solid #ccc" }} />
        <video ref={remoteVideo} autoPlay width={250} height={200} style={{ border: "1px solid #ccc" }} />
      </div>
      <div style={{ marginTop: 20 }}>
        <input
          placeholder="Type message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <select value={targetLang} onChange={e => setTargetLang(e.target.value)}>
          <option>Spanish</option>
          <option>French</option>
          <option>German</option>
          <option>Hindi</option>
          <option>English</option>
        </select>
        <button onClick={sendMessage}>Send</button>
      </div>
      <pre>{aiResult}</pre>
    </div>
  );
}