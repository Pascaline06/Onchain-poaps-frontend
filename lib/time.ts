import { CREATOR_TIMELOCK_SECONDS, SIGNATURE_GRACE_SECONDS } from "./contract";

export interface EventTiming {
  createdAt: number;
  now: number;
  creatorWindowEndsAt: number; // registerEvent createdAt + 30d — allowlist root, public toggle
  signatureWindowEndsAt: number; // + 37d — mintWithSignature
  creatorWindowOpen: boolean;
  signatureWindowOpen: boolean;
  creatorSecondsLeft: number;
  signatureSecondsLeft: number;
}

export function computeTiming(createdAt: bigint | number, now: number = Date.now() / 1000): EventTiming {
  const created = Number(createdAt);
  const creatorWindowEndsAt = created + CREATOR_TIMELOCK_SECONDS;
  const signatureWindowEndsAt = created + CREATOR_TIMELOCK_SECONDS + SIGNATURE_GRACE_SECONDS;
  return {
    createdAt: created,
    now,
    creatorWindowEndsAt,
    signatureWindowEndsAt,
    creatorWindowOpen: now < creatorWindowEndsAt,
    signatureWindowOpen: now < signatureWindowEndsAt,
    creatorSecondsLeft: Math.max(0, creatorWindowEndsAt - now),
    signatureSecondsLeft: Math.max(0, signatureWindowEndsAt - now),
  };
}

export function formatCountdown(seconds: number): string {
  if (seconds <= 0) return "closed";
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  if (days > 0) return `${days}d ${hours}h left`;
  const mins = Math.floor((seconds % 3600) / 60);
  return `${hours}h ${mins}m left`;
}
