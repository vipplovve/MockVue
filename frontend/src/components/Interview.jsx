import React, { useEffect, useState, useRef } from "react";
import io from "socket.io-client";

const Interview = () => {
  const [voiceId, setVoiceId] = useState("Joanna");
  const audioContextRef = useRef(null);
  const scriptProcessorRef = useRef(null);
  const socketRef = useRef(null);
  const mediaStreamSourceRef = useRef(null);

  useEffect(() => {

    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
    }

    if (!socketRef.current) {
      const newSocket = io("http://localhost:5000", { query: { voiceId } });
      socketRef.current = newSocket;

      newSocket.on("tts-chunk", async ({ audio }) => {
        if (!audioContextRef.current) {
          console.error("AudioContext is not initialized!");
          return;
        }

        try {
          const arrayBuffer = Uint8Array.from(atob(audio), (c) =>
            c.charCodeAt(0)
          ).buffer;
          const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContextRef.current.destination);
          source.start();

          source.onended = () => {
            if (!scriptProcessorRef.current) {
              startRecording();
            }
          };
        } catch (err) {
          console.error("Error decoding audio data:", err);
        }
      });

      newSocket.on("interview-end", () => {
        alert("Interview completed!");
        stopRecording();
      });

      return () => {
        newSocket.disconnect();
        socketRef.current = null;
        stopRecording();
      };
    }
  }, []);

  const startRecording = async () => {
    
  };
  
  const stopRecording = () => {
   
  };

  const startInterview = () => {
    if (!socketRef.current) {
      console.error("Socket not initialized!");
      return;
    }
    socketRef.current.emit("start-interview", { voiceId });
  };

  return (
    <div>
      <h1>AI Interview</h1>
      <select value={voiceId} onChange={(e) => setVoiceId(e.target.value)}>
        <option value="Joanna">US Female (Joanna)</option>
        <option value="Matthew">US Male (Matthew)</option>
        <option value="Amy">British Female (Amy)</option>
        <option value="Brian">British Male (Brian)</option>
      </select>
      <button onClick={startInterview}>Start Interview</button>
    </div>
  );
};


export default Interview;
