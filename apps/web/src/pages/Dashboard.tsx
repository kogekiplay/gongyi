import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { DynamicForm } from '../features/calc/DynamicForm';
import { ResultCard } from '../features/calc/cards/ResultCard';
import { HistoryCard } from '../features/calc/cards/HistoryCard';
import { FormulaCard } from '../features/calc/cards/FormulaCard';
import { PresetCard } from '../features/calc/cards/PresetCard';
import { useApp } from '../app/context';
import { calculate } from '../features/calc/api';
import { historyStorage } from '../features/history/storage';
import { CalcResult, HistoryItem, ParamType } from '../features/calc/types';
import { CalcFormValues } from '../features/calc/schema';
import { Card, CardContent, CardHeader, CardTitle, Button } from '../components/ui';
import { motion } from 'framer-motion';

const PARAM_OPTIONS: { id: ParamType; label: string }[] = [
  { id: 'AFilm', label: 'a边漆膜厚度' },
  { id: 'BFilm', label: 'b边漆膜厚度' },
  { id: 'ADie', label: 'a边挤压模具' },
  { id: 'BDie', label: 'b边挤压模具' },
];

export function Dashboard() {
  const { standard } = useApp();
  const location = useLocation();
  const [param, setParam] = useState<ParamType>('AFilm');
  const [result, setResult] = useState<CalcResult | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [formDefaults, setFormDefaults] = useState<any>(null);
  const [formUpdates, setFormUpdates] = useState<Partial<CalcFormValues> | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    historyStorage.init().then(setHistory);
    
    // Check for restore state
    if (location.state && (location.state as any).restore) {
        const item = (location.state as any).restore as HistoryItem;
        handleRestore(item);
        // Clear state to avoid re-restoring on refresh? 
        // Actually window.history.replaceState might be better but this is fine for now
        window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleCalc = async (values: any) => {
    setIsSubmitting(true);
    const req = {
      standard,
      mode: 'Single' as const,
      param,
      inputs: values
    };
    
    const res = await calculate(req);
    setResult(res);
    setIsSubmitting(false);

    if (res.ok) {
        const newItem: HistoryItem = {
            id: crypto.randomUUID(),
            timestamp: Date.now(),
            request: req,
            result: res
        };
        const updated = await historyStorage.add(newItem);
        setHistory(updated);
    }
  };

  const handleRestore = (item: HistoryItem) => {
      // Switch standard if needed
      // Note: In real app we might want to warn user or auto-switch
      // Here we assume context updates or we just fill form
      if (item.request.param) setParam(item.request.param);
      setFormDefaults(item.request.inputs);
  };

  return (
    <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* Left Column: Input */}
      <div className="lg:col-span-7 xl:col-span-8 space-y-6">
        {/* Param Selector */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {PARAM_OPTIONS.map(opt => (
                <Button 
                    key={opt.id}
                    variant={param === opt.id ? 'primary' : 'secondary'}
                    onClick={() => { setParam(opt.id); setResult(null); }}
                    className="w-full"
                >
                    {opt.label}
                </Button>
            ))}
        </div>

        <DynamicForm 
            mode="Single"
            param={param}
            onSubmit={handleCalc}
            defaultValues={formDefaults}
            updates={formUpdates}
            isSubmitting={isSubmitting}
        />
        
        <PresetCard onSelect={(vals) => setFormUpdates(vals)} />

        {/* Formula Card (Desktop usually below form or side) */}
        <FormulaCard result={result} />
      </div>

      {/* Right Column: Result & History */}
      <div className="lg:col-span-5 xl:col-span-4 space-y-6">
        <ResultCard result={result} />
        <HistoryCard history={history} onRestore={handleRestore} />
        
        {/* Optional: Preset Card or Stats could go here */}
        <Card>
            <CardHeader><CardTitle>常用数据</CardTitle></CardHeader>
            <CardContent>
                <div className="text-sm text-[var(--muted)]">
                    此处可放置绝缘纸厚度常用值快捷按钮。
                </div>
            </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
