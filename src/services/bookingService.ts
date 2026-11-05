import { Booking, Passenger, WaitlistPriorityItem, CoachClass, QuotaType, BerthType } from '../types';
import { INITIAL_MOCK_BOOKINGS, INITIAL_MOCK_WAITLIST } from '../mock/bookings';
import { supabase, isMockMode } from './supabaseClient';
import { allocateSinglePassengerToBerth } from '../algorithms/berthAllocation';
import { promoteWaitlistedPassengers } from '../algorithms/waitlistQueue';
import { calculateGreedyRefundDenominations, CoinChangeResult } from '../algorithms/coinChange';
import { trainService } from './trainService';

const BOOKINGS_STORAGE_KEY = 'railway_bookings_store_v1';
const WAITLIST_STORAGE_KEY = 'railway_waitlist_store_v1';

function getStoredBookings(): Booking[] {
  try {
    const raw = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_BOOKINGS));
      return [...INITIAL_MOCK_BOOKINGS];
    }
    return JSON.parse(raw);
  } catch {
    return [...INITIAL_MOCK_BOOKINGS];
  }
}

function saveBookings(bookings: Booking[]): void {
  try {
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (e) {
    console.error('Failed to save bookings in localStorage', e);
  }
}

function getStoredWaitlist(): WaitlistPriorityItem[] {
  try {
    const raw = localStorage.getItem(WAITLIST_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(INITIAL_MOCK_WAITLIST));
      return [...INITIAL_MOCK_WAITLIST];
    }
    return JSON.parse(raw);
  } catch {
    return [...INITIAL_MOCK_WAITLIST];
  }
}

function saveWaitlist(waitlist: WaitlistPriorityItem[]): void {
  try {
    localStorage.setItem(WAITLIST_STORAGE_KEY, JSON.stringify(waitlist));
  } catch (e) {
    console.error('Failed to save waitlist in localStorage', e);
  }
}

function rowToBooking(row: Record<string, any>): Booking {
  // Map passengers from joined 'passengers' table, or fallback to jsonb if present
  let passengersList: Passenger[] = [];
  if (Array.isArray(row.passengers)) {
    passengersList = row.passengers.map((p: any) => ({
      id: p.passenger_id ?? p.id,
      name: p.name,
      age: Number(p.age),
      gender: p.gender,
      berthPreference: p.berth_preference ?? p.berthPreference,
      quota: p.quota,
      seatAllocated: p.coach
        ? {
            coach: p.coach,
            berthNumber: Number(p.berth_number),
            berthType: p.berth_type as BerthType,
          }
        : p.seatAllocated,
      status: p.status,
      wlNumber: p.wl_number ? Number(p.wl_number) : p.wlNumber,
      racNumber: p.rac_number ? Number(p.rac_number) : p.racNumber,
    }));
  }

  // Payment method & txn from joined 'payments' table or direct column
  const paymentRecord = Array.isArray(row.payments) && row.payments.length > 0 ? row.payments[0] : null;

  return {
    pnr: row.pnr,
    trainNumber: row.train_number,
    trainName: row.train_name,
    travelDate: row.travel_date,
    fromStation: row.from_station,
    toStation: row.to_station,
    coachClass: row.coach_class,
    quota: row.quota,
    passengers: passengersList,
    totalFare: Number(row.total_fare),
    status: row.status,
    createdAt: row.created_at,
    platformNumber: row.platform_number,
    paymentMethod: paymentRecord?.payment_method ?? row.payment_method,
    transactionId: paymentRecord?.transaction_id ?? row.transaction_id,
  } as Booking;
}

export interface CreateBookingParams {
  trainNumber: string;
  trainName: string;
  travelDate: string;
  fromStation: string;
  toStation: string;
  coachClass: CoachClass;
  quota: QuotaType;
  passengers: Omit<Passenger, 'id' | 'seatAllocated' | 'status'>[];
  paymentMethod: string;
}

export const bookingService = {
  async getAllBookings(): Promise<Booking[]> {
    if (isMockMode()) {
      return getStoredBookings();
    }
    // Normalized relational query: joining passengers and payments
    const { data, error } = await supabase
      .from('bookings')
      .select('*, passengers(*), payments(*)')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Unable to load bookings from Supabase: ${error.message}`);
    }
    return (data ?? []).map(rowToBooking);
  },

  async getBookingByPNR(pnr: string): Promise<Booking | undefined> {
    const cleanPnr = pnr.trim().replace(/\D/g, '');
    if (isMockMode()) {
      const all = getStoredBookings();
      return all.find((b) => b.pnr === cleanPnr || b.pnr.includes(cleanPnr));
    }
    const { data, error } = await supabase
      .from('bookings')
      .select('*, passengers(*), payments(*)')
      .eq('pnr', cleanPnr)
      .maybeSingle();

    if (error) throw new Error(`Unable to look up booking: ${error.message}`);
    return data ? rowToBooking(data) : undefined;
  },

  async createBooking(params: CreateBookingParams): Promise<Booking> {
    const allBookings = await this.getAllBookings();
    const train = await trainService.getTrainByNumber(params.trainNumber);

    // Generate random 10-digit Indian Railway PNR
    const pnr = Math.floor(1000000000 + Math.random() * 9000000000).toString();

    // Determine platform from train's stop info
    const stopInfo = train?.stops.find((s) => s.stationCode === params.fromStation);
    const platformNumber = stopInfo?.platformNumber || Math.floor(1 + Math.random() * 5);

    // Identify station route indices for Activity Selection algorithm
    const fromIdx = train ? train.stops.findIndex((s) => s.stationCode === params.fromStation) : 0;
    const toIdx = train ? train.stops.findIndex((s) => s.stationCode === params.toStation) : 1;

    // Build existing berths map from previous confirmed bookings on this train
    const existingBerthIntervals: { berthId: number; intervals: any[] }[] = [];
    allBookings
      .filter((b) => b.trainNumber === params.trainNumber && b.status === 'CONFIRMED')
      .forEach((b) => {
        b.passengers.forEach((p) => {
          if (p.seatAllocated) {
            existingBerthIntervals.push({
              berthId: p.seatAllocated.berthNumber,
              intervals: [
                {
                  id: p.id,
                  passengerName: p.name,
                  startIdx: fromIdx,
                  endIdx: toIdx,
                  startStation: b.fromStation,
                  endStation: b.toStation,
                },
              ],
            });
          }
        });
      });

    // Check class availability
    const classInfo = train?.classes[params.coachClass];
    const availableSeats = classInfo?.availableSeats ?? 40;

    // Allocate seats for passengers using greedy Activity Selection
    const assignedPassengers: Passenger[] = params.passengers.map((p, idx) => {
      const passengerId = `pass-${Date.now()}-${idx}`;

      if (availableSeats > idx) {
        // CONFIRMED: Greedily allocate berth
        const allocation = allocateSinglePassengerToBerth(
          {
            id: passengerId,
            passengerName: p.name,
            startIdx: Math.max(0, fromIdx),
            endIdx: Math.max(1, toIdx),
            startStation: params.fromStation,
            endStation: params.toStation,
          },
          existingBerthIntervals
        );

        return {
          ...p,
          id: passengerId,
          status: 'CONFIRMED',
          seatAllocated: {
            coach:
              params.coachClass === 'CC' || params.coachClass === 'EC'
                ? `C${Math.floor(idx / 8) + 1}`
                : allocation.coach,
            berthNumber: allocation.berthId,
            berthType: p.berthPreference || allocation.berthType,
          },
        };
      } else {
        // RAC or Waitlist
        return {
          ...p,
          id: passengerId,
          status: 'WL',
          wlNumber: idx + 1 - availableSeats,
        };
      }
    });

    const isAllConfirmed = assignedPassengers.every((p) => p.status === 'CONFIRMED');
    const hasRac = assignedPassengers.some((p) => p.status === 'RAC');
    const bookingStatus: 'CONFIRMED' | 'RAC' | 'WAITLISTED' = isAllConfirmed
      ? 'CONFIRMED'
      : hasRac
      ? 'RAC'
      : 'WAITLISTED';

    const farePerTicket = classInfo?.fare || 1250;
    const totalFare = farePerTicket * assignedPassengers.length;
    const transactionId = `TXN${Date.now()}`;

    const newBooking: Booking = {
      pnr,
      trainNumber: params.trainNumber,
      trainName: params.trainName,
      travelDate: params.travelDate,
      fromStation: params.fromStation,
      toStation: params.toStation,
      coachClass: params.coachClass,
      quota: params.quota,
      passengers: assignedPassengers,
      totalFare,
      status: bookingStatus,
      createdAt: new Date().toISOString(),
      platformNumber,
      paymentMethod: params.paymentMethod,
      transactionId,
    };

    allBookings.unshift(newBooking);

    if (isMockMode()) {
      saveBookings(allBookings);
    } else {
      const user = (await supabase.auth.getUser()).data.user;

      // 1. Insert into normalized 'bookings' table
      const { error: bookingErr } = await supabase.from('bookings').insert({
        pnr,
        user_id: user?.id ?? null,
        train_number: params.trainNumber,
        train_name: params.trainName,
        travel_date: params.travelDate,
        from_station: params.fromStation,
        to_station: params.toStation,
        coach_class: params.coachClass,
        quota: params.quota,
        total_fare: totalFare,
        status: bookingStatus,
        platform_number: platformNumber,
      });

      if (bookingErr) throw new Error(`Unable to create booking: ${bookingErr.message}`);

      // 2. Insert into normalized 'passengers' table
      const passengerRows = assignedPassengers.map((p) => ({
        booking_pnr: pnr,
        name: p.name,
        age: p.age,
        gender: p.gender,
        berth_preference: p.berthPreference ?? null,
        quota: p.quota || params.quota || 'GN',
        coach: p.seatAllocated?.coach ?? null,
        berth_number: p.seatAllocated?.berthNumber ?? null,
        berth_type: p.seatAllocated?.berthType ?? null,
        status: p.status,
        wl_number: p.wlNumber ?? null,
        rac_number: p.racNumber ?? null,
      }));

      const { error: passErr } = await supabase.from('passengers').insert(passengerRows);
      if (passErr) {
        console.error('Error inserting passengers to relational table:', passErr);
        throw new Error(`Unable to save passenger details: ${passErr.message}`);
      }

      // 3. Insert into normalized 'payments' table
      const { error: payErr } = await supabase.from('payments').insert({
        booking_pnr: pnr,
        transaction_id: transactionId,
        amount: totalFare,
        payment_method: params.paymentMethod,
        status: 'SUCCESS',
      });
      if (payErr) console.warn('Could not insert payment to relational table:', payErr.message);
    }

    return newBooking;
  },

  async cancelBooking(pnr: string): Promise<{
    cancelledBooking: Booking;
    refundAmount: number;
    cancellationCharge: number;
    greedyRefund: CoinChangeResult;
    promotedPassengers: WaitlistPriorityItem[];
  }> {
    const allBookings = await this.getAllBookings();
    const bookingIndex = allBookings.findIndex((b) => b.pnr === pnr);

    if (bookingIndex === -1) {
      throw new Error(`Booking with PNR ${pnr} not found.`);
    }

    const booking = allBookings[bookingIndex];
    if (booking.status === 'CANCELLED') {
      throw new Error(`Booking ${pnr} has already been cancelled.`);
    }

    // Cancellation policy: ₹120 per passenger flat deduction or 10%
    const cancellationCharge = Math.min(booking.totalFare, booking.passengers.length * 120);
    const refundAmount = Math.max(0, booking.totalFare - cancellationCharge);

    // Apply Greedy Coin Change to calculate exact currency notes/coins breakdown
    const greedyRefund = calculateGreedyRefundDenominations(refundAmount);

    // Update booking status
    booking.status = 'CANCELLED';
    allBookings[bookingIndex] = booking;

    if (isMockMode()) {
      saveBookings(allBookings);
    } else {
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'CANCELLED' })
        .eq('pnr', pnr)
        .neq('status', 'CANCELLED');
      if (error) throw new Error(`Unable to cancel booking: ${error.message}`);

      // Update passengers status as well in normalized table
      await supabase.from('passengers').update({ status: 'CANCELLED' }).eq('booking_pnr', pnr);
    }

    // GREEDY WAITLIST PROMOTION
    const seatsReleased = booking.passengers.filter((p) => p.status === 'CONFIRMED').length;
    let promotedPassengers: WaitlistPriorityItem[] = [];

    if (seatsReleased > 0) {
      const waitlist = getStoredWaitlist();
      const promotionResult = promoteWaitlistedPassengers(waitlist, seatsReleased);
      promotedPassengers = promotionResult.promotedPassengers;
      saveWaitlist(promotionResult.remainingWaitlist);
    }

    return {
      cancelledBooking: booking,
      refundAmount,
      cancellationCharge,
      greedyRefund,
      promotedPassengers,
    };
  },

  async getWaitlist(): Promise<WaitlistPriorityItem[]> {
    return getStoredWaitlist();
  },
};
