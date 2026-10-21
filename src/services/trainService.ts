import { Train, CoachClass, ConnectingRoute } from '../types';
import { MOCK_TRAINS } from '../mock/trains';
import { supabase, isMockMode } from './supabaseClient';
import { findRoutesDijkstra, RouteOptimization } from '../algorithms/routeFinder';

export const trainService = {
  async getAllTrains(): Promise<Train[]> {
    if (isMockMode()) {
      return [...MOCK_TRAINS];
    }
    const { data, error } = await supabase.from('trains').select('*').order('train_number');
    if (error) {
      throw new Error(`Unable to load trains from Supabase: ${error.message}`);
    }
    return (data ?? []).map((row) => ({ ...row, trainNumber: row.train_number, trainName: row.train_name,
      sourceCode: row.source_code, destinationCode: row.destination_code, departureTime: row.departure_time,
      arrivalTime: row.arrival_time, durationMinutes: row.duration_minutes, distanceKm: row.distance_km,
      runningDays: row.running_days, averagePunctuality: row.average_punctuality,
    } as Train));
  },

  async getTrainByNumber(trainNumber: string): Promise<Train | undefined> {
    const all = await this.getAllTrains();
    return all.find(t => t.trainNumber === trainNumber);
  },

  async searchTrains(
    sourceCode: string,
    destinationCode: string,
    travelDate?: string,
    preferredClass: CoachClass = '3A',
    optimization: RouteOptimization = 'FASTEST'
  ): Promise<{
    directTrains: Train[];
    dijkstraRoutes: ConnectingRoute[];
    bestOptimalRoute: ConnectingRoute | null;
  }> {
    const all = await this.getAllTrains();
    const src = sourceCode.trim().toUpperCase();
    const dest = destinationCode.trim().toUpperCase();

    // 1. Direct trains that stop at both stations in order
    const directTrains = all.filter(train => {
      const srcIdx = train.stops.findIndex(s => s.stationCode === src);
      const destIdx = train.stops.findIndex(s => s.stationCode === dest);
      return srcIdx !== -1 && destIdx !== -1 && srcIdx < destIdx;
    });

    // 2. Greedy Dijkstra Connecting Routes (Fastest vs Cheapest)
    const dijkstraResult = findRoutesDijkstra(src, dest, all, optimization, preferredClass);

    return {
      directTrains,
      dijkstraRoutes: dijkstraResult.allConnectingRoutes,
      bestOptimalRoute: dijkstraResult.bestRoute,
    };
  },
};
