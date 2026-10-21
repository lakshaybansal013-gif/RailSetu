import { Station } from '../types';
import { MOCK_STATIONS } from '../mock/stations';
import { supabase, isMockMode } from './supabaseClient';

export const stationService = {
  async getAllStations(): Promise<Station[]> {
    if (isMockMode()) {
      return [...MOCK_STATIONS];
    }
    const { data, error } = await supabase.from('stations').select('*').order('name');
    if (error) {
      throw new Error(`Unable to load stations from Supabase: ${error.message}`);
    }
    return (data ?? []).map((row) => ({ ...row, platformsCount: row.platforms_count } as Station));
  },

  async searchStations(query: string): Promise<Station[]> {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    const all = await this.getAllStations();
    return all.filter(
      s =>
        s.name.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q) ||
        s.city.toLowerCase().includes(q)
    );
  },

  async getStationByCode(code: string): Promise<Station | undefined> {
    const all = await this.getAllStations();
    return all.find(s => s.code.toUpperCase() === code.toUpperCase());
  },
};
