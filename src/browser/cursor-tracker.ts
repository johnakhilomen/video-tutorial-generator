import type { BrowserAction, CursorPosition } from "../types/index.js";

export class CursorTracker {
  private positions: CursorPosition[] = [];
  private startTime: number;

  constructor() {
    this.startTime = Date.now();
  }

  reset(): void {
    this.positions = [];
    this.startTime = Date.now();
  }

  record(action: BrowserAction): void {
    const timestamp = Date.now() - this.startTime;

    if (action.x !== undefined && action.y !== undefined) {
      this.positions.push({
        x: action.x,
        y: action.y,
        timestamp,
        action: action.type,
      });
    }
  }

  getPositions(): CursorPosition[] {
    return [...this.positions];
  }
}
