import { StationSegmentInterval } from '../types';

export interface BerthAllocationStep {
  stepNumber: number;
  description: string;
  currentInterval: StationSegmentInterval;
  action: 'SORT' | 'ALLOCATE' | 'NEW_BERTH' | 'COMPLETE';
  berthAllocations: { berthId: number; intervals: StationSegmentInterval[] }[];
  explanation: string;
}

export interface BerthAllocationResult {
  totalBerthsNeeded: number;
  berthAllocations: { berthId: number; intervals: StationSegmentInterval[] }[];
  steps: BerthAllocationStep[];
}

/**
 * Activity Selection / Greedy Interval Scheduling for Berth Sharing:
 * Sorts passenger travel intervals by finish station index (earliest finish first).
 * Greedily packs non-overlapping passenger segments onto the existing berths,
 * opening a new berth only when overlap is unavoidable.
 */
export function allocateBerthsActivitySelection(
  intervals: StationSegmentInterval[]
): BerthAllocationResult {
  if (!intervals || intervals.length === 0) {
    return { totalBerthsNeeded: 0, berthAllocations: [], steps: [] };
  }

  const steps: BerthAllocationStep[] = [];
  
  // Clone to avoid mutating input
  const sorted = [...intervals].sort((a, b) => {
    if (a.endIdx !== b.endIdx) return a.endIdx - b.endIdx;
    return a.startIdx - b.startIdx;
  });

  steps.push({
    stepNumber: 1,
    description: 'Greedy Sorting: Sort all passenger segments by Earliest Destination (finish index)',
    currentInterval: sorted[0],
    action: 'SORT',
    berthAllocations: [],
    explanation: `Sorted ${sorted.length} passenger journeys in ascending order of arrival station to apply Activity Selection.`,
  });

  const berths: { berthId: number; intervals: StationSegmentInterval[] }[] = [];

  sorted.forEach((passenger, idx) => {
    let placed = false;

    // Try to find a berth where this passenger doesn't overlap
    for (const berth of berths) {
      // Check overlap: new passenger travels [startIdx, endIdx]
      // Conflicts if any existing segment overlaps with [passenger.startIdx, passenger.endIdx]
      const hasConflict = berth.intervals.some(existing => {
        return Math.max(existing.startIdx, passenger.startIdx) < Math.min(existing.endIdx, passenger.endIdx);
      });

      if (!hasConflict) {
        passenger.berthId = berth.berthId;
        berth.intervals.push(passenger);
        placed = true;
        steps.push({
          stepNumber: steps.length + 1,
          description: `Allocated ${passenger.passengerName} to Berth B${berth.berthId}`,
          currentInterval: { ...passenger },
          action: 'ALLOCATE',
          berthAllocations: berths.map(b => ({ ...b, intervals: [...b.intervals] })),
          explanation: `Passenger travels ${passenger.startStation} -> ${passenger.endStation} (Stations ${passenger.startIdx} to ${passenger.endIdx}). No overlap on Berth B${berth.berthId}; reused physical berth!`,
        });
        break;
      }
    }

    if (!placed) {
      const newBerthId = berths.length + 1;
      passenger.berthId = newBerthId;
      berths.push({
        berthId: newBerthId,
        intervals: [passenger],
      });
      steps.push({
        stepNumber: steps.length + 1,
        description: `Created new Berth B${newBerthId} for ${passenger.passengerName}`,
        currentInterval: { ...passenger },
        action: 'NEW_BERTH',
        berthAllocations: berths.map(b => ({ ...b, intervals: [...b.intervals] })),
        explanation: `All active berths had overlapping travel segments between Station ${passenger.startIdx} and ${passenger.endIdx}. Greedily opened Berth B${newBerthId}.`,
      });
    }
  });

  return {
    totalBerthsNeeded: berths.length,
    berthAllocations: berths,
    steps,
  };
}

/**
 * Quick helper to allocate a single new booking against existing berth segments
 */
export function allocateSinglePassengerToBerth(
  newPassenger: StationSegmentInterval,
  existingBerths: { berthId: number; intervals: StationSegmentInterval[] }[],
  maxBerthsPerCoach = 72
): { berthId: number; coach: string; berthType: 'L' | 'M' | 'U' | 'SL' | 'SU' } {
  // Find first berth with no overlap
  for (const berth of existingBerths) {
    const hasConflict = berth.intervals.some(existing => {
      return Math.max(existing.startIdx, newPassenger.startIdx) < Math.min(existing.endIdx, newPassenger.endIdx);
    });
    if (!hasConflict) {
      const berthNum = ((berth.berthId - 1) % maxBerthsPerCoach) + 1;
      const coachIndex = Math.floor((berth.berthId - 1) / maxBerthsPerCoach) + 1;
      return {
        berthId: berthNum,
        coach: `B${coachIndex}`,
        berthType: getBerthTypeFromNumber(berthNum),
      };
    }
  }

  // Open new berth
  const newBerthId = existingBerths.length + 1;
  const berthNum = ((newBerthId - 1) % maxBerthsPerCoach) + 1;
  const coachIndex = Math.floor((newBerthId - 1) / maxBerthsPerCoach) + 1;
  return {
    berthId: berthNum,
    coach: `B${coachIndex}`,
    berthType: getBerthTypeFromNumber(berthNum),
  };
}

export function getBerthTypeFromNumber(num: number): 'L' | 'M' | 'U' | 'SL' | 'SU' {
  const mod = num % 8;
  if (mod === 1 || mod === 4) return 'L';
  if (mod === 2 || mod === 5) return 'M';
  if (mod === 3 || mod === 6) return 'U';
  if (mod === 7) return 'SL';
  return 'SU'; // mod === 0
}
