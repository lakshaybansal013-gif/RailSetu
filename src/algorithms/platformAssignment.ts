import { TrainArrivalDeparture } from '../types';

export interface PlatformMinHeapNode {
  platformId: number;
  availableAtMinutes: number; // departure time of last train on this platform
  lastTrainNumber: string;
}

export class MinHeap<T> {
  private heap: T[] = [];
  private compare: (a: T, b: T) => number;

  constructor(compare: (a: T, b: T) => number) {
    this.compare = compare;
  }

  size(): number {
    return this.heap.length;
  }

  peek(): T | undefined {
    return this.heap[0];
  }

  push(item: T): void {
    this.heap.push(item);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined;
    const top = this.heap[0];
    const bottom = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = bottom;
      this.sinkDown(0);
    }
    return top;
  }

  getAll(): T[] {
    return [...this.heap];
  }

  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIdx = Math.floor((index - 1) / 2);
      if (this.compare(this.heap[index], this.heap[parentIdx]) < 0) {
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
      let smallest = index;
      const left = 2 * index + 1;
      const right = 2 * index + 2;

      if (left < length && this.compare(this.heap[left], this.heap[smallest]) < 0) {
        smallest = left;
      }
      if (right < length && this.compare(this.heap[right], this.heap[smallest]) < 0) {
        smallest = right;
      }

      if (smallest !== index) {
        [this.heap[index], this.heap[smallest]] = [this.heap[smallest], this.heap[index]];
        index = smallest;
      } else {
        break;
      }
    }
  }
}

export interface PlatformAssignmentStep {
  stepNumber: number;
  description: string;
  currentTrain: TrainArrivalDeparture;
  action: 'SORT' | 'REUSE_PLATFORM' | 'ALLOCATE_NEW_PLATFORM';
  assignedPlatform: number;
  activePlatforms: PlatformMinHeapNode[];
  allAssignments: TrainArrivalDeparture[];
  explanation: string;
}

export interface PlatformAssignmentResult {
  minPlatformsNeeded: number;
  assignments: TrainArrivalDeparture[];
  platformSchedules: { platformId: number; trains: TrainArrivalDeparture[] }[];
  steps: PlatformAssignmentStep[];
}

/**
 * Interval Partitioning using a Min-Heap (Greedy optimal platform allocation):
 * 1. Sort all trains by Arrival Time.
 * 2. Maintain a min-heap of platforms keyed by departure/finish time.
 * 3. If the platform with the earliest release time is free (departure <= arrival),
 *    reuse that platform and update its departure time.
 * 4. Otherwise, greedily allocate a new platform.
 * Minimum platforms equals maximum depth (chromatic number of interval graph).
 */
export function assignPlatformsGreedy(
  trains: TrainArrivalDeparture[],
  bufferMinutes: number = 5 // safety buffer between trains
): PlatformAssignmentResult {
  if (!trains || trains.length === 0) {
    return { minPlatformsNeeded: 0, assignments: [], platformSchedules: [], steps: [] };
  }

  const steps: PlatformAssignmentStep[] = [];
  
  // 1. Sort trains by arrival time
  const sorted = [...trains].sort((a, b) => a.arrivalMinutes - b.arrivalMinutes);

  steps.push({
    stepNumber: 1,
    description: 'Greedy Sorting: Sort trains in ascending order of arrival time',
    currentTrain: sorted[0],
    action: 'SORT',
    assignedPlatform: 0,
    activePlatforms: [],
    allAssignments: [],
    explanation: `Sorted ${sorted.length} train schedules by arrival minutes from midnight to guarantee greedy optimal interval partitioning.`,
  });

  const heap = new MinHeap<PlatformMinHeapNode>((a, b) => a.availableAtMinutes - b.availableAtMinutes);
  let nextPlatformId = 1;
  const assignments: TrainArrivalDeparture[] = [];
  const platformSchedulesMap = new Map<number, TrainArrivalDeparture[]>();

  sorted.forEach(train => {
    const earliestFree = heap.peek();

    if (earliestFree && earliestFree.availableAtMinutes + bufferMinutes <= train.arrivalMinutes) {
      // Reuse this platform!
      const platformNode = heap.pop()!;
      platformNode.availableAtMinutes = train.departureMinutes;
      platformNode.lastTrainNumber = train.trainNumber;
      heap.push(platformNode);

      const updatedTrain = { ...train, assignedPlatform: platformNode.platformId };
      assignments.push(updatedTrain);

      if (!platformSchedulesMap.has(platformNode.platformId)) {
        platformSchedulesMap.set(platformNode.platformId, []);
      }
      platformSchedulesMap.get(platformNode.platformId)!.push(updatedTrain);

      steps.push({
        stepNumber: steps.length + 1,
        description: `Reused Platform ${platformNode.platformId} for Train ${train.trainNumber} (${train.trainName})`,
        currentTrain: updatedTrain,
        action: 'REUSE_PLATFORM',
        assignedPlatform: platformNode.platformId,
        activePlatforms: heap.getAll(),
        allAssignments: [...assignments],
        explanation: `Platform ${platformNode.platformId} cleared at ${minutesToTimeStr(earliestFree.availableAtMinutes)} + ${bufferMinutes}m buffer <= Train arrival at ${train.arrivalStr}. Greedily reused existing platform!`,
      });
    } else {
      // Must allocate a new platform
      const assignedId = nextPlatformId++;
      heap.push({
        platformId: assignedId,
        availableAtMinutes: train.departureMinutes,
        lastTrainNumber: train.trainNumber,
      });

      const updatedTrain = { ...train, assignedPlatform: assignedId };
      assignments.push(updatedTrain);

      if (!platformSchedulesMap.has(assignedId)) {
        platformSchedulesMap.set(assignedId, []);
      }
      platformSchedulesMap.get(assignedId)!.push(updatedTrain);

      steps.push({
        stepNumber: steps.length + 1,
        description: `Opened new Platform ${assignedId} for Train ${train.trainNumber} (${train.trainName})`,
        currentTrain: updatedTrain,
        action: 'ALLOCATE_NEW_PLATFORM',
        assignedPlatform: assignedId,
        activePlatforms: heap.getAll(),
        allAssignments: [...assignments],
        explanation: earliestFree
          ? `Earliest free Platform ${earliestFree.platformId} is occupied until ${minutesToTimeStr(earliestFree.availableAtMinutes)}, overlapping with Train arrival ${train.arrivalStr}. Greedily opened Platform ${assignedId}.`
          : `Initial train allocated to Platform ${assignedId}.`,
      });
    }
  });

  const platformSchedules = Array.from(platformSchedulesMap.entries())
    .map(([platformId, trains]) => ({ platformId, trains }))
    .sort((a, b) => a.platformId - b.platformId);

  return {
    minPlatformsNeeded: nextPlatformId - 1,
    assignments,
    platformSchedules,
    steps,
  };
}

export function minutesToTimeStr(mins: number): string {
  const normalized = ((mins % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const minutes = normalized % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

export function timeStrToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
