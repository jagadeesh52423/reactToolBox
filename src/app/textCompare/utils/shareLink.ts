import { DiffOptions } from '../models/DiffModels';

export interface ShareState {
  leftText: string;
  rightText: string;
  options: DiffOptions;
}

export type ShareEncodeResult = { ok: true; hash: string } | { ok: false; reason: 'unsupported' | 'too-large' };

const SHARE_HASH_PREFIX = 'share=';

// Combined raw character count above which we refuse to even attempt compression —
// keeps the (async, main-thread) gzip step bounded and avoids building a multi-MB URL.
const MAX_SHARE_SOURCE_CHARS = 500_000;
// Safety net on the final base64url payload in case content compresses poorly (e.g.
// high-entropy text) — real-world text compresses far below this.
const MAX_SHARE_HASH_CHARS = 100_000;

function isCompressionSupported(): boolean {
  return typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';
}

function bufferToBase64Url(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBuffer(value: string): ArrayBuffer {
  let base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4 !== 0) {
    base64 += '=';
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// `writer.write`/`writer.close` and the read side can each reject independently (e.g.
// malformed gzip errors both ends of the stream). Both promises are handed to
// Promise.all in the SAME tick they're created, so each gets a rejection handler
// attached immediately — awaiting them one at a time would leave the second one
// (created but not yet awaited) an orphaned, unhandled rejection once the first throws.
async function gzipToBase64Url(input: string): Promise<string> {
  const stream = new CompressionStream('gzip');
  const writer = stream.writable.getWriter();
  const readPromise = new Response(stream.readable).arrayBuffer();
  const writePromise = (async () => {
    await writer.write(new TextEncoder().encode(input));
    await writer.close();
  })();
  const [buffer] = await Promise.all([readPromise, writePromise]);
  return bufferToBase64Url(buffer);
}

async function gunzipFromBase64Url(value: string): Promise<string> {
  const stream = new DecompressionStream('gzip');
  const writer = stream.writable.getWriter();
  const readPromise = new Response(stream.readable).arrayBuffer();
  const writePromise = (async () => {
    await writer.write(new Uint8Array(base64UrlToBuffer(value)));
    await writer.close();
  })();
  const [buffer] = await Promise.all([readPromise, writePromise]);
  return new TextDecoder().decode(buffer);
}

/**
 * Compresses both texts + options into a URL-hash-safe payload via native gzip — no
 * dependency. Never sent to a server since it lives in the hash, not a query param.
 */
export async function encodeShareState(state: ShareState): Promise<ShareEncodeResult> {
  if (typeof window === 'undefined' || !isCompressionSupported()) {
    return { ok: false, reason: 'unsupported' };
  }
  if (state.leftText.length + state.rightText.length > MAX_SHARE_SOURCE_CHARS) {
    return { ok: false, reason: 'too-large' };
  }

  try {
    const payload = JSON.stringify({ l: state.leftText, r: state.rightText, o: state.options });
    const compressed = await gzipToBase64Url(payload);
    if (compressed.length > MAX_SHARE_HASH_CHARS) {
      return { ok: false, reason: 'too-large' };
    }
    return { ok: true, hash: `${SHARE_HASH_PREFIX}${compressed}` };
  } catch {
    return { ok: false, reason: 'unsupported' };
  }
}

/**
 * Decodes a `window.location.hash` value (with or without the leading '#') produced by
 * `encodeShareState`. Returns null on anything unexpected — unsupported browser, a hash
 * left over from something else, or corrupt/truncated data — never throws.
 */
export async function decodeShareState(hash: string): Promise<ShareState | null> {
  if (typeof window === 'undefined' || !isCompressionSupported()) return null;

  const cleaned = hash.startsWith('#') ? hash.slice(1) : hash;
  if (!cleaned.startsWith(SHARE_HASH_PREFIX)) return null;
  const encoded = cleaned.slice(SHARE_HASH_PREFIX.length);
  if (!encoded) return null;

  try {
    const parsed = JSON.parse(await gunzipFromBase64Url(encoded)) as { l?: unknown; r?: unknown; o?: unknown };
    if (typeof parsed.l !== 'string' || typeof parsed.r !== 'string') return null;
    return {
      leftText: parsed.l,
      rightText: parsed.r,
      options: (parsed.o && typeof parsed.o === 'object' ? parsed.o : {}) as DiffOptions,
    };
  } catch {
    return null;
  }
}

/** Builds the full shareable URL (current origin + path) for an already-encoded hash. */
export function buildShareUrl(hash: string): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}${window.location.pathname}#${hash}`;
}
