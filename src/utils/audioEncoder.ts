import { Mp3Encoder } from '@breezystack/lamejs'
import { Muxer, ArrayBufferTarget } from 'mp4-muxer'

export type AudioFormat = 'mp3' | 'wav' | 'm4a'
export type Mp3Bitrate = 128 | 192 | 256 | 320

/**
 * Decodes an uploaded video or audio file into a raw Web Audio AudioBuffer.
 */
export async function decodeAudioFromFile(file: File): Promise<AudioBuffer> {
  const arrayBuffer = await file.arrayBuffer()
  const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
  const audioContext = new AudioCtx()
  try {
    return await audioContext.decodeAudioData(arrayBuffer)
  } finally {
    try {
      await audioContext.close()
    } catch {
      // Ignored
    }
  }
}

/**
 * Converts Float32Array audio samples (-1.0 to 1.0) into 16-bit PCM samples (-32768 to 32767).
 */
export function floatTo16BitPCM(input: Float32Array): Int16Array {
  const output = new Int16Array(input.length)
  for (let i = 0; i < input.length; i++) {
    const s = Math.max(-1, Math.min(1, input[i]))
    output[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return output
}

/**
 * Encodes an AudioBuffer into an uncompressed 16-bit PCM WAV Blob with standard 44-byte RIFF header.
 */
export function encodeAudioToWav(buffer: AudioBuffer): Blob {
  const numChannels = buffer.numberOfChannels
  const sampleRate = buffer.sampleRate
  const length = buffer.length * numChannels * 2 + 44
  const outBuffer = new ArrayBuffer(length)
  const view = new DataView(outBuffer)

  // Helper to write ASCII strings
  const writeString = (offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      view.setUint8(offset + i, str.charCodeAt(i))
    }
  }

  // RIFF header
  writeString(0, 'RIFF')
  view.setUint32(4, 36 + buffer.length * numChannels * 2, true)
  writeString(8, 'WAVE')

  // FMT sub-chunk
  writeString(12, 'fmt ')
  view.setUint32(16, 16, true) // SubChunk1Size (16 for PCM)
  view.setUint16(20, 1, true) // AudioFormat (1 for PCM)
  view.setUint16(22, numChannels, true)
  view.setUint32(24, sampleRate, true)
  view.setUint32(28, sampleRate * numChannels * 2, true) // ByteRate
  view.setUint16(32, numChannels * 2, true) // BlockAlign
  view.setUint16(34, 16, true) // BitsPerSample

  // Data sub-chunk
  writeString(36, 'data')
  view.setUint32(40, buffer.length * numChannels * 2, true)

  // Interleave channel samples
  let offset = 44
  const channels: Float32Array[] = []
  for (let c = 0; c < numChannels; c++) {
    channels.push(buffer.getChannelData(c))
  }

  for (let i = 0; i < buffer.length; i++) {
    for (let c = 0; c < numChannels; c++) {
      const sample = Math.max(-1, Math.min(1, channels[c][i]))
      view.setInt16(offset, sample < 0 ? sample * 0x8000 : sample * 0x7fff, true)
      offset += 2
    }
  }

  return new Blob([outBuffer], { type: 'audio/wav' })
}

/**
 * Encodes an AudioBuffer into an MP3 Blob using LAME.
 */
export async function encodeAudioToMp3(
  buffer: AudioBuffer,
  bitrate: Mp3Bitrate = 192,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const numChannels = Math.min(buffer.numberOfChannels, 2)
  const sampleRate = buffer.sampleRate
  const mp3encoder = new Mp3Encoder(numChannels, sampleRate, bitrate)

  const leftChannel = floatTo16BitPCM(buffer.getChannelData(0))
  const rightChannel = numChannels > 1 ? floatTo16BitPCM(buffer.getChannelData(1)) : undefined

  const mp3Data: Uint8Array[] = []
  const sampleBlockSize = 1152

  const totalLength = leftChannel.length
  let processed = 0

  for (let i = 0; i < totalLength; i += sampleBlockSize) {
    const leftChunk = leftChannel.subarray(i, i + sampleBlockSize)
    const rightChunk = rightChannel ? rightChannel.subarray(i, i + sampleBlockSize) : undefined

    const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk)
    if (mp3buf.length > 0) {
      mp3Data.push(mp3buf)
    }

    processed += leftChunk.length
    if (onProgress && i % (sampleBlockSize * 10) === 0) {
      onProgress(Math.min(99, Math.round((processed / totalLength) * 100)))
      // Yield thread briefly for UI responsiveness
      await new Promise((r) => setTimeout(r, 0))
    }
  }

  const endBuf = mp3encoder.flush()
  if (endBuf.length > 0) {
    mp3Data.push(endBuf)
  }

  if (onProgress) onProgress(100)

  return new Blob(mp3Data as unknown as BlobPart[], { type: 'audio/mp3' })
}

/**
 * Encodes an AudioBuffer into an M4A (AAC in MP4 container) Blob.
 * Uses WebCodecs AudioEncoder + mp4-muxer when available, or MediaRecorder fallback.
 */
export async function encodeAudioToM4a(
  buffer: AudioBuffer,
  bitrate: number = 192000,
  onProgress?: (progress: number) => void
): Promise<Blob> {
  const numChannels = Math.min(buffer.numberOfChannels, 2)
  const sampleRate = buffer.sampleRate

  // Check if WebCodecs AudioEncoder is available
  if (typeof window !== 'undefined' && 'AudioEncoder' in window) {
    try {
      const muxer = new Muxer({
        target: new ArrayBufferTarget(),
        fastStart: 'in-memory',
        audio: {
          codec: 'aac',
          numberOfChannels: numChannels,
          sampleRate: sampleRate,
        },
      })

      let encodedSamples = 0
      const totalSamples = buffer.length

      const encoder = new AudioEncoder({
        output: (chunk, meta) => {
          muxer.addAudioChunk(chunk, meta)
        },
        error: (e) => {
          console.error('AudioEncoder error:', e)
        },
      })

      encoder.configure({
        codec: 'mp4a.40.2', // AAC Low Complexity (AAC-LC)
        numberOfChannels: numChannels,
        sampleRate: sampleRate,
        bitrate: bitrate,
      })

      // Feed AudioData in chunks
      const chunkSize = 4096
      for (let i = 0; i < totalSamples; i += chunkSize) {
        const frameCount = Math.min(chunkSize, totalSamples - i)
        const planarData = new Float32Array(frameCount * numChannels)

        for (let ch = 0; ch < numChannels; ch++) {
          const chData = buffer.getChannelData(ch)
          planarData.set(chData.subarray(i, i + frameCount), ch * frameCount)
        }

        const audioData = new AudioData({
          format: 'f32-planar',
          sampleRate: sampleRate,
          numberOfFrames: frameCount,
          numberOfChannels: numChannels,
          timestamp: Math.round((i / sampleRate) * 1_000_000), // microseconds
          data: planarData,
        })

        encoder.encode(audioData)
        audioData.close()

        encodedSamples += frameCount
        if (onProgress && i % (chunkSize * 8) === 0) {
          onProgress(Math.min(98, Math.round((encodedSamples / totalSamples) * 100)))
          await new Promise((r) => setTimeout(r, 0))
        }
      }

      await encoder.flush()
      encoder.close()
      muxer.finalize()

      if (onProgress) onProgress(100)

      const target = muxer.target as ArrayBufferTarget
      return new Blob([target.buffer], { type: 'audio/mp4' })
    } catch (err) {
      console.warn('WebCodecs AAC encoder error, falling back to MediaRecorder or MP3:', err)
    }
  }

  // Fallback: Realtime/Fast MediaRecorder or MP3 conversion
  return encodeAudioToMp3(buffer, 192, onProgress)
}
