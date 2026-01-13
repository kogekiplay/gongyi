import { useState, useEffect } from 'react';
import { StandardType, CalcMode, ParamType, CalcInput, FullCalcOutput } from '../types';
import { calculate } from '../lib/api';
import { Button, Input, Label, Card, CardHeader, CardTitle, CardContent } from './ui';
import { ArrowLeft, Calculator as CalcIcon, Copy } from 'lucide-react';

const PARAMS: { id: ParamType; label: string }[] = [
  { id: 'AFilm', label: 'a边漆膜厚度' },
  { id: 'BFilm', label: 'b边漆膜厚度' },
  { id: 'ADie', label: 'a边挤压模具尺寸' },
  { id: 'BDie', label: 'b边挤压模具尺寸' },
];

const FIELDS = {
  n: "导线根数 n",
  a_h_change: "a边换位线厚度(mm)",
  a_h_bare: "a边裸线厚度(mm)",
  b_h_change: "b边换位线厚度(mm)",
  b_h_bare: "b边裸线厚度(mm)",
  paper_h: "绝缘纸厚度(mm)",
  center_paper_h: "中心纸厚度(mm)",
  a_shrink: "a边收缩比(mm)",
  b_shrink: "b边收缩比(mm)",
  a_reserve: "a边预留模拉硬度(mm)",
  b_reserve: "b边预留模拉硬度(mm)",
};

interface CalculatorProps {
  standard: StandardType;
  mode: CalcMode;
  onBack: () => void;
  onSaveHistory: (req: any, res: any) => void;
  initialInputs?: CalcInput;
}

export function Calculator({ standard, mode, onBack, onSaveHistory, initialInputs }: CalculatorProps) {
  const [selectedParam, setSelectedParam] = useState<ParamType | null>(mode === 'Single' ? 'AFilm' : null);
  const [inputs, setInputs] = useState<CalcInput>(initialInputs || {});
  const [result, setResult] = useState<FullCalcOutput | null>(null);
  const [error, setError] = useState<string | null>(null);

  // If initialInputs changes, update inputs (optional, but good for "restore" if component isn't remounted)
  useEffect(() => {
      if (initialInputs) setInputs(initialInputs);
  }, [initialInputs]);

  const handleInputChange = (field: keyof CalcInput, value: string) => {
    const numVal = value === '' ? undefined : Number(value);
    setInputs(prev => ({ ...prev, [field]: numVal }));
  };

  const getRequiredFields = (): (keyof CalcInput)[] => {
    if (mode === 'Full') {
        // Return all fields relevant to ANY calculation, grouped?
        // Actually, let's just show all fields needed for all 4 calculations.
        return [
            'n', 'paper_h', 'center_paper_h',
            'a_h_change', 'a_h_bare', 'a_shrink', 'a_reserve',
            'b_h_change', 'b_h_bare', 'b_shrink', 'b_reserve'
        ];
    }
    
    switch (selectedParam) {
      case 'AFilm': return ['n', 'a_h_change', 'a_h_bare', 'paper_h'];
      case 'BFilm': return ['b_h_change', 'b_h_bare', 'paper_h', 'center_paper_h'];
      case 'ADie': return ['a_h_bare', 'a_shrink', 'a_reserve'];
      case 'BDie': return ['b_h_bare', 'b_shrink', 'b_reserve'];
      default: return [];
    }
  };

  const doCalculate = async () => {
    setError(null);
    setResult(null);
    
    const req = {
      standard,
      mode,
      param: selectedParam || undefined,
      inputs
    };

    const res = await calculate(req);
    
    if (res.success && res.data) {
      setResult(res.data);
      onSaveHistory(req, res.data);
    } else {
      setError(res.error || "未知错误");
    }
  };

  const renderResultItem = (label: string, item?: { value: number, unit: string }) => {
    if (!item) return null;
    return (
      <div className="bg-slate-50 p-4 rounded-md border border-slate-100 mb-2 relative group">
        <div className="text-sm text-slate-500 mb-1">{label}</div>
        <div className="text-2xl font-bold text-blue-700">
          {item.value} <span className="text-base font-normal text-slate-600">{item.unit}</span>
        </div>
        <button 
            className="absolute top-2 right-2 p-2 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400 hover:text-blue-600"
            onClick={() => navigator.clipboard.writeText(`${item.value}`)}
            title="复制结果"
        >
            <Copy size={16} />
        </button>
      </div>
    );
  };

  const requiredFields = getRequiredFields();

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" onClick={onBack} className="p-2">
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h2 className="text-xl font-bold text-slate-900">
            {standard === 'ShenBian' ? '沈变标准' : '衡变标准'}
            <span className="mx-2 text-slate-300">|</span>
            {mode === 'Single' ? '单参数计算' : '全参数计算'}
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Param Selection (Single Mode Only) */}
        {mode === 'Single' && (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="text-lg">选择参数</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              {PARAMS.map(p => (
                <Button
                  key={p.id}
                  variant={selectedParam === p.id ? 'primary' : 'outline'}
                  className="w-full justify-start text-left"
                  onClick={() => { setSelectedParam(p.id); setResult(null); setError(null); }}
                >
                  {p.label}
                </Button>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Center: Input Form */}
        <Card className={mode === 'Full' ? 'md:col-span-2' : 'md:col-span-1'}>
          <CardHeader>
            <CardTitle className="text-lg">输入参数</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {requiredFields.map(field => (
              <div key={field} className="space-y-1">
                <Label htmlFor={field}>{FIELDS[field]}</Label>
                <Input
                  id={field}
                  type="number"
                  step="0.01"
                  value={inputs[field] ?? ''}
                  onChange={(e) => handleInputChange(field, e.target.value)}
                  placeholder="0.00"
                />
              </div>
            ))}
            
            <Button className="w-full mt-4" size="lg" onClick={doCalculate}>
              <CalcIcon className="mr-2 h-4 w-4" /> 开始计算
            </Button>

            {error && (
              <div className="p-3 bg-red-50 text-red-600 text-sm rounded-md border border-red-100">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right: Results (or Bottom in Full mode) */}
        <div className={mode === 'Full' ? 'md:col-span-3' : 'md:col-span-1'}>
            {result && (
                <Card className="bg-blue-50/50 border-blue-100">
                    <CardHeader>
                        <CardTitle className="text-lg text-blue-900">计算结果</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {mode === 'Single' && selectedParam === 'AFilm' && renderResultItem('a边漆膜厚度', result.a_film)}
                        {mode === 'Single' && selectedParam === 'BFilm' && renderResultItem('b边漆膜厚度', result.b_film)}
                        {mode === 'Single' && selectedParam === 'ADie' && renderResultItem('a边挤压模具尺寸', result.a_die)}
                        {mode === 'Single' && selectedParam === 'BDie' && renderResultItem('b边挤压模具尺寸', result.b_die)}
                        
                        {mode === 'Full' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {renderResultItem('a边漆膜厚度', result.a_film)}
                                {renderResultItem('b边漆膜厚度', result.b_film)}
                                {renderResultItem('a边挤压模具尺寸', result.a_die)}
                                {renderResultItem('b边挤压模具尺寸', result.b_die)}
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
      </div>
    </div>
  );
}
