import React, { useRef, useEffect, useState } from 'react';
import { Input } from './input';
import { cn } from '../../utils/cn';

interface AddressAutocompleteProps {
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

declare global {
  interface Window {
    google: any;
    initializeGoogleMaps: () => void;
  }
}

export const AddressAutocomplete: React.FC<AddressAutocompleteProps> = ({
  value,
  onChange,
  onAddressSelect,
  onBlur,
  className,
  placeholder = "Enter address...",
  disabled = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<any>(null);
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps is already loaded
    if (window.google?.maps?.places) {
      setIsGoogleMapsLoaded(true);
      initializeAutocomplete();
      return;
    }

    // Load Google Maps API if not already loaded
    if (!window.initializeGoogleMaps) {
      window.initializeGoogleMaps = () => {
        setIsGoogleMapsLoaded(true);
      };

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.REACT_APP_GOOGLE_MAPS_API_KEY}&libraries=places&callback=initializeGoogleMaps`;
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onerror = () => {
        console.warn('Google Maps API failed to load. Address autocomplete will not be available.');
      };
    }
  }, []);

  useEffect(() => {
    if (isGoogleMapsLoaded && inputRef.current) {
      initializeAutocomplete();
    }
  }, [isGoogleMapsLoaded]);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google?.maps?.places) return;

    autocompleteRef.current = new window.google.maps.places.Autocomplete(
      inputRef.current,
      {
        types: ['address'],
        componentRestrictions: { country: 'us' },
        fields: ['address_components', 'formatted_address']
      }
    );

    autocompleteRef.current.addListener('place_changed', handlePlaceSelect);
  };

  const handlePlaceSelect = () => {
    if (!autocompleteRef.current) return;

    const place = autocompleteRef.current.getPlace();
    if (!place.address_components) return;

    const addressComponents = extractAddressComponents(place.address_components);
    onChange(place.formatted_address || '');
    
    if (onAddressSelect) {
      onAddressSelect({
        ...addressComponents,
        formattedAddress: place.formatted_address || ''
      });
    }
  };

  const extractAddressComponents = (components: any[]): Omit<AddressComponents, 'formattedAddress'> => {
    const result = {
      streetNumber: '',
      route: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    };

    components.forEach(component => {
      const types = component.types;
      const value = component.long_name;

      if (types.includes('street_number')) {
        result.streetNumber = value;
      } else if (types.includes('route')) {
        result.route = value;
      } else if (types.includes('locality')) {
        result.city = value;
      } else if (types.includes('administrative_area_level_1')) {
        result.state = component.short_name; // Use short name for state (e.g., "CA")
      } else if (types.includes('postal_code')) {
        result.zipCode = value;
      } else if (types.includes('country')) {
        result.country = value;
      }
    });

    return result;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div className="relative">
      <Input
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={cn(className)}
        disabled={disabled}
        autoComplete="off"
      />
      {!isGoogleMapsLoaded && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};