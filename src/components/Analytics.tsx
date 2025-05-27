
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, DollarSign, Package, AlertTriangle } from 'lucide-react';
import type { Ingredient, UsageRecord } from '@/pages/Index';

interface AnalyticsProps {
  ingredients: Ingredient[];
  usageHistory: UsageRecord[];
}

const Analytics: React.FC<AnalyticsProps> = ({ ingredients, usageHistory }) => {
  const getCostAnalysis = () => {
    return ingredients
      .map(ingredient => ({
        name: ingredient.name,
        costPerPortion: ingredient.costPerUnit * ingredient.amountPerPortion,
        costPerUnit: ingredient.costPerUnit
      }))
      .sort((a, b) => b.costPerPortion - a.costPerPortion);
  };

  const getUsageFrequency = () => {
    const frequency: { [ingredientId: string]: number } = {};
    
    usageHistory.forEach(record => {
      Object.keys(record.ingredients).forEach(ingredientId => {
        frequency[ingredientId] = (frequency[ingredientId] || 0) + 1;
      });
    });

    return ingredients
      .map(ingredient => ({
        name: ingredient.name,
        frequency: frequency[ingredient.id] || 0
      }))
      .sort((a, b) => b.frequency - a.frequency);
  };

  const getTotalUsageByIngredient = () => {
    const totalUsage: { [ingredientId: string]: number } = {};
    
    usageHistory.forEach(record => {
      Object.entries(record.ingredients).forEach(([ingredientId, amount]) => {
        totalUsage[ingredientId] = (totalUsage[ingredientId] || 0) + amount;
      });
    });

    return ingredients
      .map(ingredient => ({
        name: ingredient.name,
        totalUsed: totalUsage[ingredient.id] || 0,
        unit: ingredient.unit
      }))
      .filter(item => item.totalUsed > 0)
      .sort((a, b) => b.totalUsed - a.totalUsed);
  };

  const getMonthlyTrend = () => {
    const monthlyData: { [month: string]: { portions: number; cost: number } } = {};
    
    usageHistory.forEach(record => {
      const month = record.date.substring(0, 7); // YYYY-MM
      if (!monthlyData[month]) {
        monthlyData[month] = { portions: 0, cost: 0 };
      }
      monthlyData[month].portions += record.portions;
      monthlyData[month].cost += record.totalCost;
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month,
        portions: data.portions,
        cost: data.cost,
        avgCostPerPortion: data.portions > 0 ? data.cost / data.portions : 0
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const costAnalysis = getCostAnalysis();
  const usageFrequency = getUsageFrequency();
  const totalUsage = getTotalUsageByIngredient();
  const monthlyTrend = getMonthlyTrend();

  const COLORS = ['#f97316', '#ea580c', '#dc2626', '#c2410c', '#b45309'];

  const totalRecords = usageHistory.length;
  const totalPortions = usageHistory.reduce((sum, record) => sum + record.portions, 0);
  const totalCost = usageHistory.reduce((sum, record) => sum + record.totalCost, 0);
  const avgCostPerPortion = totalPortions > 0 ? totalCost / totalPortions : 0;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Bahan</p>
                <p className="text-2xl font-bold">{ingredients.length}</p>
              </div>
              <Package className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Produksi</p>
                <p className="text-2xl font-bold">{totalPortions}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Biaya</p>
                <p className="text-2xl font-bold">Rp {totalCost.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Rata-rata/Porsi</p>
                <p className="text-2xl font-bold">Rp {avgCostPerPortion.toLocaleString()}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Biaya per Porsi per Bahan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={costAnalysis.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <Tooltip formatter={(value) => `Rp ${Number(value).toLocaleString()}`} />
                <Bar dataKey="costPerPortion" fill="#f97316" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Frekuensi Penggunaan Bahan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={usageFrequency.slice(0, 5)}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="frequency"
                >
                  {usageFrequency.slice(0, 5).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {monthlyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Tren Bulanan</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Bar yAxisId="left" dataKey="portions" fill="#22c55e" name="Porsi" />
                <Bar yAxisId="right" dataKey="cost" fill="#f97316" name="Biaya (Rp)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {totalUsage.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Total Penggunaan Bahan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {totalUsage.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium">{item.name}</span>
                  <span className="text-lg font-bold text-orange-600">
                    {item.totalUsed.toFixed(2)} {item.unit}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {usageHistory.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">Belum ada data penggunaan untuk dianalisis</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Analytics;
