import React, { useState, useRef, useEffect } from 'react';
import './RippleComponent.css';

const RippleComponent = () => {
  const [isRecording, setIsRecording] = useState(false);
  const rippleContainerRef = useRef(null);
  const lastRippleTimeRef = useRef(0);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const streamRef = useRef(null);

  // Adjusted threshold to reduce sensitivity
  const threshold = 0.05; // Increased from a lower value (e.g., 0.005) to 0.05
  const cooldown = 200; 

  useEffect(() => {
    if (isRecording) {
      startRecording();
    } else {
      stopRecording();
    }
    return () => stopRecording();
  }, [isRecording]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 512;
      analyserRef.current = analyser;

      source.connect(analyser);
      analyze();
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
  };

  const analyze = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);
    analyser.getByteTimeDomainData(dataArray);

    // Calculate RMS (audio amplitude)
    let sum = 0;
    for (let i = 0; i < bufferLength; i++) {
      const sample = (dataArray[i] - 128) / 128;
      sum += sample * sample;
    }
    const rms = Math.sqrt(sum / bufferLength);

    // Log RMS for debugging (optional)
    console.log('RMS:', rms);

    const now = performance.now();
    if (rms > threshold && now - lastRippleTimeRef.current > cooldown) {
      const maxRms = 0.3; // Max RMS for loud voices
      const minScale = 1.0; // Small ripple
      const maxScale = 5.0; // Large ripple
      const minOpacity = 0.1; // Light ripple
      const maxOpacity = 1.0; // Dark ripple

      // Normalize RMS and calculate ripple properties
      const normalizedRms = Math.min(1, rms / maxRms);
      const rippleMaxScale = minScale + normalizedRms * (maxScale - minScale);
      const rippleInitialOpacity = minOpacity + normalizedRms * (maxOpacity - minOpacity);

      createRipple(rippleMaxScale, rippleInitialOpacity);
      lastRippleTimeRef.current = now;
    }

    animationFrameRef.current = requestAnimationFrame(analyze);
  };

  const createRipple = (maxScale, initialOpacity) => {
    const ripple = document.createElement('div');
    ripple.classList.add('ripple');
    ripple.style.setProperty('--max-scale', maxScale);
    ripple.style.setProperty('--initial-opacity', initialOpacity);
    rippleContainerRef.current.appendChild(ripple);

    ripple.addEventListener('animationend', () => {
      ripple.remove();
    });
  };

  return (
    <div>
      <button onClick={() => setIsRecording(!isRecording)}>
        {isRecording ? 'Stop Recording' : 'Start Recording'}
      </button>
      <div className="image-container">
        <img
          src="data:image/jpeg;base64,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"
          className="user-image"
          alt="User"
        />
        <div ref={rippleContainerRef} className="ripple-container"></div>
      </div>
    </div>
  );
};

export default RippleComponent;