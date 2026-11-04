-- ============================================================================
-- RAILSETU - 3NF NORMALIZED RELATIONAL DATABASE SCHEMA (DBMS COMPLIANT)
-- ============================================================================

-- 1. STATIONS TABLE
CREATE TABLE IF NOT EXISTS public.stations (
  code text PRIMARY KEY,
  name text NOT NULL,
  city text NOT NULL,
  state text NOT NULL,
  zone text NOT NULL DEFAULT '',
  lat double precision NOT NULL,
  lng double precision NOT NULL,
  platforms_count integer NOT NULL CHECK (platforms_count > 0)
);

-- 2. TRAINS TABLE (Master train entity - JSONB free)
CREATE TABLE IF NOT EXISTS public.trains (
  train_number text PRIMARY KEY,
  train_name text NOT NULL,
  type text NOT NULL CHECK (type IN ('Vande Bharat', 'Rajdhani', 'Shatabdi', 'Tejas', 'Superfast', 'Express')),
  source_code text NOT NULL REFERENCES public.stations(code) ON UPDATE CASCADE,
  destination_code text NOT NULL REFERENCES public.stations(code) ON UPDATE CASCADE,
  departure_time text NOT NULL,
  arrival_time text NOT NULL,
  duration text NOT NULL,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  distance_km integer NOT NULL CHECK (distance_km > 0),
  running_days jsonb NOT NULL DEFAULT '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb,
  average_punctuality integer NOT NULL DEFAULT 90 CHECK (average_punctuality BETWEEN 0 AND 100)
);

-- 3. TRAIN_STOPS TABLE (1NF & 2NF normalized intermediate train route stops)
CREATE TABLE IF NOT EXISTS public.train_stops (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  train_number text NOT NULL REFERENCES public.trains(train_number) ON DELETE CASCADE,
  station_code text NOT NULL REFERENCES public.stations(code) ON UPDATE CASCADE,
  station_name text NOT NULL,
  stop_order integer NOT NULL CHECK (stop_order >= 0),
  arrival_time text NOT NULL,
  departure_time text NOT NULL,
  halt_minutes integer NOT NULL DEFAULT 0 CHECK (halt_minutes >= 0),
  day_count integer NOT NULL DEFAULT 1 CHECK (day_count >= 1),
  distance_km integer NOT NULL CHECK (distance_km >= 0),
  platform_number integer NOT NULL DEFAULT 1 CHECK (platform_number > 0),
  UNIQUE (train_number, stop_order),
  UNIQUE (train_number, station_code)
);

-- 4. TRAIN_CLASSES TABLE (Normalized coach classes and live fare/seat availability)
CREATE TABLE IF NOT EXISTS public.train_classes (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  train_number text NOT NULL REFERENCES public.trains(train_number) ON DELETE CASCADE,
  coach_class text NOT NULL CHECK (coach_class IN ('1A', '2A', '3A', 'SL', 'CC', 'EC', '2S')),
  fare numeric(10,2) NOT NULL CHECK (fare > 0),
  available_seats integer NOT NULL DEFAULT 0 CHECK (available_seats >= 0),
  rac_seats integer NOT NULL DEFAULT 0 CHECK (rac_seats >= 0),
  wl_seats integer NOT NULL DEFAULT 0 CHECK (wl_seats >= 0),
  status text NOT NULL DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RAC', 'WL')),
  UNIQUE (train_number, coach_class)
);

-- 5. BOOKINGS TABLE (Normalized booking header)
CREATE TABLE IF NOT EXISTS public.bookings (
  pnr text PRIMARY KEY CHECK (pnr ~ '^[0-9]{10}$'),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  train_number text NOT NULL REFERENCES public.trains(train_number),
  train_name text NOT NULL,
  travel_date date NOT NULL,
  from_station text NOT NULL REFERENCES public.stations(code),
  to_station text NOT NULL REFERENCES public.stations(code),
  coach_class text NOT NULL CHECK (coach_class IN ('1A', '2A', '3A', 'SL', 'CC', 'EC', '2S')),
  quota text NOT NULL CHECK (quota IN ('GN', 'TQ', 'LD', 'SS', 'DP')),
  total_fare numeric(12,2) NOT NULL CHECK (total_fare >= 0),
  status text NOT NULL CHECK (status IN ('CONFIRMED', 'RAC', 'WAITLISTED', 'CANCELLED')),
  platform_number integer CHECK (platform_number > 0),
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 6. PASSENGERS TABLE (1:N relationship with bookings)
CREATE TABLE IF NOT EXISTS public.passengers (
  passenger_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_pnr text NOT NULL REFERENCES public.bookings(pnr) ON DELETE CASCADE,
  name text NOT NULL,
  age integer NOT NULL CHECK (age > 0 AND age <= 120),
  gender text NOT NULL CHECK (gender IN ('M', 'F', 'O')),
  berth_preference text CHECK (berth_preference IN ('L', 'M', 'U', 'SL', 'SU', 'WS', 'AS') OR berth_preference IS NULL),
  quota text NOT NULL CHECK (quota IN ('GN', 'TQ', 'LD', 'SS', 'DP')),
  coach text,
  berth_number integer,
  berth_type text CHECK (berth_type IN ('L', 'M', 'U', 'SL', 'SU', 'WS', 'AS') OR berth_type IS NULL),
  status text NOT NULL CHECK (status IN ('CONFIRMED', 'RAC', 'WL', 'CANCELLED')),
  wl_number integer,
  rac_number integer
);

-- 7. PAYMENTS TABLE (Separate payment entity for transaction tracking)
CREATE TABLE IF NOT EXISTS public.payments (
  payment_id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_pnr text NOT NULL REFERENCES public.bookings(pnr) ON DELETE CASCADE,
  transaction_id text NOT NULL UNIQUE,
  amount numeric(12,2) NOT NULL CHECK (amount >= 0),
  payment_method text NOT NULL,
  status text NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS', 'FAILED', 'REFUNDED')),
  paid_at timestamptz NOT NULL DEFAULT now()
);

-- 8. INDEXES FOR PERFORMANCE OPTIMIZATION
CREATE INDEX IF NOT EXISTS idx_train_stops_train ON public.train_stops(train_number, stop_order);
CREATE INDEX IF NOT EXISTS idx_train_stops_station ON public.train_stops(station_code);
CREATE INDEX IF NOT EXISTS idx_train_classes_train ON public.train_classes(train_number);
CREATE INDEX IF NOT EXISTS idx_bookings_user ON public.bookings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_passengers_booking ON public.passengers(booking_pnr);
CREATE INDEX IF NOT EXISTS idx_payments_booking ON public.payments(booking_pnr);

-- 9. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.stations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trains ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.train_stops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.train_classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.passengers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "stations readable by everyone" ON public.stations;
CREATE POLICY "stations readable by everyone" ON public.stations FOR SELECT USING (true);

DROP POLICY IF EXISTS "trains readable by everyone" ON public.trains;
CREATE POLICY "trains readable by everyone" ON public.trains FOR SELECT USING (true);

DROP POLICY IF EXISTS "train_stops readable by everyone" ON public.train_stops;
CREATE POLICY "train_stops readable by everyone" ON public.train_stops FOR SELECT USING (true);

DROP POLICY IF EXISTS "train_classes readable by everyone" ON public.train_classes;
CREATE POLICY "train_classes readable by everyone" ON public.train_classes FOR SELECT USING (true);

DROP POLICY IF EXISTS "users read own bookings" ON public.bookings;
CREATE POLICY "users read own bookings" ON public.bookings FOR SELECT TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "users create own bookings" ON public.bookings;
CREATE POLICY "users create own bookings" ON public.bookings FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "users cancel own bookings" ON public.bookings;
CREATE POLICY "users cancel own bookings" ON public.bookings FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "passengers readable by booking owner" ON public.passengers;
CREATE POLICY "passengers readable by booking owner" ON public.passengers FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.pnr = passengers.booking_pnr AND b.user_id = auth.uid()));

DROP POLICY IF EXISTS "passengers insert by booking owner" ON public.passengers;
CREATE POLICY "passengers insert by booking owner" ON public.passengers FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings b WHERE b.pnr = passengers.booking_pnr AND b.user_id = auth.uid()));

DROP POLICY IF EXISTS "payments readable by booking owner" ON public.payments;
CREATE POLICY "payments readable by booking owner" ON public.payments FOR SELECT TO authenticated 
  USING (EXISTS (SELECT 1 FROM public.bookings b WHERE b.pnr = payments.booking_pnr AND b.user_id = auth.uid()));

DROP POLICY IF EXISTS "payments insert by booking owner" ON public.payments;
CREATE POLICY "payments insert by booking owner" ON public.payments FOR INSERT TO authenticated 
  WITH CHECK (EXISTS (SELECT 1 FROM public.bookings b WHERE b.pnr = payments.booking_pnr AND b.user_id = auth.uid()));

-- ============================================================================
-- SEED DATA: STATIONS, TRAINS, INTERMEDIATE STOPS, AND CLASSES
-- ============================================================================

INSERT INTO public.stations (code, name, city, state, zone, lat, lng, platforms_count) VALUES
('NDLS','New Delhi Railway Station','New Delhi','Delhi','Northern Railway (NR)',28.6429,77.2195,16),
('CSMT','Chhatrapati Shivaji Maharaj Terminus','Mumbai','Maharashtra','Central Railway (CR)',18.9401,72.8354,18),
('HWH','Howrah Junction','Kolkata','West Bengal','Eastern Railway (ER)',22.5839,88.3426,23),
('MAS','MGR Chennai Central','Chennai','Tamil Nadu','Southern Railway (SR)',13.0827,80.2707,17),
('SBC','KSR Bengaluru City','Bengaluru','Karnataka','South Western Railway (SWR)',12.9781,77.5694,10),
('HYB','Hyderabad Deccan Nampally','Hyderabad','Telangana','South Central Railway (SCR)',17.3916,78.4682,6),
('ADI','Ahmedabad Junction','Ahmedabad','Gujarat','Western Railway (WR)',23.0225,72.6029,12),
('JP','Jaipur Junction','Jaipur','Rajasthan','North Western Railway (NWR)',26.9196,75.7878,8),
('BSB','Varanasi Junction (Cantt)','Varanasi','Uttar Pradesh','Northern Railway (NR)',25.3267,82.9863,9),
('PNBE','Patna Junction','Patna','Bihar','East Central Railway (ECR)',25.6022,85.1376,10),
('LKO','Lucknow Charbagh NR','Lucknow','Uttar Pradesh','Northern Railway (NR)',26.8315,80.9234,9),
('PUNE','Pune Junction','Pune','Maharashtra','Central Railway (CR)',18.5284,73.8743,6),
('CDG','Chandigarh Junction','Chandigarh','Chandigarh','Northern Railway (NR)',30.7046,76.8295,6),
('MAO','Madgaon Junction','Goa','Goa','Konkan Railway (KR)',15.2736,73.9789,4),
('GHY','Guwahati Junction','Guwahati','Assam','Northeast Frontier Railway (NFR)',26.1834,91.7503,7)
ON CONFLICT (code) DO NOTHING;

-- TRAINS MASTER INSERTION
INSERT INTO public.trains (train_number, train_name, type, source_code, destination_code, departure_time, arrival_time, duration, duration_minutes, distance_km, running_days, average_punctuality) VALUES
('22436', 'Vande Bharat Express', 'Vande Bharat', 'NDLS', 'BSB', '06:00', '14:00', '8h 00m', 480, 759, '["Tue","Wed","Fri","Sat","Sun"]'::jsonb, 96),
('12957', 'Ahmedabad Rajdhani Express', 'Rajdhani', 'NDLS', 'ADI', '19:55', '11:45', '15h 50m', 950, 934, '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb, 96),
('12951', 'Mumbai Rajdhani Express', 'Rajdhani', 'NDLS', 'CSMT', '16:00', '08:35', '16h 35m', 995, 1384, '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb, 97),
('12301', 'Howrah Rajdhani Express', 'Rajdhani', 'NDLS', 'HWH', '16:55', '10:00', '17h 05m', 1025, 1447, '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb, 93),
('12302', 'Howrah New Delhi Rajdhani', 'Rajdhani', 'HWH', 'NDLS', '14:05', '10:00', '19h 55m', 1195, 1447, '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb, 92),
('12433', 'Chennai Rajdhani Express', 'Rajdhani', 'NDLS', 'MAS', '22:30', '06:30', '32h 00m', 1920, 2175, '["Tue","Fri"]'::jsonb, 91),
('11013', 'Mumbai Express', 'Express', 'CSMT', 'MAS', '06:00', '06:00', '24h 00m', 1440, 1326, '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb, 85),
('12009', 'Mumbai Ahmedabad Shatabdi', 'Shatabdi', 'CSMT', 'ADI', '06:25', '13:10', '6h 45m', 405, 492, '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb, 94),
('12505', 'North East Express', 'Express', 'HWH', 'GHY', '23:30', '20:00', '20h 30m', 1230, 992, '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb, 87),
('12007', 'Bengaluru Chennai Shatabdi', 'Shatabdi', 'SBC', 'MAS', '06:00', '11:00', '5h 00m', 300, 362, '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb, 96),
('10103', 'Mandovi Express', 'Express', 'CSMT', 'MAO', '07:10', '19:30', '12h 20m', 740, 580, '["Mon","Wed","Fri","Sun"]'::jsonb, 84),
('12005', 'Kalka Shatabdi Express', 'Shatabdi', 'NDLS', 'CDG', '07:20', '10:40', '3h 20m', 200, 260, '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb, 98),
('12163', 'Hyderabad Bengaluru Express', 'Superfast', 'HYB', 'SBC', '15:30', '23:45', '8h 15m', 495, 575, '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb, 90),
('22221', 'Mumbai CSMT Rajdhani Express', 'Rajdhani', 'CSMT', 'NDLS', '16:00', '08:00', '16h 00m', 960, 1384, '["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]'::jsonb, 95)
ON CONFLICT (train_number) DO NOTHING;

-- TRAIN_STOPS INSERTION
INSERT INTO public.train_stops (train_number, station_code, station_name, stop_order, arrival_time, departure_time, halt_minutes, day_count, distance_km, platform_number) VALUES
-- 22436 Vande Bharat
('22436', 'NDLS', 'New Delhi Railway Station', 1, 'Source', '06:00', 0, 1, 0, 1),
('22436', 'BSB', 'Varanasi Junction (Cantt)', 2, '14:00', 'Destination', 0, 1, 759, 1),

-- 12957 Ahmedabad Rajdhani
('12957', 'NDLS', 'New Delhi', 1, 'Source', '19:55', 0, 1, 0, 2),
('12957', 'JP', 'Jaipur Junction', 2, '23:50', '00:05', 15, 1, 308, 4),
('12957', 'ADI', 'Ahmedabad Junction', 3, '11:45', 'Destination', 0, 2, 934, 3),

-- 12951 Mumbai Rajdhani
('12951', 'NDLS', 'New Delhi', 1, 'Source', '16:00', 0, 1, 0, 5),
('12951', 'ADI', 'Ahmedabad Junction', 2, '01:30', '01:45', 15, 2, 934, 2),
('12951', 'CSMT', 'Mumbai CSMT', 3, '08:35', 'Destination', 0, 2, 1384, 8),

-- 12301 Howrah Rajdhani
('12301', 'NDLS', 'New Delhi', 1, 'Source', '16:55', 0, 1, 0, 3),
('12301', 'LKO', 'Lucknow Charbagh', 2, '22:50', '23:00', 10, 1, 497, 2),
('12301', 'BSB', 'Varanasi Junction', 3, '02:35', '02:45', 10, 2, 783, 1),
('12301', 'PNBE', 'Patna Junction', 4, '05:50', '06:00', 10, 2, 1031, 4),
('12301', 'HWH', 'Howrah Junction', 5, '10:00', 'Destination', 0, 2, 1447, 1),

-- 12302 Return Howrah Rajdhani
('12302', 'HWH', 'Howrah Junction', 1, 'Source', '14:05', 0, 1, 0, 2),
('12302', 'PNBE', 'Patna Junction', 2, '18:30', '18:40', 10, 1, 530, 5),
('12302', 'BSB', 'Varanasi Junction', 3, '21:30', '21:40', 10, 1, 778, 3),
('12302', 'LKO', 'Lucknow Charbagh', 4, '01:00', '01:10', 10, 2, 1061, 1),
('12302', 'NDLS', 'New Delhi', 5, '10:00', 'Destination', 0, 2, 1447, 6),

-- 12433 Chennai Rajdhani
('12433', 'NDLS', 'New Delhi', 1, 'Source', '22:30', 0, 1, 0, 7),
('12433', 'HYB', 'Hyderabad Deccan', 2, '20:30', '20:45', 15, 2, 1545, 3),
('12433', 'MAS', 'MGR Chennai Central', 3, '06:30', 'Destination', 0, 3, 2175, 5),

-- 11013 Mumbai Express
('11013', 'CSMT', 'Mumbai CSMT', 1, 'Source', '06:00', 0, 1, 0, 1),
('11013', 'PUNE', 'Pune Junction', 2, '09:30', '09:45', 15, 1, 192, 2),
('11013', 'HYB', 'Hyderabad Deccan', 3, '20:00', '20:15', 15, 1, 764, 5),
('11013', 'MAS', 'MGR Chennai Central', 4, '06:00', 'Destination', 0, 2, 1326, 2),

-- 12009 Mumbai Ahmedabad Shatabdi
('12009', 'CSMT', 'Mumbai CSMT', 1, 'Source', '06:25', 0, 1, 0, 4),
('12009', 'ADI', 'Ahmedabad Junction', 2, '13:10', 'Destination', 0, 1, 492, 6),

-- 12505 North East Express
('12505', 'HWH', 'Howrah Junction', 1, 'Source', '23:30', 0, 1, 0, 5),
('12505', 'PNBE', 'Patna Junction', 2, '05:30', '05:40', 10, 2, 530, 3),
('12505', 'GHY', 'Guwahati Junction', 3, '20:00', 'Destination', 0, 2, 992, 1),

-- 12007 Bengaluru Chennai Shatabdi
('12007', 'SBC', 'KSR Bengaluru City', 1, 'Source', '06:00', 0, 1, 0, 1),
('12007', 'MAS', 'MGR Chennai Central', 2, '11:00', 'Destination', 0, 1, 362, 3),

-- 10103 Mandovi Express
('10103', 'CSMT', 'Mumbai CSMT', 1, 'Source', '07:10', 0, 1, 0, 3),
('10103', 'PUNE', 'Pune Junction', 2, '10:00', '10:15', 15, 1, 192, 4),
('10103', 'MAO', 'Madgaon Junction', 3, '19:30', 'Destination', 0, 1, 580, 2),

-- 12005 Kalka Shatabdi Express
('12005', 'NDLS', 'New Delhi', 1, 'Source', '07:20', 0, 1, 0, 1),
('12005', 'CDG', 'Chandigarh Junction', 2, '10:40', 'Destination', 0, 1, 260, 2),

-- 12163 Hyderabad Bengaluru Express
('12163', 'HYB', 'Hyderabad Deccan', 1, 'Source', '15:30', 0, 1, 0, 4),
('12163', 'SBC', 'KSR Bengaluru City', 2, '23:45', 'Destination', 0, 1, 575, 5),

-- 22221 Mumbai CSMT Rajdhani Express
('22221', 'CSMT', 'Mumbai CSMT', 1, 'Source', '16:00', 0, 1, 0, 7),
('22221', 'ADI', 'Ahmedabad Junction', 2, '22:30', '22:45', 15, 1, 492, 1),
('22221', 'NDLS', 'New Delhi', 3, '08:00', 'Destination', 0, 2, 1384, 6)
ON CONFLICT (train_number, stop_order) DO NOTHING;

-- TRAIN_CLASSES INSERTION
INSERT INTO public.train_classes (train_number, coach_class, fare, available_seats, rac_seats, wl_seats, status) VALUES
-- 22436
('22436', 'CC', 1750, 40, 0, 0, 'AVAILABLE'),
('22436', 'EC', 3200, 20, 0, 0, 'AVAILABLE'),
-- 12957
('12957', '1A', 3800, 18, 2, 0, 'AVAILABLE'),
('12957', '2A', 2200, 46, 4, 0, 'AVAILABLE'),
('12957', '3A', 1550, 64, 6, 0, 'AVAILABLE'),
-- 12951
('12951', '1A', 4200, 18, 2, 0, 'AVAILABLE'),
('12951', '2A', 2450, 46, 4, 0, 'AVAILABLE'),
('12951', '3A', 1700, 64, 6, 0, 'AVAILABLE'),
-- 12301
('12301', '1A', 4500, 18, 2, 0, 'AVAILABLE'),
('12301', '2A', 2600, 10, 4, 5, 'RAC'),
('12301', '3A', 1800, 0, 6, 12, 'WL'),
('12301', 'SL', 650, 0, 0, 25, 'WL'),
-- 12302
('12302', '1A', 4500, 18, 2, 0, 'AVAILABLE'),
('12302', '2A', 2600, 46, 4, 0, 'AVAILABLE'),
('12302', '3A', 1800, 64, 6, 0, 'AVAILABLE'),
-- 12433
('12433', '1A', 5500, 18, 2, 0, 'AVAILABLE'),
('12433', '2A', 3200, 46, 4, 0, 'AVAILABLE'),
('12433', '3A', 2200, 5, 6, 8, 'RAC'),
-- 11013
('11013', '2A', 1800, 46, 4, 0, 'AVAILABLE'),
('11013', '3A', 1200, 64, 6, 0, 'AVAILABLE'),
('11013', 'SL', 480, 200, 10, 0, 'AVAILABLE'),
-- 12009
('12009', 'CC', 1250, 40, 0, 0, 'AVAILABLE'),
('12009', 'EC', 2400, 20, 0, 0, 'AVAILABLE'),
-- 12505
('12505', '2A', 2100, 46, 4, 0, 'AVAILABLE'),
('12505', '3A', 1450, 64, 6, 0, 'AVAILABLE'),
('12505', 'SL', 520, 280, 15, 0, 'AVAILABLE'),
-- 12007
('12007', 'CC', 950, 40, 0, 0, 'AVAILABLE'),
('12007', 'EC', 1800, 20, 0, 0, 'AVAILABLE'),
-- 10103
('10103', '2A', 1200, 46, 4, 0, 'AVAILABLE'),
('10103', '3A', 850, 64, 6, 0, 'AVAILABLE'),
('10103', 'SL', 340, 280, 15, 0, 'AVAILABLE'),
-- 12005
('12005', 'CC', 750, 40, 0, 0, 'AVAILABLE'),
('12005', 'EC', 1400, 20, 0, 0, 'AVAILABLE'),
-- 12163
('12163', '2A', 1500, 46, 4, 0, 'AVAILABLE'),
('12163', '3A', 1050, 64, 6, 0, 'AVAILABLE'),
('12163', 'SL', 420, 200, 10, 0, 'AVAILABLE'),
-- 22221
('22221', '1A', 4200, 18, 2, 0, 'AVAILABLE'),
('22221', '2A', 2450, 46, 4, 0, 'AVAILABLE'),
('22221', '3A', 1700, 64, 6, 0, 'AVAILABLE')
ON CONFLICT (train_number, coach_class) DO NOTHING;
