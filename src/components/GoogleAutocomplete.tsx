import React from 'react';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { TextField, Autocomplete } from '@mui/material';

export default function GooglePlacesAutocomplete({ onSelect }) {
  const {
    ready,
    value,
    setValue,
    suggestions: { status, data },
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      location: { lat: () => 9.03, lng: () => 38.74 }, // Addis Ababa center
      radius: 20000, // 20km radius
      strictBounds: false,
    },
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
      onChange={(e, newValue) => handleSelect(newValue)}
      renderInput={(params) => (
        <TextField {...params} label="Search location in Addis Ababa" variant="outlined" fullWidth />
      )}
      disabled={!ready}
    />
  );
}
