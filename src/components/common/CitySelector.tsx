'use client';

import { useCity } from '@/context/CityContext';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { MapPin } from 'lucide-react';

export function CitySelector() {
  const { cities, selectedCity, setSelectedCity } = useCity();

  return (
    <div className="flex items-center gap-2">
      <MapPin className="h-5 w-5 text-muted-foreground" />
      <Select value={selectedCity} onValueChange={setSelectedCity}>
        <SelectTrigger className="w-[180px] border-0 bg-transparent shadow-none focus:ring-0">
          <SelectValue placeholder="Select City" />
        </SelectTrigger>
        <SelectContent>
          {cities.map((city) => (
            <SelectItem key={city.id} value={city.name === 'All Cities' ? 'all' : city.name}>
              {city.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
