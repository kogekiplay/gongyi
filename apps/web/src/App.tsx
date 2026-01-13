import { useState, useEffect } from 'react';
import { StandardType, CalcMode, HistoryItem } from './types';
import { Calculator } from './components/Calculator';
import { History } from './components/History';
import { Button, Card, CardHeader, CardTitle, CardContent } from './components/ui';
import { Calculator as CalcIcon, Clock, Info, ArrowLeft } from 'lucide-react';

export default function App() {
  const [step, setStep] = useState<'home' | 'standard' | 'mode' | 'calc'>('home');
  const [standard, setStandard] = useState<StandardType>('ShenBian');
  const [mode, setMode] = useState<CalcMode>('Single');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  // Load history from local storage
  useEffect(() => {
    const saved = localStorage.getItem('gongyi_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }
  }, []);

  const saveHistory = (req: any, res: any) => {
    const newItem: HistoryItem = {
      timestamp: Date.now(),
      request: req,
      result: res
    };
    const newHistory = [newItem, ...history].slice(0, 50);
    setHistory(newHistory);
    localStorage.setItem('gongyi_history', JSON.stringify(newHistory));
  };
  
  // NOTE: Calculator needs update to accept initialInputs. 
  // I will just re-render Calculator with key to force reset or use a state manager.
  // Let's use a state here to pass to Calculator.
  const [initialInputs, setInitialInputs] = useState<any>({});
  
  const restoreAndNavigate = (item: HistoryItem) => {
      setInitialInputs(item.request.inputs);
      setStandard(item.request.standard);
      setMode(item.request.mode);
      setStep('calc');
      setShowHistory(false);
  };

  const deleteHistory = (timestamps: number[]) => {
      const newHistory = history.filter(h => !timestamps.includes(h.timestamp));
      setHistory(newHistory);
      localStorage.setItem('gongyi_history', JSON.stringify(newHistory));
  };

  const exportJSON = () => {
      const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gongyi_history_${Date.now()}.json`;
      a.click();
  };

  const exportCSV = () => {
      // Simple CSV export
      const headers = ["Timestamp", "Standard", "Mode", "Param", "Result Value", "Unit"];
      const rows = history.map(h => [
          new Date(h.timestamp).toISOString(),
          h.request.standard,
          h.request.mode,
          h.request.param || "Full",
          // Just dump first available result for simplicity or join them
          h.result.a_film ? `A_Film:${h.result.a_film.value}` : "",
          "mm"
      ]);
      const csvContent = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gongyi_history_${Date.now()}.csv`;
      a.click();
  };

  if (showHistory) {
      return (
          <div className="min-h-screen bg-slate-50 p-4 md:p-8">
              <div className="max-w-4xl mx-auto">
                <Button variant="outline" onClick={() => setShowHistory(false)} className="mb-4 bg-white hover:bg-slate-100 gap-2 pl-2">
                    <ArrowLeft size={16} /> 返回
                </Button>
                <Card>
                    <CardHeader><CardTitle>历史记录</CardTitle></CardHeader>
                    <CardContent>
                        <History 
                            history={history} 
                            onRestore={restoreAndNavigate} 
                            onDelete={deleteHistory}
                            onClear={() => { setHistory([]); localStorage.removeItem('gongyi_history'); }}
                            onExportJSON={exportJSON}
                            onExportCSV={exportCSV}
                        />
                    </CardContent>
                </Card>
              </div>
          </div>
      );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900">
      <header className="bg-blue-900 text-white p-4 shadow-md">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <CalcIcon />
            <h1 className="text-xl font-bold">铜陵杨铜工艺计算器</h1>
          </div>
          <div className="flex space-x-2">
            <Button variant="ghost" className="text-white hover:bg-blue-800" onClick={() => setShowAbout(true)}>
              <Info className="mr-2 h-4 w-4" /> 关于
            </Button>
            <Button variant="ghost" className="text-white hover:bg-blue-800" onClick={() => setShowHistory(true)}>
              <Clock className="mr-2 h-4 w-4" /> 历史记录
            </Button>
          </div>
        </div>
      </header>

      {showAbout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-80 relative shadow-lg">
            <CardHeader>
              <CardTitle>关于</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 text-lg space-y-2">
                <p>UI作者：张奇</p>
                <p>原计算逻辑：郭俊</p>
                <p>使用语言：TypeScript+Tauri+Rust</p>
                <p>
                  项目地址：
                  <a 
                    href="https://github.com/kogeki/gongyi" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:underline block text-sm mt-1 truncate"
                  >
                    https://github.com/kogeki/gongyi
                  </a>
                </p>
              </div>
              <Button onClick={() => setShowAbout(false)} className="w-full">
                关闭
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 overflow-auto">
        <div className="max-w-2xl mx-auto">
          {step === 'home' && (
             <div className="flex flex-col items-center justify-center space-y-8 py-20 animate-in zoom-in duration-300">
                <h2 className="text-3xl font-bold text-slate-800">欢迎使用工艺计算器</h2>
                <Button size="lg" className="text-lg px-8 py-6" onClick={() => setStep('standard')}>
                    开始计算
                </Button>
             </div>
          )}

          {step === 'standard' && (
             <div className="flex flex-col items-center space-y-6 animate-in slide-in-from-right duration-300">
                <h2 className="text-2xl font-bold">选择标准</h2>
                <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
                    <Button variant="outline" className="h-32 text-xl border-2 hover:border-blue-500 hover:bg-blue-50" 
                        onClick={() => { setStandard('ShenBian'); setStep('mode'); }}>
                        沈变标准
                    </Button>
                    <Button variant="outline" className="h-32 text-xl border-2 hover:border-blue-500 hover:bg-blue-50"
                        onClick={() => { setStandard('HengBian'); setStep('mode'); }}>
                        衡变标准
                    </Button>
                </div>
                <Button variant="ghost" onClick={() => setStep('home')}>返回</Button>
             </div>
          )}

          {step === 'mode' && (
             <div className="flex flex-col items-center space-y-6 animate-in slide-in-from-right duration-300">
                <h2 className="text-2xl font-bold">选择计算类型</h2>
                <div className="grid grid-cols-2 gap-6 w-full max-w-lg">
                    <Button variant="outline" className="h-32 text-xl border-2 hover:border-blue-500 hover:bg-blue-50 flex flex-col gap-2"
                        onClick={() => { setMode('Single'); setStep('calc'); }}>
                        <span>单参数计算</span>
                        <span className="text-sm font-normal text-slate-500">逐个参数输入与计算</span>
                    </Button>
                    <Button variant="outline" className="h-32 text-xl border-2 hover:border-blue-500 hover:bg-blue-50 flex flex-col gap-2"
                        onClick={() => { setMode('Full'); setStep('calc'); }}>
                        <span>全参数计算</span>
                        <span className="text-sm font-normal text-slate-500">一次输入，批量输出</span>
                    </Button>
                </div>
                <Button variant="ghost" onClick={() => setStep('standard')}>返回</Button>
             </div>
          )}

          {step === 'calc' && (
            <Calculator 
                standard={standard} 
                mode={mode} 
                onBack={() => setStep('mode')} 
                onSaveHistory={saveHistory}
                initialInputs={initialInputs}
            />
          )}
        </div>
      </main>
    </div>
  );
}
