# RailSetu: Indian Railways Smart Ticket Booking & Allocation System

> **College Capstone Project**: Application of **Greedy Algorithms** in Railway Resource Allocation & Ticketing.  
> Built with **React 19, Vite, TypeScript, Tailwind CSS, TanStack Query, Recharts, and react-i18next**.

---

## 🌟 Core Theme: Greedy Algorithms in Railway Logistics

Each algorithm is implemented as a pure, unit-tested TypeScript module in [`/src/algorithms`](file:///c:/Users/laksh/OneDrive/Desktop/railway%20allocation%20system/src/algorithms) and demonstrated with interactive play/pause step visualizers in the **Algorithm Visualizer** page:

| # | Greedy Algorithm | Real-World Railway Problem | Greedy Choice Strategy | Complexity |
|---|------------------|----------------------------|------------------------|------------|
| 1 | **Activity Selection** | Dynamic Berth Sharing | Sorts passenger intervals by destination (earliest finish time) to pack non-overlapping journeys onto the same physical berth. | $O(n \log n)$ |
| 2 | **Interval Partitioning** | Platform Assignment | Sorts trains by arrival time and maintains a Min-Heap of platforms keyed by departure time to find the minimum platform contention depth. | $O(n \log k)$ |
| 3 | **Dijkstra Shortest Path** | Connecting Routes (Fastest vs Cheapest) | Greedily explores next closest station; strictly guarantees a $\ge 30\text{-minute}$ minimum layover at transfer junctions for passenger safety. | $O((V+E) \log V)$ |
| 4 | **Max-Heap Priority Queue** | Waitlist Promotion on Cancellation | Prioritizes Divyangjan (DP), Senior Citizens (SS), Tatkal (TQ), and Ladies (LD) quotas, breaking ties by earliest booking timestamp. | $O(k \log n)$ |
| 5 | **Kruskal's Algorithm** | Cheapest Rail Network MST | Connects 15 major Indian cities by greedily picking lowest-cost track corridors and rejecting cycle edges via Disjoint Set Union (DSU). | $O(E \log E)$ |
| 6 | **Greedy Coin Change** | Ticket Refund Dispensation | Greedily chooses the largest canonical Indian banknote ($₹500 \to ₹200 \to ₹100 \dots$) to minimize total cash bills returned. | $O(D)$ |

---

## 🚀 Quick Start

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Start the Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 3. Run Greedy Algorithm Unit Tests
```bash
npm run test
```
Runs the full Vitest suite testing all 5 pure greedy algorithms with automated assertions.

---

## 🔄 Switching Between Mock Data and Supabase

The system features a **zero-dependency local data layer** in [`/src/services`](file:///c:/Users/laksh/OneDrive/Desktop/railway%20allocation%20system/src/services) with complete Indian railway mock datasets (15 cities, 15 trains with stops, fares, platforms, sample bookings, and waitlists in [`/src/mock`](file:///c:/Users/laksh/OneDrive/Desktop/railway%20allocation%20system/src/mock)).

### Running with Local Mock Data (Default)
In your `.env` file:
```env
VITE_USE_MOCK=true
```
- No backend required.
- Bookings, seat allocations, PNR status, and cancellations persist in `localStorage`.

### Switching to Supabase
1. Create a project at [supabase.com](https://supabase.com), then open **SQL Editor** and run [`supabase/schema.sql`](supabase/schema.sql). It creates the stations, trains, and bookings tables, enables row-level security, and seeds 15 stations plus one example train.
2. Copy `.env.example` to `.env` and set the Project URL and **publishable/anon key** from **Project Settings → API**:
   ```env
   VITE_USE_MOCK=false
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key
   ```
   Never put a service-role or secret key in this client app.
3. In **Authentication → Providers**, enable Email OTP and/or Phone/SMS OTP, and configure an SMS provider if using phone login. In **Authentication → URL Configuration**, add your local app URL (for example `http://localhost:5173`) to the allowed redirect URLs.
4. Restart `npm run dev`. Sign in before creating or looking up bookings; bookings are scoped to the signed-in user by row-level security. Add more train rows in the Table Editor using the column names in the schema. Full schedules and fares are available in `src/mock/trains.ts` if you want to migrate the complete demo dataset.

With missing Supabase credentials, or while `VITE_USE_MOCK=true`, the app uses local mock data and localStorage as before. With `VITE_USE_MOCK=false`, backend errors are surfaced rather than silently writing to local storage.

---

## 📁 Project Architecture

```
railway-allocation-system/
├── src/
│   ├── algorithms/          # Pure greedy algorithm implementations & Vitest tests
│   │   ├── berthAllocation.ts      # 1. Activity Selection
│   │   ├── platformAssignment.ts   # 2. Interval Partitioning with Min-Heap
│   │   ├── routeFinder.ts          # 3. Dijkstra Shortest Path (30m layover)
│   │   ├── waitlistQueue.ts        # 4. Priority Queue Waitlist Promotion
│   │   ├── kruskalMst.ts           # 5. Kruskal's MST with Disjoint Set Union
│   │   ├── coinChange.ts           # 6. Greedy Coin Change Refund
│   │   └── __tests__/              # Unit test suites
│   ├── components/          # Reusable UI components
│   │   ├── Navbar.tsx              # Responsive top navigation with Hindi/English toggle
│   │   ├── Footer.tsx              # Footer with viva cheat sheet
│   │   ├── TrainSearchCard.tsx     # Station autocomplete & filter card
│   │   ├── StationAutocomplete.tsx # Station search dropdown
│   │   ├── BerthLayoutVisualizer.tsx # Interactive train coach/berth schematic
│   │   └── Toast.tsx               # Toast notification provider
│   ├── pages/               # Application views
│   │   ├── Home.tsx                # Hero search, popular routes, algorithm highlights
│   │   ├── SearchResults.tsx       # Direct trains, filters, Dijkstra connecting routes
│   │   ├── BookingPage.tsx         # Passenger forms & Activity Selection allocation
│   │   ├── PaymentPage.tsx         # Simulated UPI/Card gateway with Viva Success/Failure toggle
│   │   ├── ETicketPage.tsx         # Printable E-Ticket with QR code & platform info
│   │   ├── PNRStatusPage.tsx       # Real-time PNR tracking with demo quick-pills
│   │   ├── CancellationPage.tsx    # Refund notes breakdown & Waitlist promotion event
│   │   ├── AuthPage.tsx            # OTP login & saved passenger master list
│   │   ├── BookingHistoryPage.tsx  # User bookings history & cancellation triggers
│   │   ├── AdminDashboardPage.tsx  # Recharts platform occupancy & Kruskal MST network
│   │   ├── AlgorithmVisualizerPage.tsx # Viva visualizer with Play/Pause/Step/Speed
│   │   ├── LiveTrainStatusPage.tsx # Real-time train progression & platform tracking
│   │   └── ContactPage.tsx         # 139 helpline & academic project dossier
│   ├── services/            # Data layer (Supabase vs Mock abstraction)
│   ├── mock/                # 15 Indian stations, 15 trains, bookings, waitlists
│   ├── i18n/                # Hindi / English internationalization
│   └── types/               # TypeScript interfaces & domain models
├── .env.example             # Example environment variables
└── README.md
```

---

## 🎓 Academic Viva Highlights

When presenting this project to examiners:
1. **Show the Algorithm Visualizer (`/visualizer`)**:
   - Use the **Play**, **Step Forward**, and **Speed** controls to show step-by-step state transitions.
   - Point out the **Greedy Choice Property** and **Time Complexity** cards on the right.
2. **Demonstrate Berth Sharing**:
   - Show how Passenger 1 (NDLS $\to$ PRYJ) and Passenger 2 (PRYJ $\to$ HWH) are packed into **Berth 1**, requiring only 1 physical berth for 2 journeys.
3. **Demonstrate Cancellation & Waitlist Promotion**:
   - Cancel a confirmed booking on `/cancel/2847193021`.
   - Watch the **Greedy Coin Change** breakdown output the fewest bills ($₹500 \times 3$, $₹200 \times 1 \dots$).
   - Watch the **Waitlist Promotion** pop the highest-priority passenger (e.g. Senior Citizen or Divyangjan) to `CONFIRMED`.
4. **Demonstrate Multi-Hop Dijkstra**:
   - Search `NDLS` to `MAS` with the **Fastest** toggle and observe the connecting trains respecting the $\ge 30\text{-minute}$ layover rule.
