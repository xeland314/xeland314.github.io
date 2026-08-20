declare module "zzfx" {
  export const ZZFX: {
    volume: number;
    sampleRate: number;
    audioContext: AudioContext;
    buildSamples: (...parameters: number[]) => Float32Array;
    play: (...parameters: number[]) => AudioBufferSourceNode;
    playSamples: (
      sampleChannels: Float32Array[],
      volumeScale?: number,
      rate?: number,
      pan?: number,
      loop?: boolean,
    ) => AudioBufferSourceNode;
  };
  export function zzfx(...parameters: number[]): AudioBufferSourceNode;
}