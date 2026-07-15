// Queue producer for YourRank (Phase 6.1)
// Enqueues click, conversion, and analytics events to Cloudflare Queues
// instead of writing to Postgres inline.

import type { PostbackQuery } from "./conversions.js";

export interface ClickEvent {
  type: "click";
  shortLinkId: string;
  ip: string;
  userAgent: string | null;
  referer: string | null;
  country: string | null;
  tgUserId: number | null;
  clickRef: string;
  timestamp: number;
}

export interface ConversionEvent {
  type: "conversion";
  ownerId: string;
  query: PostbackQuery;
  timestamp: number;
}

export interface BumpEvent {
  type: "bump";
  siteId: string;
  field: "views" | "copies" | "clicks";
  referer: string | null;
  timestamp: number;
}

export interface Top3NotifyEvent {
  type: "notify";
  kind: "top3";
  siteId: string;
  siteName: string;
  changes: Array<{ name: string; rank: number; wagered: number }>;
}

export interface ResetNotifyEvent {
  type: "notify";
  kind: "reset";
  siteId: string;
  siteName: string;
  players: Array<{ name: string; wagered: number; prize?: number }>;
  period: string;
}

export interface PlayerRankNotifyEvent {
  type: "notify";
  kind: "player-rank";
  siteId: string;
  siteName: string;
  playerName: string;
  oldRank: number | null;
  newRank: number;
  botId: string;
  tgUserId: number;
}

export type NotifyEvent = Top3NotifyEvent | ResetNotifyEvent | PlayerRankNotifyEvent;

export type QueueEvent = ClickEvent | ConversionEvent | BumpEvent | NotifyEvent;

interface QueueProducer {
  send(message: QueueEvent): Promise<void>;
}

/**
 * Create a queue producer that sends events to a Cloudflare Queue.
 * Falls back to direct DB write if the queue is not bound or the enqueue fails.
 */
export function createQueueProducer(
  queue: { send: (message: QueueEvent) => Promise<void> } | undefined,
  fallbackFn: (event: QueueEvent) => Promise<void>
): QueueProducer {
  if (!queue) {
    return { send: fallbackFn };
  }

  return {
    async send(event: QueueEvent): Promise<void> {
      try {
        await queue.send(event);
      } catch (err) {
        console.error("[queue-producer] enqueue failed, using fallback:", String(err));
        await fallbackFn(event);
      }
    },
  };
}
