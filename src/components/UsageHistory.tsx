
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp } from 'lucide-react';
import type { Ingredient, UsageRecord } from '@/pages/Index';

interface UsageHistoryProps {
  usageHistory: UsageRecord[];
  ingredients: Ingredient[];
}

const UsageHistory: React.FC<UsageHistoryProps> = ({ usageHistory, ingredients }) => {
  const getIngredientName = (id: string) => {
    const ingredient = ingredients.find(ing => ing.id === id);
    return ingredient ? ingredient.name : 'Unknown';
  };

  const getIngredientUnit = (id: string) => {
    const ingredient = ingredients.find(ing => ing.id === id);
    return ingredient ? ingredient.unit : '';
  };

  const sortedHistory = [...usageHistory].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Riwayat Penggunaan Bahan
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sortedHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada riwayat penggunaan
            </div>
          ) : (
            <div className="space-y-4">
              {sortedHistory.map((record) => (
                <Card key={record.id} className="border-l-4 border-l-orange-500">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">
                          {new Date(record.date).toLocaleDateString('id-ID', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </h3>
                        <div className="flex gap-4 text-sm text-gray-600">
                          <span>Porsi: {record.portions}</span>
                          <span>Total Biaya: Rp {record.totalCost.toLocaleString()}</span>
                          <span>Biaya/Porsi: Rp {(record.totalCost / record.portions).toLocaleString()}</span>
                        </div>
                      </div>
                      <Badge variant="secondary">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        {record.portions} porsi
                      </Badge>
                    </div>
                    
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Bahan</TableHead>
                          <TableHead>Jumlah Digunakan</TableHead>
                          <TableHead>Satuan</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(record.ingredients).map(([ingredientId, amount]) => (
                          <TableRow key={ingredientId}>
                            <TableCell className="font-medium">
                              {getIngredientName(ingredientId)}
                            </TableCell>
                            <TableCell>{amount.toFixed(2)}</TableCell>
                            <TableCell>{getIngredientUnit(ingredientId)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default UsageHistory;
