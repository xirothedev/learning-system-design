export class RedisClient {
  connected = false;
  bufferedAmount = 0;
  onconnect: (() => void) | null = null;
  onclose: ((error?: Error) => void) | null = null;

  constructor(_url?: string) {}

  connect(): Promise<void> {
    this.connected = true;
    this.onconnect?.();
    return Promise.resolve();
  }

  close(): void {
    this.connected = false;
    this.onclose?.();
  }
}
