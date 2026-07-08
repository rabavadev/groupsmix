// Queue producer for YourRank (Phase 6.1)
// Enqueues click and conversion events to Cloudflare Queues
// instead of writing to Postgres inline.

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
  shortLinkId: string;
  clickRef: string | null;
  amount: number;
  currency: string;
  status: string;
  timestamp: number;
}

export type QueueEvent = ClickEvent | ConversionEvent;

interface QueueProducer {
  send(message: QueueEvent): Promise<void>;
}

/**
 * Create a queue producer that sends events to a Cloudflare Queue.
 * Falls back to direct DB write if queue is not available.
 */
export function createQueueProducer(
  queue: { send: (message: unknown) => Promise<void> } | undefined,
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
