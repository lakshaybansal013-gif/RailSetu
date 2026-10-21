import { describe, it, expect } from 'vitest';
import {
  allocateBerthsActivitySelection,
  assignPlatformsGreedy,
  findRoutesDijkstra,
  WaitlistPriorityQueue,
  promoteWaitlistedPassengers,
  kruskalMinimumSpanningTree,
  calculateGreedyRefundDenominations,
  StationSegmentInterval,
  TrainArrivalDeparture,
  WaitlistPriorityItem,
  NetworkEdge,
} from '../index';
import { Train } from '../../types';

describe('Greedy Algorithms Suite - Indian Railway System', () => {

  describe('1. Berth Allocation (Activity Selection)', () => {
    it('should reuse berths for non-overlapping journey intervals', () => {
      // Station indices: NDLS(0) -> CNB(1) -> PRYJ(2) -> DDU(3) -> PNBE(4) -> HWH(5)
      const passengers: StationSegmentInterval[] = [
        { id: 'P1', passengerName: 'Aarav', startIdx: 0, endIdx: 2, startStation: 'NDLS', endStation: 'PRYJ' },
        { id: 'P2', passengerName: 'Diya', startIdx: 2, endIdx: 5, startStation: 'PRYJ', endStation: 'HWH' },
        { id: 'P3', passengerName: 'Rohan', startIdx: 1, endIdx: 4, startStation: 'CNB', endStation: 'PNBE' },
      ];

      const result = allocateBerthsActivitySelection(passengers);

      // P1 (0->2) and P2 (2->5) do NOT overlap, so they share Berth 1!
      // P3 (1->4) overlaps with both, so it takes Berth 2.
      expect(result.totalBerthsNeeded).toBe(2);
      expect(result.berthAllocations.length).toBe(2);
      expect(result.berthAllocations[0].intervals.length).toBe(2);
      expect(result.berthAllocations[1].intervals.length).toBe(1);
    });

    it('should handle empty input cleanly', () => {
      const result = allocateBerthsActivitySelection([]);
      expect(result.totalBerthsNeeded).toBe(0);
      expect(result.berthAllocations).toEqual([]);
    });
  });

  describe('2. Platform Assignment (Interval Partitioning with Min-Heap)', () => {
    it('should calculate minimum platforms and assign schedules greedily', () => {
      const trains: TrainArrivalDeparture[] = [
        { id: 'T1', trainNumber: '12004', trainName: 'Shatabdi', arrivalMinutes: 600, departureMinutes: 630, arrivalStr: '10:00', departureStr: '10:30' },
        { id: 'T2', trainNumber: '22436', trainName: 'Vande Bharat', arrivalMinutes: 615, departureMinutes: 645, arrivalStr: '10:15', departureStr: '10:45' },
        { id: 'T3', trainNumber: '12424', trainName: 'Rajdhani', arrivalMinutes: 640, departureMinutes: 700, arrivalStr: '10:40', departureStr: '11:40' },
      ];

      const result = assignPlatformsGreedy(trains, 5);

      // At 10:20 (620 mins), both T1 and T2 are at the station -> needs at least 2 platforms.
      // T1 departs at 10:30 (630 mins) + 5 min buffer = 635 mins.
      // T3 arrives at 10:40 (640 mins) >= 635 mins, so it reuses T1's platform!
      expect(result.minPlatformsNeeded).toBe(2);
      expect(result.assignments.find(t => t.id === 'T3')?.assignedPlatform).toBe(
        result.assignments.find(t => t.id === 'T1')?.assignedPlatform
      );
    });
  });

  describe('3. Route Finder (Dijkstra with Layover Constraint)', () => {
    it('should respect 30-min minimum layover on connecting trains', () => {
      const mockTrains: Train[] = [
        {
          trainNumber: '12001',
          trainName: 'Bhopal Shatabdi',
          type: 'Shatabdi',
          sourceCode: 'NDLS',
          destinationCode: 'BPL',
          departureTime: '06:00',
          arrivalTime: '14:00',
          duration: '8h 00m',
          durationMinutes: 480,
          distanceKm: 700,
          runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          averagePunctuality: 95,
          stops: [
            { stationCode: 'NDLS', stationName: 'New Delhi', arrivalTime: 'Source', departureTime: '06:00', haltMinutes: 0, dayCount: 1, distanceKm: 0, platformNumber: 1 },
            { stationCode: 'BPL', stationName: 'Bhopal', arrivalTime: '14:00', departureTime: 'Destination', haltMinutes: 0, dayCount: 1, distanceKm: 700, platformNumber: 2 },
          ],
          classes: { '3A': { fare: 1100, availableSeats: 50, racSeats: 10, wlSeats: 20, status: 'AVAILABLE' } },
        },
        {
          trainNumber: '12002',
          trainName: 'Southern Express',
          type: 'Express',
          sourceCode: 'BPL',
          destinationCode: 'MAS',
          departureTime: '14:45', // 45 mins layover (>= 30 mins) -> Valid!
          arrivalTime: '23:30',
          duration: '8h 45m',
          durationMinutes: 525,
          distanceKm: 900,
          runningDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
          averagePunctuality: 90,
          stops: [
            { stationCode: 'BPL', stationName: 'Bhopal', arrivalTime: 'Source', departureTime: '14:45', haltMinutes: 0, dayCount: 1, distanceKm: 0, platformNumber: 3 },
            { stationCode: 'MAS', stationName: 'Chennai Central', arrivalTime: '23:30', departureTime: 'Destination', haltMinutes: 0, dayCount: 1, distanceKm: 900, platformNumber: 1 },
          ],
          classes: { '3A': { fare: 1300, availableSeats: 25, racSeats: 5, wlSeats: 15, status: 'AVAILABLE' } },
        },
      ];

      const result = findRoutesDijkstra('NDLS', 'MAS', mockTrains, 'FASTEST', '3A');
      expect(result.allConnectingRoutes.length).toBeGreaterThan(0);
      expect(result.allConnectingRoutes[0].transferStation).toBe('BPL');
      expect(result.allConnectingRoutes[0].layoverMinutes).toBe(45);
      expect(result.allConnectingRoutes[0].totalFare).toBe(2400);
    });
  });

  describe('4. Waitlist Confirmation (Priority Queue Max-Heap)', () => {
    it('should prioritize Senior/Divyangjan/Tatkal over General and earlier timestamps', () => {
      const waitlist: WaitlistPriorityItem[] = [
        {
          id: 'WL1',
          passengerName: 'Kavita (General)',
          pnr: '2345678901',
          quota: 'GN',
          bookingTimestamp: 1771000100000,
          bookingTimeStr: '10:00 AM',
          age: 32,
          priorityScore: 0,
          waitlistPosition: 1,
        },
        {
          id: 'WL2',
          passengerName: 'Shri Ram (Senior Citizen)',
          pnr: '2345678902',
          quota: 'SS',
          bookingTimestamp: 1771000200000,
          bookingTimeStr: '10:05 AM',
          age: 68,
          priorityScore: 0,
          waitlistPosition: 2,
        },
        {
          id: 'WL3',
          passengerName: 'Anil (Tatkal)',
          pnr: '2345678903',
          quota: 'TQ',
          bookingTimestamp: 1771000300000,
          bookingTimeStr: '10:10 AM',
          age: 40,
          priorityScore: 0,
          waitlistPosition: 3,
        },
      ];

      // Promote 2 passengers
      const result = promoteWaitlistedPassengers(waitlist, 2);

      // Senior citizen has higher quota weight than Tatkal and General
      expect(result.promotedPassengers.length).toBe(2);
      expect(result.promotedPassengers[0].quota).toBe('SS');
      expect(result.promotedPassengers[1].quota).toBe('TQ');
      expect(result.remainingWaitlist[0].quota).toBe('GN');
    });
  });

  describe('5. Kruskal MST & Coin Change Refund', () => {
    it('should compute the minimum spanning tree of railway edges without cycles', () => {
      const nodes = ['NDLS', 'BPL', 'CSMT', 'HWH'];
      const edges: NetworkEdge[] = [
        { id: 'E1', source: 'NDLS', destination: 'BPL', distanceKm: 700, costInCr: 1200 },
        { id: 'E2', source: 'BPL', destination: 'CSMT', distanceKm: 830, costInCr: 1400 },
        { id: 'E3', source: 'NDLS', destination: 'CSMT', distanceKm: 1400, costInCr: 2800 }, // cycle if E1, E2 chosen
        { id: 'E4', source: 'BPL', destination: 'HWH', distanceKm: 1100, costInCr: 1900 },
      ];

      const result = kruskalMinimumSpanningTree(nodes, edges);
      // For 4 nodes, an MST must have exactly 3 edges
      expect(result.mstEdges.length).toBe(3);
      expect(result.rejectedEdges.length).toBe(1);
      expect(result.rejectedEdges[0].id).toBe('E3');
      expect(result.totalCostCr).toBe(1200 + 1400 + 1900); // 4500
    });

    it('should compute greedy refund denominations with minimum total notes', () => {
      // E.g., Refund amount ₹1878
      // 3 x 500 = 1500 (rem 378)
      // 1 x 200 = 200 (rem 178)
      // 1 x 100 = 100 (rem 78)
      // 1 x 50 = 50 (rem 28)
      // 1 x 20 = 20 (rem 8)
      // 1 x 5 = 5 (rem 3)
      // 1 x 2 = 2 (rem 1)
      // 1 x 1 = 1 (rem 0)
      const result = calculateGreedyRefundDenominations(1878);

      expect(result.originalAmount).toBe(1878);
      const sum = result.denominations.reduce((acc, d) => acc + d.totalValue, 0);
      expect(sum).toBe(1878);

      const fiveHundreds = result.denominations.find(d => d.denomination === 500);
      expect(fiveHundreds?.count).toBe(3);

      const twoHundreds = result.denominations.find(d => d.denomination === 200);
      expect(twoHundreds?.count).toBe(1);
    });
  });

});
