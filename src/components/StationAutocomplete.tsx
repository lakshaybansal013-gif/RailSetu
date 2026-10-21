import React, { useState, useEffect, useRef } from 'react';
import { Station } from '../types';
import { stationService } from '../services/stationService';
import { MapPin, Search, X } from 'lucide-react';

interface StationAutocompleteProps {
  id: string;
  label: string;
  placeholder?: string;
  value: string; // station code
  onChange: (stationCode: string) => void;
  required?: boolean;
}

export const StationAutocomplete: React.FC<StationAutocompleteProps> = ({
  id,
  label,
  placeholder = 'Search by station or city...',
  value,
  onChange,
  required = false,
}) => {
  const [stations, setStations] = useState<Station[]>([]);
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    stationService.getAllStations().then(data => {
      setStations(data);
      if (value) {
        const found = data.find(s => s.code.toUpperCase() === value.toUpperCase());
        if (found) {
          setQuery(`${found.city} (${found.code})`);
        }
      }
    });
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredStations = stations.filter(s => {
    const q = query.toLowerCase();
    return (
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q)
    );
  });

  const handleSelect = (station: Station) => {
    onChange(station.code);
    setQuery(`${station.city} (${station.code})`);
    setIsOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.min(prev + 1, filteredStations.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && filteredStations[highlightedIndex]) {
      e.preventDefault();
      handleSelect(filteredStations[highlightedIndex]);
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label htmlFor={id} className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-orange-500" />
        <input
          id={id}
          type="text"
          value={query}
          placeholder={placeholder}
          required={required}
          onChange={e => {
            setQuery(e.target.value);
            setIsOpen(true);
            setHighlightedIndex(0);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          className="w-full pl-8 pr-4 py-1.5 bg-transparent text-slate-800 text-sm font-semibold placeholder-slate-300 focus:outline-none transition"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              onChange('');
              setIsOpen(true);
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-slate-200 hover:bg-slate-300 flex items-center justify-center text-slate-500 transition"
          >
            <X className="w-2.5 h-2.5" />
          </button>
        )}
      </div>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 max-h-64 overflow-y-auto bg-white rounded-xl shadow-2xl border border-slate-100 z-50 py-1 divide-y divide-slate-50">
          {filteredStations.length === 0 ? (
            <div className="p-3 text-xs text-slate-500 flex items-center gap-2">
              <Search className="w-4 h-4" /> No stations found matching "{query}"
            </div>
          ) : (
            filteredStations.map((station, idx) => (
              <div
                key={station.code}
                onClick={() => handleSelect(station)}
                onMouseEnter={() => setHighlightedIndex(idx)}
                className={`px-3.5 py-2.5 cursor-pointer flex items-center justify-between transition text-left ${
                  idx === highlightedIndex ? 'bg-orange-50/80 text-orange-950' : 'hover:bg-slate-50 text-slate-700'
                }`}
              >
                <div>
                  <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    {station.city}
                    <span className="text-xs px-2 py-0.5 rounded-md font-mono bg-orange-100 text-orange-800 font-bold">
                      {station.code}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 truncate max-w-xs">{station.name}</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-400 font-medium">{station.state}</span>
                  <div className="text-[10px] text-slate-400">{station.platformsCount} Platforms</div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};
