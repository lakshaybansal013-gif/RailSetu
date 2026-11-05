import { Train, CoachClass, ConnectingRoute, TrainStop, ClassAvailability } from '../types';
import { MOCK_TRAINS } from '../mock/trains';
import { supabase, isMockMode } from './supabaseClient';
import { findRoutesDijkstra, RouteOptimization } from '../algorithms/routeFinder';

// Transform normalized DB rows (with joined train_stops & train_classes) -> Train interface
function rowToTrain(row: Record<string, any>): Train {
  // 1. train_stops table rows -> sorted TrainStop[]
  const rawStops = (row.train_stops as any[]) ?? (Array.isArray(row.stops) ? row.stops : []);
  const stops: TrainStop[] = rawStops
    .sort((a, b) => (a.stop_order ?? 0) - (b.stop_order ?? 0))
    .map((s) => ({
      stationCode: s.station_code ?? s.stationCode,
      stationName: s.station_name ?? s.stationName,
      arrivalTime: s.arrival_time ?? s.arrivalTime,
      departureTime: s.departure_time ?? s.departureTime,
      haltMinutes: Number(s.halt_minutes ?? s.haltMinutes ?? 0),
      dayCount: Number(s.day_count ?? s.dayCount ?? 1),
      distanceKm: Number(s.distance_km ?? s.distanceKm ?? 0),
      platformNumber: Number(s.platform_number ?? s.platformNumber ?? 1),
    }));

  // 2. train_classes table rows -> Record<CoachClass, ClassAvailability>
  const classes: Partial<Record<CoachClass, ClassAvailability>> = {};
  if (Array.isArray(row.train_classes)) {
    row.train_classes.forEach((c: any) => {
      classes[c.coach_class as CoachClass] = {
        fare: Number(c.fare),
        availableSeats: Number(c.available_seats),
        racSeats: Number(c.rac_seats ?? 0),
        wlSeats: Number(c.wl_seats ?? 0),
        status: c.status,
      };
    });
  } else if (row.classes && typeof row.classes === 'object') {
    Object.assign(classes, row.classes);
  }

  return {
    trainNumber: row.train_number ?? row.trainNumber,
    trainName: row.train_name ?? row.trainName,
    type: row.type,
    sourceCode: row.source_code ?? row.sourceCode,
    destinationCode: row.destination_code ?? row.destinationCode,
    departureTime: row.departure_time ?? row.departureTime,
    arrivalTime: row.arrival_time ?? row.arrivalTime,
    duration: row.duration,
    durationMinutes: Number(row.duration_minutes ?? row.durationMinutes ?? 0),
    distanceKm: Number(row.distance_km ?? row.distanceKm ?? 0),
    runningDays: row.running_days ?? row.runningDays ?? [],
    stops,
    classes,
    averagePunctuality: Number(row.average_punctuality ?? row.averagePunctuality ?? 90),
  };
}

export const trainService = {
  async getAllTrains(): Promise<Train[]> {
    if (isMockMode()) {
      return [...MOCK_TRAINS];
    }

    // Normalized query: Relational join with train_stops and train_classes
    const { data, error } = await supabase
      .from('trains')
      .select('*, train_stops(*), train_classes(*)')
      .order('train_number');

    if (error) {
      throw new Error(`Unable to load trains from Supabase: ${error.message}`);
    }
    return (data ?? []).map(rowToTrain);
  },

  async getTrainByNumber(trainNumber: string): Promise<Train | undefined> {
    if (isMockMode()) {
      const all = await this.getAllTrains();
      return all.find((t) => t.trainNumber === trainNumber);
    }

    const { data, error } = await supabase
      .from('trains')
      .select('*, train_stops(*), train_classes(*)')
      .eq('train_number', trainNumber)
      .maybeSingle();

    if (error) {
      throw new Error(`Unable to load train: ${error.message}`);
    }
    return data ? rowToTrain(data) : undefined;
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
    const directTrains = all.filter((train) => {
      const srcIdx = train.stops.findIndex((s) => s.stationCode === src);
      const destIdx = train.stops.findIndex((s) => s.stationCode === dest);
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
