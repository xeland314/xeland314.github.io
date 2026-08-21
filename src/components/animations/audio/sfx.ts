import { ZZFX } from "zzfx";

export type SfxParams = readonly number[];

let session: {
  ctx: AudioContext;
  master: MediaStreamAudioDestinationNode;
} | null = null;

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
  // Envío: subida rápida, ligera y tecnológica
  send: [
    0.35, 0.04, 520, 0.005, 0.08, 0.18, 2, 0.35, 180, 0, 0, 0, 0, 0, 40, 0, 0,
    0.65, 0, 0,
  ],

  // Recepción: más agudo y agradable que send
  recv: [
    0.38, 0.04, 760, 0.005, 0.09, 0.22, 2, 0.45, 260, 0, 0, 0, 0, 0, -50, 0, 0,
    0.7, 0, 0,
  ],

  // Bloqueado: golpe corto, grave y seco
  blocked: [
    0.32, 0.01, 180, 0.005, 0.09, 0.16, 0, 0.8, -80, 0, 0, 0, 0, 0.25, 0, 0, 0,
    0.75, 0, 0,
  ],

  // Click: muy corto para poder repetirse muchas veces
  click: [
    0.22, 0.02, 680, 0.002, 0.015, 0.045, 2, 0.7, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0.6, 0, 0,
  ],

  // Apertura: pequeño "pop" ascendente
  open: [
    0.32, 0.035, 440, 0.005, 0.09, 0.2, 2, 0.5, 220, 0, 0, 0, 0, 0, -40, 0, 0,
    0.7, 0, 0,
  ],

  // Cierre: movimiento descendente
  close: [
    0.32, 0.035, 500, 0.005, 0.08, 0.2, 2, -0.5, -220, 0, 0, 0, 0, 0, 40, 0, 0,
    0.7, 0, 0,
  ],

  // Error: dos componentes: grave + textura ligeramente áspera
  error: [
    0.38, 0.01, 145, 0.008, 0.12, 0.22, 0, 0.75, 0, 0, 0, 0, 0, 0.35, 0, 0, 0,
    0.8, 0, 0,
  ],
} as const;
