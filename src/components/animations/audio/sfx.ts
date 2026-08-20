import { ZZFX } from "zzfx";

export type SfxParams = readonly number[];

let session: { ctx: AudioContext; master: MediaStreamAudioDestinationNode } | null =
  null;

export function createAudioSession(): {
  ctx: AudioContext;
  master: MediaStreamAudioDestinationNode;
} {
  const ctx = new AudioContext();
  const master = ctx.createMediaStreamDestination();
  session = { ctx, master };
  return session;
}

export async function unlockAudio(): Promise<void> {
  const { ctx } = session ?? createAudioSession();
  if (ctx.state !== "running") {
    try {
      await ctx.resume();
    } catch (err) {
      console.warn("No se pudo reanudar el AudioContext:", err);
    }
  }
}

export function getAudioStream(): MediaStream | null {
  return session?.master.stream ?? null;
}

export function playSfx(
  params: SfxParams,
  volume = 1,
  when = 0,
): AudioBufferSourceNode | null {
  if (!session) return null;
  const { ctx, master } = session;
  if (ctx.state !== "running") return null;
  const samples = ZZFX.buildSamples(...params);
  const buffer = ctx.createBuffer(1, samples.length, ZZFX.sampleRate);
  buffer.getChannelData(0).set(samples);
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  const gain = ctx.createGain();
  gain.gain.value = ZZFX.volume * volume;
  source.connect(gain);
  gain.connect(master);
  gain.connect(ctx.destination);
  source.start(ctx.currentTime + when);
  return source;
}

export const SFX = {
  send: [0.5, 0.05, 620, 0.01, 0.1, 0.3, 2, 0.4, -300, 0, 0, 0, 0, 0, 60, 0, 0, 0.7, 0, 0],
  recv: [0.5, 0.05, 900, 0.01, 0.06, 0.25, 2, -0.4, 500, 0, 0, 0, 0, 0, -80, 0, 0, 0.9, 0, 0],
  blocked: [0.45, 0, 160, 0.02, 0.12, 0.28, 0, 1, 0, 0, 0, 0, 0, 0.4, 0, 0, 0, 1, 0, 0],
  click: [0.3, 0.1, 700, 0.01, 0.02, 0.06, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0.8, 0, 0],
  open: [0.4, 0.05, 520, 0.01, 0.08, 0.25, 2, 0.6, 260, 0, 0, 0, 0, 0, -60, 0, 0, 0.8, 0, 0],
  close: [0.4, 0.05, 380, 0.01, 0.06, 0.3, 2, -0.5, -180, 0, 0, 0, 0, 0, 40, 0, 0, 0.8, 0, 0],
  error: [0.5, 0, 140, 0.02, 0.1, 0.35, 0, 1, 0, 0, 0, 0, 0, 0.5, 0, 0, 0, 1, 0, 0],
} as const;