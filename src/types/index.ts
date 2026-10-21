export type CoachClass = '1A' | '2A' | '3A' | 'SL' | 'CC' | 'EC' | '2S';

export type QuotaType = 'GN' | 'TQ' | 'LD' | 'SS' | 'DP';

export type BerthType = 'L' | 'M' | 'U' | 'SL' | 'SU' | 'WS' | 'AS';

export type BookingStatus = 'CONFIRMED' | 'RAC' | 'WL' | 'CANCELLED';

export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
  zone: string;
  lat: number;
  lng: number;
  platformsCount: number;
}

export interface TrainStop {
  stationCode: string;
  stationName: string;
  arrivalTime: string;   // e.g. "14:20" or "Source"
  departureTime: string; // e.g. "14:25" or "Destination"
  haltMinutes: number;
  dayCount: number;
  distanceKm: number;
  platformNumber: number;
}

export interface ClassAvailability {
  fare: number;
  availableSeats: number;
  racSeats: number;
  wlSeats: number;
  status: 'AVAILABLE' | 'RAC' | 'WL';
}

export interface Train {
  trainNumber: string;
  trainName: string;
  type: 'Vande Bharat' | 'Rajdhani' | 'Shatabdi' | 'Tejas' | 'Superfast' | 'Express';
  sourceCode: string;
  destinationCode: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  durationMinutes: number;
  distanceKm: number;
  runningDays: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  stops: TrainStop[];
  classes: Partial<Record<CoachClass, ClassAvailability>>;
  averagePunctuality: number; // percentage, e.g. 96
}

export interface Passenger {
  id: string;
  name: string;
  age: number;
  gender: 'M' | 'F' | 'O';
  berthPreference?: BerthType;
  quota: QuotaType;
  seatAllocated?: {
    coach: string;
    berthNumber: number;
    berthType: BerthType;
  };
  status: 'CONFIRMED' | 'RAC' | 'WL';
  wlNumber?: number;
  racNumber?: number;
}

export interface Booking {
  pnr: string;
  trainNumber: string;
  trainName: string;
  travelDate: string;
  fromStation: string;
  toStation: string;
  coachClass: CoachClass;
  quota: QuotaType;
  passengers: Passenger[];
  totalFare: number;
  status: 'CONFIRMED' | 'RAC' | 'WAITLISTED' | 'CANCELLED';
  createdAt: string;
  platformNumber?: number;
  paymentMethod?: string;
  transactionId?: string;
}

export interface ConnectingRouteSegment {
  train: Train;
  fromStation: string;
  toStation: string;
  departureTime: string;
  arrivalTime: string;
  duration: string;
  distanceKm: number;
  fare: number;
  classAvailability: ClassAvailability;
}

export interface ConnectingRoute {
  isDirect: boolean;
  segments: ConnectingRouteSegment[];
  totalDuration: string;
  totalDurationMinutes: number;
  totalDistanceKm: number;
  totalFare: number;
  transferStation?: string;
  layoverDuration?: string;
  layoverMinutes?: number;
}

// Activity Selection Algorithm Types
export interface StationSegmentInterval {
  id: string;
  passengerName: string;
  startIdx: number;     // station index on the route
  endIdx: number;       // station index on the route
  startStation: string;
  endStation: string;
  berthId?: number;
  coach?: string;
}

// Platform Interval Partitioning Types
export interface TrainArrivalDeparture {
  id: string;
  trainNumber: string;
  trainName: string;
  arrivalMinutes: number;   // minutes from midnight
  departureMinutes: number; // minutes from midnight
  arrivalStr: string;
  departureStr: string;
  assignedPlatform?: number;
}

// Waitlist Priority Queue Types
export interface WaitlistPriorityItem {
  id: string;
  passengerName: string;
  pnr: string;
  quota: QuotaType;
  bookingTimestamp: number;
  bookingTimeStr: string;
  age: number;
  priorityScore: number;
  waitlistPosition: number;
}

// Kruskal MST Types
export interface NetworkEdge {
  id: string;
  source: string;
  destination: string;
  distanceKm: number;
  costInCr: number;
  selectedInMST?: boolean;
}

// Greedy Coin Change Refund Types
export interface RefundDenomination {
  denomination: number;
  count: number;
  totalValue: number;
}
