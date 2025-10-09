'use client';

import React, { useState, useMemo } from 'react';
import { Search, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import am5geodata_data_countries2 from '@amcharts/amcharts5-geodata/data/countries2';

interface CountrySearchProps {
  onCountrySelect: (countryCode: string, countryName: string) => void;
  initialSearchValue?: string;
}

interface Country {
  code: string;
  name: string;
  continent: string;
}

const CountrySearch: React.FC<CountrySearchProps> = ({
  onCountrySelect,
  initialSearchValue
}) => {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState(initialSearchValue || '');

  // Convert countries2 data to searchable format
  const countries: Country[] = useMemo(() => {
    return Object.entries(am5geodata_data_countries2).map(([code, data]) => ({
      code,
      name: data.country,
      continent: data.continent
    }));
  }, []);

  // Filter countries based on search
  const filteredCountries = useMemo(() => {
    if (!searchValue) return countries.slice(0, 50); // Show first 50 if no search

    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(searchValue.toLowerCase()) ||
        country.code.toLowerCase().includes(searchValue.toLowerCase()) ||
        country.continent.toLowerCase().includes(searchValue.toLowerCase())
    );
  }, [countries, searchValue]);

  const handleCountrySelect = (country: Country) => {
    onCountrySelect(country.code, country.name);
    setOpen(false);
    setSearchValue(country.name);
  };

  return (
    <div className='w-full max-w-md'>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant='outline'
            role='combobox'
            aria-expanded={open}
            className='w-full justify-between'
          >
            <div className='flex items-center gap-2'>
              <Search className='h-4 w-4' />
              <span className='truncate'>
                {searchValue || 'Search countries...'}
              </span>
            </div>
            <MapPin className='h-4 w-4 shrink-0 opacity-50' />
          </Button>
        </PopoverTrigger>
        <PopoverContent className='w-full p-0' align='start'>
          <Command>
            <CommandInput
              placeholder='Search countries, codes, or continents...'
              value={searchValue}
              onValueChange={setSearchValue}
            />
            <CommandList>
              <CommandEmpty>No countries found.</CommandEmpty>
              <CommandGroup>
                {filteredCountries.map((country) => (
                  <CommandItem
                    key={country.code}
                    value={`${country.name} ${country.code} ${country.continent}`}
                    onSelect={() => handleCountrySelect(country)}
                    className='flex items-center justify-between'
                  >
                    <div className='flex flex-col'>
                      <span className='font-medium'>{country.name}</span>
                      <span className='text-muted-foreground text-sm'>
                        {country.continent}
                      </span>
                    </div>
                    <span className='text-muted-foreground font-mono text-sm'>
                      {country.code}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export default CountrySearch;
