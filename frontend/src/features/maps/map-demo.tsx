'use client';

import React from 'react';
import NewMap from './maps-new';

interface MapCountrySearchProps {
  getSelectedCountry: (value: string) => void;
  title?: string;
}

export default function MapDemo({
  getSelectedCountry,
  title
}: MapCountrySearchProps) {
  return (
    <div className='w-full'>
      {title && <h6 className='mb-4'>{title}</h6>}
      <NewMap chartID='map-demo' getSelectedCountry={getSelectedCountry} />
    </div>
  );
}
