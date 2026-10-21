-- Run in the Supabase SQL Editor. Safe to re-run.
create table if not exists public.stations (
  code text primary key, name text not null, city text not null, state text not null,
  zone text not null default '', lat double precision not null, lng double precision not null,
  platforms_count integer not null check (platforms_count > 0)
);
create table if not exists public.trains (
  train_number text primary key, train_name text not null, type text not null,
  source_code text not null references public.stations(code), destination_code text not null references public.stations(code),
  departure_time text not null, arrival_time text not null, duration text not null,
  duration_minutes integer not null, distance_km integer not null, running_days jsonb not null default '[]',
  stops jsonb not null default '[]', classes jsonb not null default '{}', average_punctuality integer not null default 90
);
create table if not exists public.bookings (
  pnr text primary key check (pnr ~ '^[0-9]{10}$'), user_id uuid references auth.users(id) on delete set null,
  train_number text not null references public.trains(train_number), train_name text not null,
  travel_date date not null, from_station text not null references public.stations(code), to_station text not null references public.stations(code),
  coach_class text not null, quota text not null, passengers jsonb not null,
  total_fare numeric(12,2) not null check (total_fare >= 0), status text not null,
  created_at timestamptz not null default now(), platform_number integer,
  payment_method text, transaction_id text
);
create index if not exists bookings_owner_created_idx on public.bookings(user_id, created_at desc);
alter table public.stations enable row level security;
alter table public.trains enable row level security;
alter table public.bookings enable row level security;
drop policy if exists "stations readable by everyone" on public.stations;
create policy "stations readable by everyone" on public.stations for select using (true);
drop policy if exists "trains readable by everyone" on public.trains;
create policy "trains readable by everyone" on public.trains for select using (true);
drop policy if exists "users read own bookings" on public.bookings;
create policy "users read own bookings" on public.bookings for select to authenticated using (auth.uid() = user_id);
drop policy if exists "users create own bookings" on public.bookings;
create policy "users create own bookings" on public.bookings for insert to authenticated with check (auth.uid() = user_id);
drop policy if exists "users cancel own bookings" on public.bookings;
create policy "users cancel own bookings" on public.bookings for update to authenticated using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Starter station data. Add the remaining mock stations/trains through the Table Editor as needed.
insert into public.stations (code,name,city,state,zone,lat,lng,platforms_count) values
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
on conflict (code) do nothing;

-- Minimal runnable seed train; the app's mock dataset remains available when VITE_USE_MOCK=true.
insert into public.trains (train_number,train_name,type,source_code,destination_code,departure_time,arrival_time,duration,duration_minutes,distance_km,running_days,stops,classes,average_punctuality)
values ('22436','Vande Bharat Express','Vande Bharat','NDLS','BSB','06:00','14:00','8h 00m',480,759,
$json$["Tue", "Wed", "Fri", "Sat", "Sun"]$json$::jsonb,
$json$[
  {"stationCode":"NDLS", "stationName":"New Delhi Railway Station", "arrivalTime":"Source", "departureTime":"06:00", "haltMinutes":0, "dayCount":1, "distanceKm":0, "platformNumber":1},
  {"stationCode":"BSB", "stationName":"Varanasi Junction (Cantt)", "arrivalTime":"14:00", "departureTime":"Destination", "haltMinutes":0, "dayCount":1, "distanceKm":759, "platformNumber":1}
]$json$::jsonb,
$json${"CC":{"fare":1750,"availableSeats":40,"racSeats":0,"wlSeats":0,"status":"AVAILABLE"},"EC":{"fare":3200,"availableSeats":20,"racSeats":0,"wlSeats":0,"status":"AVAILABLE"}}$json$::jsonb,96)
on conflict (train_number) do nothing;

-- Demo PNR for the first Auth user. Run this block again after creating your first
-- Auth user if the schema was initially applied before anyone signed in.
insert into public.bookings (pnr,user_id,train_number,train_name,travel_date,from_station,to_station,coach_class,quota,passengers,total_fare,status,platform_number,payment_method,transaction_id)
select '2847193021', id, '22436', 'Vande Bharat Express', current_date + 7, 'NDLS', 'BSB', 'CC', 'GN',
'[{"id":"seed-passenger-1","name":"Demo Passenger","age":30,"gender":"M","quota":"GN","status":"CONFIRMED","seatAllocated":{"coach":"C1","berthNumber":1,"berthType":"WS"}}]',
1750, 'CONFIRMED', 1, 'Seed data', 'TXN-SEED-001'
from auth.users order by created_at limit 1
on conflict (pnr) do update set user_id = excluded.user_id where excluded.user_id is not null;
