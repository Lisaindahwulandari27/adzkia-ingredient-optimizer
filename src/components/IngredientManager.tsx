
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Ingredient } from '@/pages/Index';

interface IngredientManagerProps {
  ingredients: Ingredient[];
  onAddIngredient: (ingredient: Omit<Ingredient, 'id'>) => void;
  onUpdateIngredient: (id: string, ingredient: Omit<Ingredient, 'id'>) => void;
  onDeleteIngredient: (id: string) => void;
}

const IngredientManager: React.FC<IngredientManagerProps> = ({
  ingredients,
  onAddIngredient,
  onUpdateIngredient,
  onDeleteIngredient
}) => {
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    unit: '',
    costPerUnit: 0,
    amountPerPortion: 0
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingIngredient, setEditingIngredient] = useState<Omit<Ingredient, 'id'>>({
    name: '',
    unit: '',
    costPerUnit: 0,
    amountPerPortion: 0
  });

  const units = ['kg', 'gram', 'liter', 'ml', 'buah', 'porsi', 'sdm', 'sdt'];

  const handleAddIngredient = () => {
    if (!newIngredient.name || !newIngredient.unit || newIngredient.costPerUnit <= 0 || newIngredient.amountPerPortion <= 0) {
      toast({
        title: "Error",
        description: "Semua field harus diisi dengan benar",
        variant: "destructive"
      });
      return;
    }

    onAddIngredient(newIngredient);
    setNewIngredient({ name: '', unit: '', costPerUnit: 0, amountPerPortion: 0 });
    toast({
      title: "Berhasil",
      description: "Bahan baku berhasil ditambahkan"
    });
  };

  const handleEditClick = (ingredient: Ingredient) => {
    setEditingId(ingredient.id);
    setEditingIngredient({
      name: ingredient.name,
      unit: ingredient.unit,
      costPerUnit: ingredient.costPerUnit,
      amountPerPortion: ingredient.amountPerPortion
    });
  };

  const handleSaveEdit = () => {
    if (!editingIngredient.name || !editingIngredient.unit || editingIngredient.costPerUnit <= 0 || editingIngredient.amountPerPortion <= 0) {
      toast({
        title: "Error",
        description: "Semua field harus diisi dengan benar",
        variant: "destructive"
      });
      return;
    }

    onUpdateIngredient(editingId!, editingIngredient);
    setEditingId(null);
    toast({
      title: "Berhasil",
      description: "Bahan baku berhasil diperbarui"
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingIngredient({ name: '', unit: '', costPerUnit: 0, amountPerPortion: 0 });
  };

  const handleDeleteIngredient = (id: string) => {
    onDeleteIngredient(id);
    toast({
      title: "Berhasil",
      description: "Bahan baku berhasil dihapus"
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Tambah Bahan Baku Baru
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nama Bahan</Label>
              <Input
                id="name"
                placeholder="Contoh: Daging Sapi"
                value={newIngredient.name}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Satuan</Label>
              <Select 
                value={newIngredient.unit} 
                onValueChange={(value) => setNewIngredient(prev => ({ ...prev, unit: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih satuan" />
                </SelectTrigger>
                <SelectContent>
                  {units.map(unit => (
                    <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="cost">Biaya per Unit (Rp)</Label>
              <Input
                id="cost"
                type="number"
                placeholder="0"
                value={newIngredient.costPerUnit || ''}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, costPerUnit: Number(e.target.value) }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Jumlah per Porsi</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0"
                value={newIngredient.amountPerPortion || ''}
                onChange={(e) => setNewIngredient(prev => ({ ...prev, amountPerPortion: Number(e.target.value) }))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddIngredient} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Tambah
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Bahan Baku</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Bahan</TableHead>
                <TableHead>Satuan</TableHead>
                <TableHead>Biaya per Unit</TableHead>
                <TableHead>Jumlah per Porsi</TableHead>
                <TableHead>Biaya per Porsi</TableHead>
                <TableHead>Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ingredients.map((ingredient) => (
                <TableRow key={ingredient.id}>
                  <TableCell>
                    {editingId === ingredient.id ? (
                      <Input
                        value={editingIngredient.name}
                        onChange={(e) => setEditingIngredient(prev => ({ ...prev, name: e.target.value }))}
                      />
                    ) : (
                      ingredient.name
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === ingredient.id ? (
                      <Select 
                        value={editingIngredient.unit} 
                        onValueChange={(value) => setEditingIngredient(prev => ({ ...prev, unit: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map(unit => (
                            <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      ingredient.unit
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === ingredient.id ? (
                      <Input
                        type="number"
                        value={editingIngredient.costPerUnit || ''}
                        onChange={(e) => setEditingIngredient(prev => ({ ...prev, costPerUnit: Number(e.target.value) }))}
                      />
                    ) : (
                      `Rp ${ingredient.costPerUnit.toLocaleString()}`
                    )}
                  </TableCell>
                  <TableCell>
                    {editingId === ingredient.id ? (
                      <Input
                        type="number"
                        step="0.01"
                        value={editingIngredient.amountPerPortion || ''}
                        onChange={(e) => setEditingIngredient(prev => ({ ...prev, amountPerPortion: Number(e.target.value) }))}
                      />
                    ) : (
                      `${ingredient.amountPerPortion} ${ingredient.unit}`
                    )}
                  </TableCell>
                  <TableCell>
                    Rp {(ingredient.costPerUnit * ingredient.amountPerPortion).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    {editingId === ingredient.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" onClick={handleSaveEdit}>
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => handleEditClick(ingredient)}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteIngredient(ingredient.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          {ingredients.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Belum ada bahan baku yang ditambahkan
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default IngredientManager;
