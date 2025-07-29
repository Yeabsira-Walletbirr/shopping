'use client';

import React from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { TextField, Autocomplete } from '@mui/material';

export default function GooglePlacesAutocomplete({ onSelect }: any) {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: typeof window !== 'undefined' && window.google
      ? {
          location: new window.google.maps.LatLng(9.03, 38.74),
          radius: 20000,
        }
      : undefined,
  });

  const handleSelect = async (address: any) => {
    setValue(address, false);
    clearSuggestions();

    const results = await getGeocode({ address });
    const { lat, lng } = await getLatLng(results[0]);
    onSelect({ address, lat, lng });
  };

  return (
    <Autocomplete
      freeSolo
      options={status === 'OK' ? data.map((suggestion) => suggestion.description) : []}
      inputValue={value}
      onInputChange={(e, newInputValue) => setValue(newInputValue)}
      onChange={(e, newValue) => {
        if (newValue) handleSelect(newValue);
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Search location in Addis Ababa"
          variant="outlined"
          fullWidth
        />
      )}
      disabled={!ready}
    />
  );
}
