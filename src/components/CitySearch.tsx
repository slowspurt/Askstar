import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '../hooks/useTranslation';

interface CitySearchProps {
  value: string;
  onChange: (city: string, latitude: number, longitude: number) => void;
  placeholder: string;
  label: string;
  icon?: React.ReactNode;
  error?: string;
  onInputChange?: () => void; // Added prop for tracking input attempts
}

interface CityResult {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  formattedAddress: string;
}

// Define Nominatim API response type
interface NominatimAddress {
  city?: string;
  town?: string;
  village?: string;
  country?: string;
  [key: string]: string | undefined;
}

interface NominatimResponse {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address: NominatimAddress;
  [key: string]: string | number | NominatimAddress | unknown; // For other properties we don't use
}

const CitySearch: React.FC<CitySearchProps> = ({
  value,
  onChange,
  placeholder,
  label,
  icon,
  error,
  onInputChange
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<CityResult[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const { currentLanguage } = useTranslation();
  const isKorean = currentLanguage === 'ko';
  const [searchError, setSearchError] = useState('');
  const requestVersion = useRef(0);
  const lastRequestAt = useRef(0);
  const resultCache = useRef(new Map<string, CityResult[]>());
  const requestInFlight = useRef(false);

  // Nominatim API URL
  const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';

  // Search local Seoul data while typing; external queries require an explicit action.
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    requestVersion.current += 1;
    setSearchError('');
    setIsLoading(false);
    onInputChange?.();
    const isSeoul = /^(서울|seoul)$/i.test(newValue.trim());
    setResults(isSeoul ? [{
      city: isKorean ? '서울' : 'Seoul',
      country: isKorean ? '대한민국' : 'South Korea',
      latitude: 37.5665,
      longitude: 126.9780,
      formattedAddress: isKorean ? '서울, 대한민국' : 'Seoul, South Korea'
    }] : []);
    setIsOpen(isSeoul);
  };

  // Search city using Nominatim API
  const searchCity = async (query: string) => {
    query = query.trim();
    if (query.length < 2 || requestInFlight.current) return;
    const cached = resultCache.current.get(query);
    if (cached) {
      setResults(cached);
      setIsOpen(cached.length > 0);
      return;
    }
    if (Date.now() - lastRequestAt.current < 1100) return;
    lastRequestAt.current = Date.now();
    requestInFlight.current = true;
    const version = ++requestVersion.current;
    setIsLoading(true);
    setSearchError('');
    try {
      // Build the URL with parameters
      const params = new URLSearchParams({
        q: query,
        format: 'json',
        addressdetails: '1',
        limit: '5'
      });
      
      const response = await fetch(`${NOMINATIM_API}?${params.toString()}`, {
        headers: {
          'Accept': 'application/json' // The browser sends the site Referer.
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Process and filter results
      const processedResults = data
        .filter((item: NominatimResponse) => item.address && (item.address.city || item.address.town || item.address.village))
        .map((item: NominatimResponse) => {
          const city = item.address.city || item.address.town || item.address.village || '';
          const country = item.address.country || '';
          return {
            city,
            country,
            latitude: parseFloat(item.lat) || 0,
            longitude: parseFloat(item.lon) || 0,
            formattedAddress: `${city}, ${country}`
          };
        })
        .filter((result: CityResult, index: number, self: CityResult[]) => 
          // Filter unique cities
          index === self.findIndex(r => r.city === result.city && r.country === result.country)
        )
        .filter((result: CityResult) => result.city); // Only include results with a city name
      
      resultCache.current.set(query, processedResults);
      if (version !== requestVersion.current) return;
      setResults(processedResults);
      setIsOpen(processedResults.length > 0);
      if (!processedResults.length) setSearchError(isKorean ? '도시를 찾지 못했어요. 다른 이름으로 검색해보세요.' : 'No cities found. Try another name.');
    } catch (error) {
      console.error('Error searching city:', error);
      if (version !== requestVersion.current) return;
      setResults([]);
      setSearchError(isKorean ? '도시 검색에 연결하지 못했어요. 잠시 후 다시 시도하거나 서울을 입력해 체험해보세요.' : 'City search is unavailable. Try again later, or enter Seoul to try the demo.');
    } finally {
      requestInFlight.current = false;
      if (version === requestVersion.current) setIsLoading(false);
    }
  };

  // Handle selection of a city
  const handleSelectCity = (result: CityResult) => {
    requestVersion.current += 1;
    setIsLoading(false);
    setSearchError('');
    setInputValue(result.formattedAddress);
    onChange(result.formattedAddress, result.latitude, result.longitude);
    setIsOpen(false);
    setResults([]);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Open dropdown when results are available
  useEffect(() => {
    if (results.length > 0) {
      setIsOpen(true);
    }
  }, [results]);

  return (
    <div className="mb-4">
      <label className="block text-white/90 text-sm mb-2 flex items-center">
        {icon && <span className="mr-2">{icon}</span>}
        {label}
      </label>
      <div 
        ref={searchRef}
        className="relative"
      >
        <div className={`
          bg-white backdrop-blur-md border rounded-lg px-3 py-2 flex justify-between items-center
          transition-colors relative
          ${error ? 'border-red-500' : isOpen ? 'border-white/30' : 'border-white/10 hover:border-white/20'}
        `}>
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            onFocus={() => results.length > 0 && setIsOpen(true)}
            aria-label={label}
            onKeyDown={event => {
              if (event.key === 'Enter') {
                event.preventDefault();
                searchCity(inputValue);
              }
            }}
            placeholder={placeholder}
            className="w-full bg-transparent outline-none text-black placeholder-gray-500"
          />
          <button
            type="button"
            onClick={() => searchCity(inputValue)}
            disabled={isLoading || inputValue.trim().length < 2}
            className="ml-3 shrink-0 text-sm text-purple-700 disabled:opacity-40"
          >
            {isLoading ? (isKorean ? '검색 중…' : 'Searching…') : (isKorean ? '검색' : 'Search')}
          </button>
        </div>

        <p className="text-white/60 text-xs mt-2">
          {isKorean ? '도시명 입력 후 검색 · ' : 'Enter a city, then search · '}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer" className="underline">© OpenStreetMap</a>
        </p>
        {searchError && <p role="status" className="text-amber-200 text-xs mt-2">{searchError}</p>}
        {/* Error message */}
        {error && (
          <p className="text-red-500 text-xs mt-1">{error}</p>
        )}

        {/* Results dropdown */}
        <AnimatePresence>
          {isOpen && results.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="absolute z-50 mt-1 w-full bg-white backdrop-blur-xl border border-white/20 rounded-lg shadow-xl"
            >
              <div className="max-h-60 overflow-y-auto py-1">
                {results.map((result, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => handleSelectCity(result)}
                    className="w-full text-left px-4 py-2 cursor-pointer hover:bg-purple-50 transition-colors text-black"
                  >
                    <div className="font-medium">{result.city}</div>
                    <div className="text-xs text-gray-600">{result.country}</div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default CitySearch;
