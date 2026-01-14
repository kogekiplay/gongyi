import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DynamicForm } from '../features/calc/DynamicForm';
import { ResultCard } from '../features/calc/cards/ResultCard';
import { useApp } from '../app/context';
import { calculate } from '../features/calc/api';
import { CalcResult, ParamType, HistoryItem } from '../features/calc/types';
import { Card, CardContent, CardHeader, CardTitle, Checkbox, Label } from '../components/ui';
import { motion } from 'framer-motion';

const PARAM_OPTIONS: { id: ParamType; label: string }[] = [
  { id: 'AFilm', label: 'a边漆膜厚度' },
  { id: 'BFilm', label: 'b边漆膜厚度' },
  { id: 'ADie', label: 'a边挤压模具' },
  { id: 'BDie', label: 'b边挤压模具' },
];

export function FullCalc() {
  const { standard } = useApp();
  const location = useLocation();
  const [selectedParams, setSelectedParams] = useState<ParamType[]>(['AFilm', 'BFilm', 'ADie', 'BDie']);
  const [result, setResult] = useState<CalcResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formDefaults, setFormDefaults] = useState<any>(null);

  useEffect(() => {
    if (location.state && (location.state as any).restore) {
      const item = (location.state as any).restore as HistoryItem;
      if (item.request.selected) {
        setSelectedParams(item.request.selected);
      }
      setFormDefaults(item.request.inputs);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const toggleParam = (id: ParamType) => {
    setSelectedParams(prev => 
      prev.includes(id) 
        ? prev.filter(p => p !== id)
        : [...prev, id]
    );
  };

  const handleCalc = async (values: any) => {
    if (selectedParams.length === 0) return;
    
    setIsSubmitting(true);
    const req = {
      standard,
      mode: 'Full' as const,
      selected: selectedParams,
      inputs: values
    };
    
    const res = await calculate(req);
    setResult(res);
    setIsSubmitting(false);
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        <Card>
            <CardHeader><CardTitle>计算项目选择</CardTitle></CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {PARAM_OPTIONS.map(opt => (
                        <div key={opt.id} className="flex items-center space-x-2">
                            <Checkbox 
                                id={`check-${opt.id}`} 
                                checked={selectedParams.includes(opt.id)}
                                onChange={() => toggleParam(opt.id)}
                            />
                            <Label htmlFor={`check-${opt.id}`} className="cursor-pointer">{opt.label}</Label>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>

        <DynamicForm 
            mode="Full"
            onSubmit={handleCalc}
            isSubmitting={isSubmitting}
            defaultValues={formDefaults}
        />
      </div>

      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        {result && result.results && result.results.length > 0 ? (
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">计算结果</h3>
                {result.results.map((res, idx) => (
                    <ResultCard 
                        key={idx} 
                        result={{ ...result, results: [res] }} 
                        className="animate-in fade-in slide-in-from-bottom-4"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    />
                ))}
            </div>
        ) : (
            <Card className="h-full flex items-center justify-center min-h-[200px] text-[var(--muted)]">
                请填写左侧参数并开始计算
            </Card>
        )}
      </div>
    </motion.div>
  );
}
