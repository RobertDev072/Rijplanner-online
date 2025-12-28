import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import { MobileLayout } from '@/components/MobileLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Car, 
  Plus, 
  Trash2, 
  Edit2, 
  X, 
  Check,
  User
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function Vehicles() {
  const { user } = useAuth();
  const { vehicles, getInstructors, getUserById, addVehicle, updateVehicle, deleteVehicle } = useData();
  
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<string | null>(null);
  
  // Form state
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [instructorId, setInstructorId] = useState<string>('');

  // Edit form state
  const [editBrand, setEditBrand] = useState('');
  const [editModel, setEditModel] = useState('');
  const [editLicensePlate, setEditLicensePlate] = useState('');
  const [editInstructorId, setEditInstructorId] = useState<string>('');

  if (!user || (user.role !== 'admin' && user.role !== 'superadmin')) return null;

  const instructors = getInstructors();

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!brand.trim() || !model.trim() || !licensePlate.trim()) {
      toast.error('Vul alle verplichte velden in');
      return;
    }

    const success = await addVehicle({
      tenant_id: user.tenant_id!,
      brand: brand.trim(),
      model: model.trim(),
      license_plate: licensePlate.trim().toUpperCase(),
      instructor_id: instructorId || null,
    });

    if (success) {
      toast.success('Voertuig toegevoegd!');
      setBrand('');
      setModel('');
      setLicensePlate('');
      setInstructorId('');
      setShowAddForm(false);
    } else {
      toast.error('Kon voertuig niet toevoegen');
    }
  };

  const handleEditVehicle = (vehicleId: string) => {
    const vehicle = vehicles.find(v => v.id === vehicleId);
    if (vehicle) {
      setEditBrand(vehicle.brand);
      setEditModel(vehicle.model);
      setEditLicensePlate(vehicle.license_plate);
      setEditInstructorId(vehicle.instructor_id || '');
      setEditingVehicle(vehicleId);
    }
  };

  const handleUpdateVehicle = async (vehicleId: string) => {
    if (!editBrand.trim() || !editModel.trim() || !editLicensePlate.trim()) {
      toast.error('Vul alle verplichte velden in');
      return;
    }

    const success = await updateVehicle(vehicleId, {
      brand: editBrand.trim(),
      model: editModel.trim(),
      license_plate: editLicensePlate.trim().toUpperCase(),
      instructor_id: editInstructorId || null,
    });

    if (success) {
      toast.success('Voertuig bijgewerkt!');
      setEditingVehicle(null);
    } else {
      toast.error('Kon voertuig niet bijwerken');
    }
  };

  const handleDeleteVehicle = async (vehicleId: string, vehicleName: string) => {
    if (confirm(`Weet je zeker dat je ${vehicleName} wilt verwijderen?`)) {
      const success = await deleteVehicle(vehicleId);
      if (success) {
        toast.success('Voertuig verwijderd');
      } else {
        toast.error('Kon voertuig niet verwijderen');
      }
    }
  };

  return (
    <MobileLayout title="Voertuigen">

      {/* Add Button */}
      <Button
        onClick={() => setShowAddForm(!showAddForm)}
        variant={showAddForm ? 'secondary' : 'accent'}
        className="w-full mb-4"
      >
        {showAddForm ? (
          <>
            <X className="w-4 h-4" />
            Annuleren
          </>
        ) : (
          <>
            <Plus className="w-4 h-4" />
            Voertuig toevoegen
          </>
        )}
      </Button>

      {/* Add Form */}
      {showAddForm && (
        <form onSubmit={handleAddVehicle} className="glass-card rounded-xl p-4 mb-4 space-y-4 animate-slide-up">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Merk *</label>
              <Input
                placeholder="Bijv. Volkswagen"
                value={brand}
                onChange={e => setBrand(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Model *</label>
              <Input
                placeholder="Bijv. Golf"
                value={model}
                onChange={e => setModel(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Kenteken *</label>
            <Input
              placeholder="XX-123-XX"
              value={licensePlate}
              onChange={e => setLicensePlate(e.target.value.toUpperCase())}
              className="uppercase"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Instructeur (optioneel)</label>
            <Select value={instructorId} onValueChange={setInstructorId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecteer instructeur" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Geen instructeur</SelectItem>
                {instructors.map(instructor => (
                  <SelectItem key={instructor.id} value={instructor.id}>
                    {instructor.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button type="submit" className="w-full">
            <Check className="w-4 h-4" />
            Toevoegen
          </Button>
        </form>
      )}

      {/* Vehicles List */}
      <div className="space-y-3">
        {vehicles.map(vehicle => {
          const instructor = vehicle.instructor_id ? getUserById(vehicle.instructor_id) : null;
          const isEditing = editingVehicle === vehicle.id;

          return (
            <div key={vehicle.id} className="glass-card rounded-xl p-4 animate-slide-up">
              {isEditing ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Merk"
                      value={editBrand}
                      onChange={e => setEditBrand(e.target.value)}
                    />
                    <Input
                      placeholder="Model"
                      value={editModel}
                      onChange={e => setEditModel(e.target.value)}
                    />
                  </div>
                  <Input
                    placeholder="Kenteken"
                    value={editLicensePlate}
                    onChange={e => setEditLicensePlate(e.target.value.toUpperCase())}
                    className="uppercase"
                  />
                  <Select value={editInstructorId} onValueChange={setEditInstructorId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecteer instructeur" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Geen instructeur</SelectItem>
                      {instructors.map(inst => (
                        <SelectItem key={inst.id} value={inst.id}>
                          {inst.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleUpdateVehicle(vehicle.id)}
                    >
                      <Check className="w-4 h-4" />
                      Opslaan
                    </Button>
                    <Button 
                      size="sm" 
                      variant="secondary"
                      onClick={() => setEditingVehicle(null)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                      <Car className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">
                        {vehicle.brand} {vehicle.model}
                      </p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {vehicle.license_plate}
                      </p>
                      {instructor && (
                        <div className="flex items-center gap-1 text-xs text-accent mt-1">
                          <User className="w-3 h-3" />
                          {instructor.name}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleEditVehicle(vehicle.id)}
                    >
                      <Edit2 className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDeleteVehicle(vehicle.id, `${vehicle.brand} ${vehicle.model}`)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {vehicles.length === 0 && (
          <div className="glass-card rounded-xl p-6 text-center">
            <Car className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground">Nog geen voertuigen toegevoegd</p>
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
