import React, { useState, useRef, useEffect } from 'react';
import { Input } from './input';
import { cn } from '../../utils/cn';

interface SimpleAddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect?: (addressComponents: AddressComponents) => void;
  onBlur?: () => void;
  className?: string;
  placeholder?: string;
  disabled?: boolean;
}

export interface AddressComponents {
  streetNumber: string;
  route: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  formattedAddress: string;
}

// Common US city suggestions for demo purposes
const COMMON_CITIES = [
  { city: 'Phoenix', state: 'AZ', zip: '85001' },
  { city: 'Los Angeles', state: 'CA', zip: '90210' },
  { city: 'San Francisco', state: 'CA', zip: '94102' },
  { city: 'Denver', state: 'CO', zip: '80202' },
  { city: 'Miami', state: 'FL', zip: '33101' },
  { city: 'Atlanta', state: 'GA', zip: '30301' },
  { city: 'Chicago', state: 'IL', zip: '60601' },
  { city: 'Boston', state: 'MA', zip: '02101' },
  { city: 'Las Vegas', state: 'NV', zip: '89101' },
  { city: 'New York', state: 'NY', zip: '10001' },
  { city: 'Austin', state: 'TX', zip: '73301' },
  { city: 'Houston', state: 'TX', zip: '77001' },
  { city: 'Dallas', state: 'TX', zip: '75201' },
  { city: 'Seattle', state: 'WA', zip: '98101' }
];

export const SimpleAddressAutocomplete: React.FC<SimpleAddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelect,
  onBlur,
  className,
  placeholder = "Enter address...",
  disabled = false
}) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const generateSuggestions = (input: string): string[] => {
    if (input.length < 3) return [];

    const suggestions: string[] = [];
    
    // Check if input looks like it starts with a number (street address)
    const startsWithNumber = /^\d/.test(input);
    
    if (startsWithNumber) {
      // Generate street address suggestions
      const streets = ['Main St', 'Oak Ave', 'Elm St', 'Park Blvd', 'First Ave', 'Second St'];
      const numbers = input.match(/^\d+/)?.[0] || '123';
      
      streets.forEach(street => {
        COMMON_CITIES.slice(0, 3).forEach(location => {
          suggestions.push(`${numbers} ${street}, ${location.city}, ${location.state} ${location.zip}`);
        });
      });
    } else {
      // City-based suggestions
      COMMON_CITIES
        .filter(location => 
          location.city.toLowerCase().includes(input.toLowerCase()) ||
          location.state.toLowerCase().includes(input.toLowerCase())
        )
        .forEach(location => {
          suggestions.push(`${location.city}, ${location.state} ${location.zip}`);
          suggestions.push(`123 Main St, ${location.city}, ${location.state} ${location.zip}`);
        });
    }

    return suggestions.slice(0, 5); // Limit to 5 suggestions
  };

  const parseAddress = (address: string): AddressComponents => {
    // Simple address parsing - this is a demo implementation
    const parts = address.split(', ');
    let streetNumber = '';
    let route = '';
    let city = '';
    let state = '';
    let zipCode = '';

    if (parts.length >= 3) {
      // Extract street info from first part
      const streetPart = parts[0];
      const streetMatch = streetPart.match(/^(\d+)\s+(.+)$/);
      if (streetMatch) {
        streetNumber = streetMatch[1];
        route = streetMatch[2];
      } else {
        route = streetPart;
      }

      city = parts[1];
      
      // Extract state and zip from last part
      const stateZip = parts[2];
      const stateZipMatch = stateZip.match(/^([A-Z]{2})\s+(\d{5}(-\d{4})?)$/);
      if (stateZipMatch) {
        state = stateZipMatch[1];
        zipCode = stateZipMatch[2];
      }
    }

    return {
      streetNumber,
      route,
      city,
      state,
      zipCode,
      country: 'US',
      formattedAddress: address
    };
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    
    const newSuggestions = generateSuggestions(newValue);
    setSuggestions(newSuggestions);
    setShowSuggestions(newSuggestions.length > 0);
  };

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    
    if (onAddressSelect) {
      const addressComponents = parseAddress(suggestion);
      onAddressSelect(addressComponents);
    }
  };

  const handleInputFocus = () => {
    if (value.length >= 3) {
      const newSuggestions = generateSuggestions(value);
      setSuggestions(newSuggestions);
      setShowSuggestions(newSuggestions.length > 0);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(className)}
        disabled={disabled}
        autoComplete="off"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-background border border-input rounded-md shadow-lg max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-accent hover:text-accent-foreground border-b border-gray-100 last:border-b-0"
            >
              {suggestion}
            </div>
          ))}
          <div className="px-3 py-2 text-xs text-gray-500 bg-gray-50">
            💡 Demo suggestions - Google Maps integration available with API key
          </div>
        </div>
      )}
    </div>
  );
};