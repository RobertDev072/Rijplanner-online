import React from 'react';
import { Car, ChevronDown, Check } from 'lucide-react';
import { Vehicle } from '@/types';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VehicleSelectProps {
  vehicles: Vehicle[];
  selectedVehicleId: string | null;
  onSelect: (vehicleId: string | null) => void;
  instructorVehicle?: Vehicle;
}

export function VehicleSelect({ vehicles, selectedVehicleId, onSelect, instructorVehicle }: VehicleSelectProps) {
  // Filter to only show the instructor's assigned vehicle and any unassigned vehicles
  const availableVehicles = vehicles.filter(v => 
    !v.instructor_id || v.instructor_id === instructorVehicle?.instructor_id
  );

  if (availableVehicles.length === 0) {
    return (
      <div className="glass-card p-4 border border-warning/20 bg-warning/5">
        <div className="flex items-center gap-3">
          <Car className="w-5 h-5 text-warning" />
          <p className="text-sm text-muted-foreground">
            Geen voertuig beschikbaar. Vraag de beheerder om een voertuig aan je te koppelen.
          </p>
        </div>
      </div>
    );
  }

  if (availableVehicles.length === 1) {
    const vehicle = availableVehicles[0];
    return (
      <div className="glass-card p-4 border-2 border-primary/20 bg-primary/5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Car className="w-6 h-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">{vehicle.brand} {vehicle.model}</p>
            <p className="text-sm text-muted-foreground font-mono">{vehicle.license_plate}</p>
          </div>
          <Check className="w-5 h-5 text-primary" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">Dit voertuig wordt automatisch aan de les gekoppeld</p>
      </div>
    );
  }

  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

  return (
    <div className="space-y-2">
      <Select
        value={selectedVehicleId || undefined}
        onValueChange={(value) => onSelect(value)}
      >
        <SelectTrigger className="h-14 rounded-2xl bg-muted/50 border-0 focus:ring-2 focus:ring-primary/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Car className="w-5 h-5 text-primary" />
            </div>
            {selectedVehicle ? (
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">{selectedVehicle.brand} {selectedVehicle.model}</p>
                <p className="text-xs text-muted-foreground font-mono">{selectedVehicle.license_plate}</p>
              </div>
            ) : (
              <span className="text-muted-foreground">Selecteer een voertuig</span>
            )}
          </div>
        </SelectTrigger>
        <SelectContent className="bg-card border border-border shadow-lg rounded-2xl z-[100]">
          {availableVehicles.map((vehicle) => (
            <SelectItem 
              key={vehicle.id} 
              value={vehicle.id}
              className="py-3 px-4 cursor-pointer rounded-xl focus:bg-muted"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Car className="w-4 h-4 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground">{vehicle.brand} {vehicle.model}</p>
                  <p className="text-xs text-muted-foreground font-mono">{vehicle.license_plate}</p>
                </div>
                {vehicle.id === instructorVehicle?.id && (
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full ml-auto">
                    Toegewezen
                  </span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
