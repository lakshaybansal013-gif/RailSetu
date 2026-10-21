import { NetworkEdge } from '../types';

export const MOCK_NETWORK_EDGES: NetworkEdge[] = [
  { id: 'E-NDLS-CDG', source: 'NDLS', destination: 'CDG', distanceKm: 266, costInCr: 850 },
  { id: 'E-NDLS-JP', source: 'NDLS', destination: 'JP', distanceKm: 308, costInCr: 980 },
  { id: 'E-NDLS-LKO', source: 'NDLS', destination: 'LKO', distanceKm: 512, costInCr: 1450 },
  { id: 'E-JP-ADI', source: 'JP', destination: 'ADI', distanceKm: 626, costInCr: 1720 },
  { id: 'E-ADI-CSMT', source: 'ADI', destination: 'CSMT', distanceKm: 492, costInCr: 1540 },
  { id: 'E-CSMT-PUNE', source: 'CSMT', destination: 'PUNE', distanceKm: 192, costInCr: 720 },
  { id: 'E-CSMT-MAO', source: 'CSMT', destination: 'MAO', distanceKm: 580, costInCr: 1890 },
  { id: 'E-PUNE-SBC', source: 'PUNE', destination: 'SBC', distanceKm: 876, costInCr: 2350 },
  { id: 'E-SBC-MAS', source: 'SBC', destination: 'MAS', distanceKm: 362, costInCr: 1120 },
  { id: 'E-MAS-HYB', source: 'MAS', destination: 'HYB', distanceKm: 509, costInCr: 1480 },
  { id: 'E-HYB-PUNE', source: 'HYB', destination: 'PUNE', distanceKm: 560, costInCr: 1650 },
  { id: 'E-HYB-NDLS', source: 'HYB', destination: 'NDLS', distanceKm: 1675, costInCr: 4200 },
  { id: 'E-LKO-BSB', source: 'LKO', destination: 'BSB', distanceKm: 285, costInCr: 880 },
  { id: 'E-BSB-PNBE', source: 'BSB', destination: 'PNBE', distanceKm: 240, costInCr: 790 },
  { id: 'E-PNBE-HWH', source: 'PNBE', destination: 'HWH', distanceKm: 535, costInCr: 1520 },
  { id: 'E-PNBE-GHY', source: 'PNBE', destination: 'GHY', distanceKm: 860, costInCr: 2450 },
  { id: 'E-HWH-GHY', source: 'HWH', destination: 'GHY', distanceKm: 1000, costInCr: 2780 },
  { id: 'E-NDLS-CSMT', source: 'NDLS', destination: 'CSMT', distanceKm: 1384, costInCr: 3600 },
  { id: 'E-NDLS-HWH', source: 'NDLS', destination: 'HWH', distanceKm: 1451, costInCr: 3750 },
  { id: 'E-MAS-HWH', source: 'MAS', destination: 'HWH', distanceKm: 1660, costInCr: 4100 },
];
