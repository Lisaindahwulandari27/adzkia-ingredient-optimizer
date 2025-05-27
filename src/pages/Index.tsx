
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import IngredientManager from '@/components/IngredientManager';
import PortionCalculator from '@/components/PortionCalculator';
import Analytics from '@/components/Analytics';
import UsageHistory from '@/components/UsageHistory';
import { ChefHat, Calculator, TrendingUp, History } from 'lucide-react';

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit: number;
  amountPerPortion: number;
}

export interface UsageRecord {
  id: string;
  date: string;
  portions: number;
  ingredients: { [ingredientId: string]: number };
  totalCost: number;
}

const Index = () => {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageRecord[]>([]);

  const addIngredient = (ingredient: Omit<Ingredient, 'id'>) => {
    const newIngredient = {
      ...ingredient,
      id: Date.now().toString()
    };
    setIngredients(prev => [...prev, newIngredient]);
  };

  const updateIngredient = (id: string, updatedIngredient: Omit<Ingredient, 'id'>) => {
    setIngredients(prev => prev.map(ing => 
      ing.id === id ? { ...updatedIngredient, id } : ing
    ));
  };

  const deleteIngredient = (id: string) => {
    setIngredients(prev => prev.filter(ing => ing.id !== id));
  };

  const addUsageRecord = (record: Omit<UsageRecord, 'id'>) => {
    const newRecord = {
      ...record,
      id: Date.now().toString()
    };
    setUsageHistory(prev => [...prev, newRecord]);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <ChefHat className="h-12 w-12 text-orange-600 mr-3" />
            <h1 className="text-4xl font-bold text-gray-800">Bakso Adzkia</h1>
          </div>
          <p className="text-xl text-gray-600">Sistem Analisis Porsi & Optimasi Bahan</p>
        </div>

        <Tabs defaultValue="ingredients" className="w-full">
          <TabsList className="grid w-full grid-cols-4 mb-8">
            <TabsTrigger value="ingredients" className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Bahan Baku
            </TabsTrigger>
            <TabsTrigger value="calculator" className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Kalkulator Porsi
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Analisis
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="h-4 w-4" />
              Riwayat
            </TabsTrigger>
          </TabsList>

          <TabsContent value="ingredients">
            <Card>
              <CardHeader>
                <CardTitle>Manajemen Bahan Baku</CardTitle>
                <CardDescription>
                  Kelola daftar bahan baku, satuan, dan biaya per unit
                </CardDescription>
              </CardHeader>
              <CardContent>
                <IngredientManager 
                  ingredients={ingredients}
                  onAddIngredient={addIngredient}
                  onUpdateIngredient={updateIngredient}
                  onDeleteIngredient={deleteIngredient}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="calculator">
            <Card>
              <CardHeader>
                <CardTitle>Kalkulator Porsi</CardTitle>
                <CardDescription>
                  Hitung kebutuhan bahan berdasarkan jumlah porsi yang akan dibuat
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PortionCalculator 
                  ingredients={ingredients}
                  onAddUsageRecord={addUsageRecord}
                />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics">
            <Analytics 
              ingredients={ingredients}
              usageHistory={usageHistory}
            />
          </TabsContent>

          <TabsContent value="history">
            <UsageHistory usageHistory={usageHistory} ingredients={ingredients} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
