import { QuotaType, WaitlistPriorityItem } from '../types';

export const QUOTA_WEIGHTS: Record<QuotaType, number> = {
  DP: 95, // Divyangjan / Disability
  SS: 90, // Senior Citizen
  TQ: 80, // Tatkal
  LD: 75, // Ladies
  GN: 50, // General
};

export interface WaitlistStep {
  stepNumber: number;
  description: string;
  action: 'HEAP_BUILD' | 'INSERT' | 'POP_MAX' | 'PROMOTE';
  promotedPassenger?: WaitlistPriorityItem;
  remainingQueue: WaitlistPriorityItem[];
  explanation: string;
}

export interface WaitlistConfirmationResult {
  promotedPassengers: WaitlistPriorityItem[];
  remainingWaitlist: WaitlistPriorityItem[];
  steps: WaitlistStep[];
}

/**
 * Priority Queue (Max-Heap) for Waitlist Confirmation:
 * Greedy criterion: High-priority quotas (Divyangjan, Senior, Tatkal, Ladies)
 * take precedence, breaking ties by earlier booking timestamp.
 */
export class WaitlistPriorityQueue {
  private heap: WaitlistPriorityItem[] = [];

  constructor(initialItems?: WaitlistPriorityItem[]) {
    if (initialItems && initialItems.length > 0) {
      initialItems.forEach(item => this.insert(item));
    }
  }

  // Higher score = higher priority
  public static calculatePriorityScore(quota: QuotaType, bookingTimestamp: number, age: number): number {
    const quotaWeight = QUOTA_WEIGHTS[quota] || 50;
    // Senior citizen age boost if in general quota
    const ageBonus = (age >= 60 && quota === 'GN') ? 15 : 0;
    // Normalize timestamp (subtract base year 2026 to keep within safe integer range)
    const baseSeconds = 1770000000;
    const timeOffset = Math.max(0, Math.floor(bookingTimestamp / 1000) - baseSeconds);
    // 10000 points per quota level, minus seconds passed (earlier bookings lose fewer points)
    return (quotaWeight + ageBonus) * 100000 - Math.min(99999, timeOffset);
  }

  public size(): number {
    return this.heap.length;
  }

  public getHeap(): WaitlistPriorityItem[] {
    return [...this.heap];
  }

  public insert(item: WaitlistPriorityItem): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  public extractMax(): WaitlistPriorityItem | undefined {
    if (this.heap.length === 0) return undefined;
    const max = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.sinkDown(0);
    }
    return max;
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.heap[index].priorityScore > this.heap[parentIdx].priorityScore) {
        [this.heap[index], this.heap[parentIdx]] = [this.heap[parentIdx], this.heap[index]];
        index = parentIdx;
      } else {
        break;
      }
    }
  }

  private sinkDown(index: number): void {
    const length = this.heap.length;
    while (true) {
      let largest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.heap[left].priorityScore > this.heap[largest].priorityScore) {
        largest = left;
      }
      if (right < length && this.heap[right].priorityScore > this.heap[largest].priorityScore) {
        largest = right;
      }

      if (largest !== index) {
        [this.heap[index], this.heap[largest]] = [this.heap[largest], this.heap[index]];
        index = largest;
      } else {
        break;
      }
    }
  }
}

/**
 * Greedily promotes the top K passengers from the waitlist when berths are released.
 */
export function promoteWaitlistedPassengers(
  currentWaitlist: WaitlistPriorityItem[],
  seatsAvailable: number
): WaitlistConfirmationResult {
  const steps: WaitlistStep[] = [];
  const pq = new WaitlistPriorityQueue();

  // 1. Build Priority Queue
  currentWaitlist.forEach(p => {
    // ensure score is up to date
    if (!p.priorityScore) {
      p.priorityScore = WaitlistPriorityQueue.calculatePriorityScore(p.quota, p.bookingTimestamp, p.age);
    }
    pq.insert(p);
  });

  steps.push({
    stepNumber: 1,
    description: `Constructed Waitlist Priority Queue with ${pq.size()} entries`,
    action: 'HEAP_BUILD',
    remainingQueue: pq.getHeap(),
    explanation: `Organized waitlist into a Max-Heap where parent nodes always hold higher priority (Quota tier + Timestamp). Root has highest clearance eligibility.`,
  });

  const promoted: WaitlistPriorityItem[] = [];

  for (let i = 0; i < seatsAvailable; i++) {
    if (pq.size() === 0) break;
    const winner = pq.extractMax()!;
    promoted.push(winner);

    steps.push({
      stepNumber: steps.length + 1,
      description: `Promoted ${winner.passengerName} (PNR: ${winner.pnr}, Quota: ${winner.quota}) to CONFIRMED!`,
      action: 'PROMOTE',
      promotedPassenger: winner,
      remainingQueue: pq.getHeap(),
      explanation: `Greedy choice: Top of Priority Queue extracted (Score: ${winner.priorityScore.toLocaleString()}). Quota weight for ${winner.quota} (${QUOTA_WEIGHTS[winner.quota]}pts) + booking time priority won over other candidates.`,
    });
  }

  // Re-index remaining waitlist positions
  const remainingWaitlist = pq.getHeap().sort((a, b) => b.priorityScore - a.priorityScore);
  remainingWaitlist.forEach((item, index) => {
    item.waitlistPosition = index + 1;
  });

  return {
    promotedPassengers: promoted,
    remainingWaitlist,
    steps,
  };
}
