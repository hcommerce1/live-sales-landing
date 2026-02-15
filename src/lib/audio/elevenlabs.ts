/**
 * ElevenLabs TTS Client
 *
 * Generates speech audio from text using ElevenLabs API.
 * Supports chunked generation for long articles.
 */

const API_BASE = 'https://api.elevenlabs.io/v1';

function getApiKey(): string | undefined {
  return typeof import.meta !== 'undefined' && import.meta.env?.ELEVENLABS_API_KEY
    ? import.meta.env.ELEVENLABS_API_KEY
    : process.env.ELEVENLABS_API_KEY;
}

function getVoiceId(): string {
  const id = typeof import.meta !== 'undefined' && import.meta.env?.ELEVENLABS_VOICE_ID
    ? import.meta.env.ELEVENLABS_VOICE_ID
    : process.env.ELEVENLABS_VOICE_ID;
  return id || '21m00Tcm4TlvDq8ikWAM'; // Default: Rachel (good for Polish too)
}

export interface TTSOptions {
  text: string;
  voiceId?: string;
  modelId?: string;
  stability?: number;
  similarityBoost?: number;
}

/**
 * Generate speech audio for a single text chunk.
 * Returns audio as ArrayBuffer (MP3 format).
 */
export async function generateSpeech(options: TTSOptions): Promise<ArrayBuffer> {
  const apiKey = getApiKey();
  if (!apiKey) {
    throw new Error('ELEVENLABS_API_KEY not configured');
  }

  const voiceId = options.voiceId || getVoiceId();

  const response = await fetch(`${API_BASE}/text-to-speech/${voiceId}`, {
    method: 'POST',
    headers: {
      'xi-api-key': apiKey,
      'Content-Type': 'application/json',
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text: options.text,
      model_id: options.modelId || 'eleven_multilingual_v2',
      voice_settings: {
        stability: options.stability ?? 0.5,
        similarity_boost: options.similarityBoost ?? 0.75,
      },
    }),
  });

  if (!response.ok) {
    const error = await response.text().catch(() => 'Unknown error');
    throw new Error(`ElevenLabs API error (${response.status}): ${error}`);
  }

  return response.arrayBuffer();
}

/**
 * Generate speech for multiple text chunks and concatenate.
 * Returns a single MP3 ArrayBuffer.
 */
export async function generateSpeechChunked(chunks: string[]): Promise<ArrayBuffer> {
  const audioBuffers: ArrayBuffer[] = [];

  for (const chunk of chunks) {
    const audio = await generateSpeech({ text: chunk });
    audioBuffers.push(audio);
  }

  // Simple concatenation of MP3 buffers (works for MP3 format)
  const totalLength = audioBuffers.reduce((sum, buf) => sum + buf.byteLength, 0);
  const combined = new Uint8Array(totalLength);
  let offset = 0;

  for (const buf of audioBuffers) {
    combined.set(new Uint8Array(buf), offset);
    offset += buf.byteLength;
  }

  return combined.buffer;
}

/**
 * Estimate audio duration based on text length.
 * Average speaking rate: ~150 words/min in Polish.
 */
export function estimateDuration(text: string): number {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil((words / 150) * 60); // seconds
}
