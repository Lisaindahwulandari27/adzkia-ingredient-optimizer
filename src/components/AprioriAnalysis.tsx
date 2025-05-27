
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Search, Zap } from 'lucide-react';
import type { Ingredient, UsageRecord } from '@/pages/Index';

interface AprioriAnalysisProps {
  ingredients: Ingredient[];
  usageHistory: UsageRecord[];
}

interface FrequentItemset {
  items: string[];
  support: number;
  confidence?: number;
}

interface AssociationRule {
  antecedent: string[];
  consequent: string[];
  support: number;
  confidence: number;
  lift: number;
}

const AprioriAnalysis: React.FC<AprioriAnalysisProps> = ({ ingredients, usageHistory }) => {
  const [minSupport, setMinSupport] = useState<number>(0.3);
  const [minConfidence, setMinConfidence] = useState<number>(0.6);
  const [showRules, setShowRules] = useState<boolean>(false);

  const getIngredientName = (id: string) => {
    const ingredient = ingredients.find(ing => ing.id === id);
    return ingredient ? ingredient.name : 'Unknown';
  };

  // Convert usage records to transactions (binary matrix)
  const transactions = useMemo(() => {
    return usageHistory.map(record => 
      Object.keys(record.ingredients)
    );
  }, [usageHistory]);

  // Calculate support for itemset
  const calculateSupport = (itemset: string[]) => {
    if (transactions.length === 0) return 0;
    
    const count = transactions.filter(transaction => 
      itemset.every(item => transaction.includes(item))
    ).length;
    
    return count / transactions.length;
  };

  // Generate frequent 1-itemsets
  const getFrequent1Itemsets = () => {
    const allItems = new Set(transactions.flat());
    const frequent1: FrequentItemset[] = [];
    
    allItems.forEach(item => {
      const support = calculateSupport([item]);
      if (support >= minSupport) {
        frequent1.push({
          items: [item],
          support
        });
      }
    });
    
    return frequent1.sort((a, b) => b.support - a.support);
  };

  // Generate frequent 2-itemsets
  const getFrequent2Itemsets = (frequent1: FrequentItemset[]) => {
    const frequent2: FrequentItemset[] = [];
    const items1 = frequent1.map(f => f.items[0]);
    
    for (let i = 0; i < items1.length; i++) {
      for (let j = i + 1; j < items1.length; j++) {
        const itemset = [items1[i], items1[j]];
        const support = calculateSupport(itemset);
        
        if (support >= minSupport) {
          frequent2.push({
            items: itemset,
            support
          });
        }
      }
    }
    
    return frequent2.sort((a, b) => b.support - a.support);
  };

  // Generate frequent 3-itemsets
  const getFrequent3Itemsets = (frequent2: FrequentItemset[]) => {
    const frequent3: FrequentItemset[] = [];
    
    for (let i = 0; i < frequent2.length; i++) {
      for (let j = i + 1; j < frequent2.length; j++) {
        const set1 = new Set(frequent2[i].items);
        const set2 = new Set(frequent2[j].items);
        const intersection = [...set1].filter(x => set2.has(x));
        
        if (intersection.length === 1) {
          const union = [...new Set([...frequent2[i].items, ...frequent2[j].items])];
          if (union.length === 3) {
            const support = calculateSupport(union);
            if (support >= minSupport) {
              frequent3.push({
                items: union,
                support
              });
            }
          }
        }
      }
    }
    
    return frequent3.sort((a, b) => b.support - a.support);
  };

  // Generate association rules
  const generateAssociationRules = (frequentItemsets: FrequentItemset[]) => {
    const rules: AssociationRule[] = [];
    
    frequentItemsets.forEach(itemset => {
      if (itemset.items.length >= 2) {
        // Generate all possible antecedent-consequent combinations
        const items = itemset.items;
        
        for (let i = 1; i < Math.pow(2, items.length) - 1; i++) {
          const antecedent: string[] = [];
          const consequent: string[] = [];
          
          items.forEach((item, index) => {
            if (i & (1 << index)) {
              antecedent.push(item);
            } else {
              consequent.push(item);
            }
          });
          
          if (antecedent.length > 0 && consequent.length > 0) {
            const antecedentSupport = calculateSupport(antecedent);
            const confidence = antecedentSupport > 0 ? itemset.support / antecedentSupport : 0;
            const consequentSupport = calculateSupport(consequent);
            const lift = consequentSupport > 0 ? confidence / consequentSupport : 0;
            
            if (confidence >= minConfidence) {
              rules.push({
                antecedent,
                consequent,
                support: itemset.support,
                confidence,
                lift
              });
            }
          }
        }
      }
    });
    
    return rules.sort((a, b) => b.confidence - a.confidence);
  };

  const frequent1 = getFrequent1Itemsets();
  const frequent2 = getFrequent2Itemsets(frequent1);
  const frequent3 = getFrequent3Itemsets(frequent2);
  const allFrequentItemsets = [...frequent1, ...frequent2, ...frequent3];
  const associationRules = generateAssociationRules(allFrequentItemsets);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Analisis Apriori - Pola Penggunaan Bahan
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="minSupport">Minimum Support</Label>
              <Input
                id="minSupport"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={minSupport}
                onChange={(e) => setMinSupport(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minConfidence">Minimum Confidence</Label>
              <Input
                id="minConfidence"
                type="number"
                step="0.1"
                min="0"
                max="1"
                value={minConfidence}
                onChange={(e) => setMinConfidence(Number(e.target.value))}
              />
            </div>
            <div className="flex items-end">
              <Button onClick={() => setShowRules(!showRules)} className="w-full">
                <Search className="h-4 w-4 mr-2" />
                {showRules ? 'Lihat Itemsets' : 'Lihat Rules'}
              </Button>
            </div>
          </div>

          {transactions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Belum ada data transaksi untuk dianalisis
            </div>
          ) : (
            <>
              {!showRules ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Total Transaksi</p>
                          <p className="text-2xl font-bold text-blue-600">{transactions.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Frequent Itemsets</p>
                          <p className="text-2xl font-bold text-green-600">{allFrequentItemsets.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardContent className="p-4">
                        <div className="text-center">
                          <p className="text-sm text-gray-600">Association Rules</p>
                          <p className="text-2xl font-bold text-orange-600">{associationRules.length}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  <Card>
                    <CardHeader>
                      <CardTitle>Frequent Itemsets</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Itemset</TableHead>
                            <TableHead>Support</TableHead>
                            <TableHead>Ukuran</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {allFrequentItemsets.map((itemset, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div className="flex flex-wrap gap-1">
                                  {itemset.items.map((item, i) => (
                                    <Badge key={i} variant="secondary">
                                      {getIngredientName(item)}
                                    </Badge>
                                  ))}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={itemset.support >= 0.7 ? "default" : itemset.support >= 0.5 ? "secondary" : "outline"}>
                                  {(itemset.support * 100).toFixed(1)}%
                                </Badge>
                              </TableCell>
                              <TableCell>{itemset.items.length}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Association Rules</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Antecedent</TableHead>
                          <TableHead>Consequent</TableHead>
                          <TableHead>Support</TableHead>
                          <TableHead>Confidence</TableHead>
                          <TableHead>Lift</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {associationRules.map((rule, index) => (
                          <TableRow key={index}>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {rule.antecedent.map((item, i) => (
                                  <Badge key={i} variant="outline">
                                    {getIngredientName(item)}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-wrap gap-1">
                                {rule.consequent.map((item, i) => (
                                  <Badge key={i} variant="secondary">
                                    {getIngredientName(item)}
                                  </Badge>
                                ))}
                              </div>
                            </TableCell>
                            <TableCell>{(rule.support * 100).toFixed(1)}%</TableCell>
                            <TableCell>
                              <Badge variant={rule.confidence >= 0.8 ? "default" : "secondary"}>
                                {(rule.confidence * 100).toFixed(1)}%
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant={rule.lift > 1 ? "default" : "outline"}>
                                {rule.lift.toFixed(2)}
                              </Badge>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AprioriAnalysis;
