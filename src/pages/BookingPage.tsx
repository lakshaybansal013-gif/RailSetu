import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { trainService } from '../services/trainService';
import { authService, SavedPassenger } from '../services/authService';
import { Train, CoachClass, QuotaType, BerthType } from '../types';
import { BerthLayoutVisualizer } from '../components/BerthLayoutVisualizer';
import { useToast } from '../components/Toast';
import {
  Train as TrainIcon,
  User,
  Plus,
  Trash2,
  ShieldCheck,
  Zap,
  ArrowRight,
  Info,
  Layers,
  Sparkles,
} from 'lucide-react';

const passengerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  age: z.coerce.number().min(1, 'Age must be >= 1').max(120, 'Age must be <= 120'),
  gender: z.enum(['M', 'F', 'O']),
  berthPreference: z.enum(['L', 'M', 'U', 'SL', 'SU', 'WS', 'AS']).optional(),
});

const bookingFormSchema = z.object({
  passengers: z.array(passengerSchema).min(1, 'At least 1 passenger is required').max(6, 'Maximum 6 passengers allowed'),
});

type BookingFormData = z.infer<typeof bookingFormSchema>;

export const BookingPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const trainNumber = searchParams.get('train') || '22436';
  const coachClass = (searchParams.get('class') as CoachClass) || '3A';
  const fromCode = (searchParams.get('from') || 'NDLS').toUpperCase();
  const toCode = (searchParams.get('to') || 'BSB').toUpperCase();
  const travelDate = searchParams.get('date') || new Date().toISOString().split('T')[0];
  const quota = (searchParams.get('quota') as QuotaType) || 'GN';

  const [train, setTrain] = useState<Train | null>(null);
  const [loading, setLoading] = useState(true);
  const savedPassengers = authService.getSavedPassengers();

  const {
    register,
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      passengers: [
        { name: 'Vikram Aditya', age: 24, gender: 'M', berthPreference: 'L' },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'passengers',
  });

  const watchedPassengers = watch('passengers');

  useEffect(() => {
    trainService.getTrainByNumber(trainNumber).then(res => {
      setTrain(res || null);
      setLoading(false);
    });
  }, [trainNumber]);

  const addSavedPassenger = (sp: SavedPassenger) => {
    if (fields.length >= 6) {
      showToast('error', 'Limit Reached', 'You can only add up to 6 passengers per booking.');
      return;
    }
    append({
      name: sp.name,
      age: sp.age,
      gender: sp.gender,
      berthPreference: sp.berthPreference,
    });
    showToast('success', 'Passenger Added', `${sp.name} added from saved list.`);
  };

  const onSubmit = (data: BookingFormData) => {
    // Save draft intent to sessionStorage for payment page
    const draftBooking = {
      trainNumber,
      trainName: train?.trainName || 'Express',
      travelDate,
      fromStation: fromCode,
      toStation: toCode,
      coachClass,
      quota,
      passengers: data.passengers,
      baseFare: (train?.classes[coachClass]?.fare || 1450) * data.passengers.length,
      convenienceFee: 35.40,
      totalFare: (train?.classes[coachClass]?.fare || 1450) * data.passengers.length + 35.40,
    };
    sessionStorage.setItem('railway_draft_booking', JSON.stringify(draftBooking));
    navigate('/payment');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
        <p className="text-xs text-slate-500 mt-3 font-medium">Loading train and berth allocation matrix...</p>
      </div>
    );
  }

  const farePerPassenger = train?.classes[coachClass]?.fare || 1450;
  const passengerCount = watchedPassengers?.length || 1;
  const subtotal = farePerPassenger * passengerCount;
  const convenienceFee = 35.40;
  const grandTotal = subtotal + convenienceFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xs font-bold px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 font-mono">
              #{train?.trainNumber}
            </span>
            <span className="text-xs font-semibold text-slate-300">{train?.type}</span>
          </div>
          <h2 className="text-2xl font-black">{train?.trainName}</h2>
          <p className="text-xs text-slate-300 mt-1">
            {fromCode} &rarr; {toCode} &bull; Journey Date: <span className="text-orange-400 font-semibold">{travelDate}</span> &bull; Class: <span className="text-white font-bold">{coachClass}</span> &bull; Quota: <span className="text-white font-bold">{quota}</span>
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-right">
          <span className="text-[11px] text-slate-300">Fare per passenger</span>
          <p className="text-2xl font-black text-white">₹{farePerPassenger}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Passenger Input Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Quick add saved passengers */}
            {savedPassengers.length > 0 && (
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
                <span className="text-xs font-bold uppercase text-slate-500 tracking-wider block mb-2">
                  Quick Add From Saved Passengers
                </span>
                <div className="flex flex-wrap gap-2">
                  {savedPassengers.map(sp => (
                    <button
                      key={sp.id}
                      type="button"
                      onClick={() => addSavedPassenger(sp)}
                      className="text-xs font-medium px-3 py-1.5 rounded-xl border border-slate-200 hover:border-orange-500 hover:bg-orange-50 text-slate-700 transition flex items-center gap-1.5"
                    >
                      <Plus className="w-3 h-3 text-orange-600" />
                      <span>{sp.name} ({sp.age}y, {sp.berthPreference})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Passenger Fields */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <User className="w-5 h-5 text-orange-600" />
                  <h3 className="font-extrabold text-base text-slate-900">Passenger Information</h3>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {fields.length}/6 Passengers
                </span>
              </div>

              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="p-4 bg-slate-50/70 rounded-xl border border-slate-200/80 space-y-3 relative group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 font-mono">
                      Passenger #{index + 1}
                    </span>
                    {fields.length > 1 && (
                      <button
                        type="button"
                        onClick={() => remove(index)}
                        className="text-rose-500 hover:text-rose-700 p-1 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Remove</span>
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {/* Name */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-600 mb-1">
                        Full Name as per Aadhaar / ID
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Rahul Sharma"
                        {...register(`passengers.${index}.name`)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                      {errors.passengers?.[index]?.name && (
                        <p className="text-[10px] text-rose-500 mt-1 font-medium">
                          {errors.passengers[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Age</label>
                      <input
                        type="number"
                        min="1"
                        max="120"
                        placeholder="Age"
                        {...register(`passengers.${index}.age`)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500"
                      />
                      {errors.passengers?.[index]?.age && (
                        <p className="text-[10px] text-rose-500 mt-1 font-medium">
                          {errors.passengers[index]?.age?.message}
                        </p>
                      )}
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1">Gender</label>
                      <select
                        {...register(`passengers.${index}.gender`)}
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                      >
                        <option value="M">Male</option>
                        <option value="F">Female</option>
                        <option value="O">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Berth Preference */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Berth Preference (Activity Selection will optimize seat packing)
                    </label>
                    <select
                      {...register(`passengers.${index}.berthPreference`)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer"
                    >
                      <option value="L">Lower Berth (Senior &amp; priority preferred)</option>
                      <option value="M">Middle Berth</option>
                      <option value="U">Upper Berth</option>
                      <option value="SL">Side Lower Berth</option>
                      <option value="SU">Side Upper Berth</option>
                      <option value="WS">Window Seat (CC/EC)</option>
                      <option value="AS">Aisle Seat (CC/EC)</option>
                    </select>
                  </div>
                </div>
              ))}

              {fields.length < 6 && (
                <button
                  type="button"
                  onClick={() =>
                    append({ name: '', age: 25, gender: 'M', berthPreference: 'L' })
                  }
                  className="w-full py-2.5 border-2 border-dashed border-orange-300 text-orange-600 hover:bg-orange-50 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Another Passenger (+₹{farePerPassenger})</span>
                </button>
              )}
            </div>

            {/* Algorithm Live Allocation Notice */}
            <div className="bg-orange-50/80 border border-orange-200 p-4 rounded-2xl flex items-start gap-3 text-xs text-orange-950">
              <Zap className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Greedy Activity Selection Active:</span>
                <p className="mt-0.5 text-slate-600">
                  Your seat will be dynamically allocated onto Coach B1/C1 using earliest-finish non-overlapping interval packing. Physical berths are reused across intermediate stations to maximize rail capacity.
                </p>
              </div>
            </div>

            {/* Submit button */}
            <button
              type="submit"
              className="w-full py-4 px-6 rounded-2xl font-black text-base text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-700 hover:to-amber-600 transition shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Continue to Payment Gateway</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>

        {/* Right 1 Col: Coach Preview & Price Summary */}
        <div className="space-y-6">
          {/* Price Summary Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm uppercase text-slate-900 tracking-wider pb-2 border-b border-slate-100">
              Fare Breakdown
            </h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>Base Fare ({passengerCount} × ₹{farePerPassenger})</span>
                <span className="font-bold text-slate-900">₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>IRCTC Convenience Fee &amp; GST</span>
                <span className="font-bold text-slate-900">₹{convenienceFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-600">
                <span>Greedy Dynamic Allocation Fee</span>
                <span className="font-bold">FREE (0.00)</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="font-extrabold text-sm text-slate-900">Total Amount Payable</span>
              <span className="text-2xl font-black text-orange-600">₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          {/* Coach Schematic Visualizer */}
          <BerthLayoutVisualizer
            coachClass={coachClass}
            selectedBerth={12}
            coachName={coachClass === 'CC' || coachClass === 'EC' ? 'C1' : 'B1'}
          />
        </div>
      </div>
    </div>
  );
};
