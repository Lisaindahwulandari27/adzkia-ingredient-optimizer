
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Calculator, Save } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import type { Ingredient, UsageRecord } from '@/pages/Index';

interface PortionCalculatorProps {
  ingredients: Ingredient[];
  onAddUsageRecord: (record: Omit<UsageRecord, 'id'>) => void;
}

const PortionCalculator: React.FC<PortionCalculatorProps> = ({
  ingredients,
  onAddUsageRecord
}) => {
  const [portions, setPortions] = useState<number>(0);
  const [calculatedIngredients, setCalculatedIngredients] = useState<{
    [ingredientId: string]: { amount: number; cost: number }
  }>({});

  const calculateIngredients = () => {
    if (portions <= 0) {
      toast({
        title: "Kesalahan",
        description: "Jumlah porsi harus lebih dari 0",
        variant: "destructive"
      });
      return;
    }

    const calculated: { [ingredientId: string]: { amount: number; cost: number } } = {};
    
    ingredients.forEach(ingredient => {
      const amount = ingredient.amountPerPortion * portions;
      const cost = amount * ingredient.costPerUnit;
      calculated[ingredient.id] = { amount, cost };
    });

    setCalculatedIngredients(calculated);
    toast({
      title: "Berhasil",
      description: `Perhitungan untuk ${portions} porsi bakso berhasil`
    });
  };

  const saveUsageRecord = () => {
    if (Object.keys(calculatedIngredients).length === 0) {
      toast({
        title: "Kesalahan",
        description: "Lakukan perhitungan terlebih dahulu",
        variant: "destructive"
      });
      return;
    }

    const totalCost = Object.values(calculatedIngredients).reduce((sum, item) => sum + item.cost, 0);
    const ingredientAmounts: { [ingredientId: string]: number } = {};
    
    Object.keys(calculatedIngredients).forEach(id => {
      ingredientAmounts[id] = calculatedIngredients[id].amount;
    });

    const record: Omit<UsageRecord, 'id'> = {
      date: new Date().toISOString().split('T')[0],
      portions,
      ingredients: ingredientAmounts,
      totalCost
    };

    onAddUsageRecord(record);
    toast({
      title: "Berhasil",
      description: "Data penggunaan bahan berhasil disimpan"
    });
  };

  const getTotalCost = () => {
    return Object.values(calculatedIngredients).reduce((sum, item) => sum + item.cost, 0);
  };

  const getCostPerPortion = () => {
    const total = getTotalCost();
    return portions > 0 ? total / portions : 0;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Hitung Kebutuhan Bahan Baku
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 items-end">
            <div className="space-y-2 flex-1">
              <Label htmlFor="portions">Jumlah Porsi Bakso</Label>
              <Input
                id="portions"
                type="number"
                placeholder="Masukkan jumlah porsi bakso yang akan dibuat"
                value={portions || ''}
                onChange={(e) => setPortions(Number(e.target.value))}
              />
            </div>
            <Button onClick={calculateIngredients} disabled={ingredients.length === 0}>
              <Calculator className="h-4 w-4 mr-2" />
              Hitung Bahan
            </Button>
          </div>
        </CardContent>
      </Card>

      {Object.keys(calculatedIngredients).length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Hasil Perhitungan - {portions} Porsi Bakso</CardTitle>
            <Button onClick={saveUsageRecord}>
              <Save className="h-4 w-4 mr-2" />
              Simpan Data
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Bahan</TableHead>
                  <TableHead>Jumlah Diperlukan</TableHead>
                  <TableHead>Satuan</TableHead>
                  <TableHead>Total Biaya</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {ingredients.map(ingredient => (
                  <TableRow key={ingredient.id}>
                    <TableCell className="font-medium">{ingredient.name}</TableCell>
                    <TableCell>{calculatedIngredients[ingredient.id]?.amount?.toFixed(2) || 0}</TableCell>
                    <TableCell>{ingredient.unit}</TableCell>
                    <TableCell>Rp {(calculatedIngredients[ingredient.id]?.cost || 0).toLocaleString('id-ID')}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            <div className="mt-6 p-4 bg-orange-50 rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-sm text-gray-600">Total Biaya Bahan</p>
                  <p className="text-2xl font-bold text-orange-600">Rp {getTotalCost().toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Biaya per Porsi</p>
                  <p className="text-2xl font-bold text-green-600">Rp {getCostPerPortion().toLocaleString('id-ID')}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Jumlah Porsi</p>
                  <p className="text-2xl font-bold text-blue-600">{portions}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {ingredients.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Tambahkan bahan baku terlebih dahulu di tab "Bahan Baku" untuk melakukan perhitungan</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PortionCalculator;
