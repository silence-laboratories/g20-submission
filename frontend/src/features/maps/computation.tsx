'use client';

import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function Computation() {
  return <Card>
    <CardContent><video src='/assets/compute.mp4' autoPlay loop muted /></CardContent></Card>;
}
