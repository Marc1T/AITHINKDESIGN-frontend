// packages/features/generative-designer/src/lib/sse-client.ts

export type SSEEvent = {
  event: string;
  timestamp: string;
  data: any;
};

export class SSEClient {
  private eventSource: EventSource | null = null;
  private workshopId: string;
  private listeners: Map<string, (event: any) => void> = new Map();

  constructor(workshopId: string) {
    this.workshopId = workshopId;
  }

  connect() {
    if (!this.workshopId) return;

    const url = `/api/generative-designer/workshops/${this.workshopId}/stream`;
    this.eventSource = new EventSource(url);

    this.eventSource.onopen = () => {
      this.listeners.get('connect')?.(undefined);
    };

    this.eventSource.onerror = () => {
      this.listeners.get('disconnect')?.(undefined);
    };

    const eventTypes = [
      'phase_started',
      'phase_complete',
      'agent_started',
      'agent_complete',
      'idea_generated',
      'vote_cast',
      'empathy_contribution',
      'triz_analysis_complete',
    ];

    eventTypes.forEach((type) => {
      this.eventSource!.addEventListener(type, (e: MessageEvent) => {
        try {
          const data = JSON.parse(e.data);
          this.listeners.get('event')?.(data);
        } catch (err) {
          this.listeners.get('event')?.({ event: type, data: e.data, timestamp: new Date().toISOString() });
        }
      });
    });

    // Generic message fallback
    this.eventSource.onmessage = (e) => {
      try {
        const payload = JSON.parse(e.data);
        this.listeners.get('event')?.(payload);
      } catch {
        this.listeners.get('event')?.({ event: 'message', data: e.data, timestamp: new Date().toISOString() });
      }
    };
  }

  disconnect() {
    this.eventSource?.close();
    this.eventSource = null;
  }

  onConnect(callback: () => void) {
    this.listeners.set('connect', () => callback());
  }

  onDisconnect(callback: () => void) {
    this.listeners.set('disconnect', () => callback());
  }

  onEvent(callback: (event: SSEEvent) => void) {
    this.listeners.set('event', callback as any);
  }
}
