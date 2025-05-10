const fs = require('fs');
const { AudioContext } = require('web-audio-api');
const audioDecode = require('audio-decode');
const WaveFile = require('wavefile').WaveFile;

async function analyzeVoiceConfidence(base64Audio) {
  try {
    const base64String = base64Audio.replace(/^data:audio\/\w+;base64,/, '');
    const audioBuffer = Buffer.from(base64String, 'base64');
    const wav = new WaveFile(audioBuffer);
    const tempPath = 'temp_audio.wav';
    fs.writeFileSync(tempPath, audioBuffer);

    const audioContext = new AudioContext();
    const audioData = await audioDecode(audioBuffer);
    const sampleRate = audioData.sampleRate;
    const channelData = audioData.getChannelData(0);

    const pauseInfo = detectPauses(channelData, sampleRate);
    const pauseVariationScore = calculatePauseVariationScore(pauseInfo);
    const pitchVariationScore = calculatePitchVariationScore(channelData, sampleRate);
    const confidenceScore = Math.round(
      0.5 * pauseVariationScore + 0.5 * pitchVariationScore
    );

    fs.unlinkSync(tempPath);

    return {
      confidenceScore: confidenceScore,
      pauseVariationScore: pauseVariationScore,
      pitchVariationScore: pitchVariationScore,
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

function detectPauses(channelData, sampleRate) {
  const frameSize = Math.floor(sampleRate * 0.02);
  const energyThreshold = 0.01;
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
      if (currentPause && currentPause.duration > 0.1) {
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

function calculatePauseVariationScore(pauses) {
  if (pauses.length === 0) return 8;

  const durations = pauses.map(p => p.duration);
  const meanDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
  const variance = durations.reduce((sum, d) => sum + (d - meanDuration) ** 2, 0) / durations.length;
  const pauseFrequency = pauses.length;

  const varianceScore = Math.max(0, 10 - variance * 20);
  const frequencyScore = Math.max(0, 10 - pauseFrequency * 2);
  return Math.round((varianceScore + frequencyScore) / 2);
}

function calculatePitchVariationScore(channelData, sampleRate) {
  let crossings = 0;
  for (let i = 1; i < channelData.length; i++) {
    if (channelData[i - 1] * channelData[i] < 0) crossings++;
  }
  const zcr = crossings / (channelData.length / sampleRate);

  const zcrValues = [];
  const frameSize = Math.floor(sampleRate * 0.02);
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

  const varianceScore = Math.max(0, 10 - varianceZcr / 10);
  return Math.round(varianceScore);
}

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
