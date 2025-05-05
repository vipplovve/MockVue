const fs = require('fs');
const { AudioContext } = require('web-audio-api');
const audioDecode = require('audio-decode');
const WaveFile = require('wavefile').WaveFile;

// Function to analyze pause and pitch variation
async function analyzeVoiceConfidence(base64Audio) {
  try {
    // Step 1: Decode base64 and save as WAV
    const base64String = base64Audio.replace(/^data:audio\/\w+;base64,/, '');
    const audioBuffer = Buffer.from(base64String, 'base64');
    const wav = new WaveFile(audioBuffer);
    const tempPath = 'temp_audio.wav';
    fs.writeFileSync(tempPath, audioBuffer);

    // Step 2: Load and decode audio
    const audioContext = new AudioContext();
    const audioData = await audioDecode(audioBuffer);
    const sampleRate = audioData.sampleRate;
    const channelData = audioData.getChannelData(0); // Mono channel

    // Step 3: Analyze pauses (using simple energy-based VAD)
    const pauseInfo = detectPauses(channelData, sampleRate);
    const pauseVariationScore = calculatePauseVariationScore(pauseInfo);

    // Step 4: Analyze pitch variation (simplified, using zero-crossing rate as proxy)
    const pitchVariationScore = calculatePitchVariationScore(channelData, sampleRate);

    // Step 5: Combine scores (weighted average)
    const confidenceScore = Math.round(
      0.5 * pauseVariationScore + 0.5 * pitchVariationScore
    );

    // Step 6: Clean up
    fs.unlinkSync(tempPath);

    // Step 7: Return result
    return {
      confidenceScore: confidenceScore, // 0–10
      pauseVariationScore: pauseVariationScore, // 0–10
      pitchVariationScore: pitchVariationScore, // 0–10
      feedback: generateFeedback(confidenceScore, pauseVariationScore, pitchVariationScore)
    };
  } catch (error) {
    console.error('Error analyzing audio:', error);
    return {
      confidenceScore: 0,
      pauseVariationScore: 0,
      pitchVariationScore: 0,
      feedback: ['Error processing audio. Please try again.']
    };
  }
}

// Helper: Detect pauses using energy-based VAD
function detectPauses(channelData, sampleRate) {
  const frameSize = Math.floor(sampleRate * 0.02); // 20ms frames
  const energyThreshold = 0.01; // Energy threshold for silence
  const pauses = [];
  let currentPause = null;

  for (let i = 0; i < channelData.length; i += frameSize) {
    const frame = channelData.slice(i, i + frameSize);
    const energy = frame.reduce((sum, sample) => sum + sample * sample, 0) / frame.length;

    if (energy < energyThreshold) {
      if (!currentPause) {
        currentPause = { start: i / sampleRate, duration: 0 };
      }
      currentPause.duration += frameSize / sampleRate;
    } else {
      if (currentPause && currentPause.duration > 0.1) { // Ignore pauses < 100ms
        pauses.push(currentPause);
      }
      currentPause = null;
    }
  }

  if (currentPause && currentPause.duration > 0.1) {
    pauses.push(currentPause);
  }

  return pauses;
}

// Helper: Calculate pause variation score
function calculatePauseVariationScore(pauses) {
  if (pauses.length === 0) return 8; // No pauses = confident (but not perfect)

  const durations = pauses.map(p => p.duration);
  const meanDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const variance = durations.reduce((sum, d) => sum + (d - meanDuration) ** 2, 0) / durations.length;
  const pauseFrequency = pauses.length;

  // Score: Low variance and moderate frequency = confident
  const varianceScore = Math.max(0, 10 - variance * 20); // High variance reduces score
  const frequencyScore = Math.max(0, 10 - pauseFrequency * 2); // Too many pauses reduces score
  return Math.round((varianceScore + frequencyScore) / 2);
}

// Helper: Calculate pitch variation score (simplified using zero-crossing rate)
function calculatePitchVariationScore(channelData, sampleRate) {
  // Zero-crossing rate as a proxy for pitch variation
  let crossings = 0;
  for (let i = 1; i < channelData.length; i++) {
    if (channelData[i - 1] * channelData[i] < 0) crossings++;
  }
  const zcr = crossings / (channelData.length / sampleRate);

  // Simulate pitch variation (ideal ZCR for speech ~50–200 Hz)
  const zcrValues = [];
  const frameSize = Math.floor(sampleRate * 0.02); // 20ms frames
  for (let i = 0; i < channelData.length; i += frameSize) {
    const frame = channelData.slice(i, i + frameSize);
    let frameCrossings = 0;
    for (let j = 1; j < frame.length; j++) {
      if (frame[j - 1] * frame[j] < 0) frameCrossings++;
    }
    const frameZcr = frameCrossings / (frame.length / sampleRate);
    zcrValues.push(frameZcr);
  }

  const meanZcr = zcrValues.reduce((sum, z) => sum + z, 0) / zcrValues.length;
  const varianceZcr = zcrValues.reduce((sum, z) => sum + (z - meanZcr) ** 2, 0) / zcrValues.length;

  // Score: Moderate variation = confident
  const varianceScore = Math.max(0, 10 - varianceZcr / 10); // High variance reduces score
  return Math.round(varianceScore);
}

// Helper: Generate feedback
function generateFeedback(confidenceScore, pauseVariationScore, pitchVariationScore) {
  const feedback = [];
  if (confidenceScore < 7) {
    feedback.push('Your delivery could be more confident.');
  }
  if (pauseVariationScore < 7) {
    feedback.push('Try maintaining consistent pauses to sound more fluent.');
  }
  if (pitchVariationScore < 7) {
    feedback.push('Work on stabilizing your pitch to convey confidence.');
  }
  if (feedback.length === 0) {
    feedback.push('Great job! Your delivery was confident and steady.');
  }
  return feedback;
}

module.exports = { analyzeVoiceConfidence };