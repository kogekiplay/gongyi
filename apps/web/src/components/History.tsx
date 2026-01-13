import React from 'react';
import { HistoryItem } from '../types';
import { Button, Card, CardHeader, CardTitle, CardContent } from './ui';
import { RotateCcw } from 'lucide-react';

interface HistoryProps {
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onClear: () => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
}

export function History({ history, onRestore, onClear, onExportJSON, onExportCSV }: HistoryProps) {
  if (history.length === 0) {
    return <div className="text-center text-slate-500 py-10">暂无历史记录</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">最近记录</h3>
        <div className="space-x-2">
            <Button variant="outline" size="sm" onClick={onExportJSON}>导出 JSON</Button>
            <Button variant="outline" size="sm" onClick={onExportCSV}>导出 CSV</Button>
            <Button variant="ghost" size="sm" onClick={onClear} className="text-red-500 hover:text-red-600">清空</Button>
        </div>
      </div>
      
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {history.map((item, idx) => (
          <Card key={item.timestamp + idx} className="bg-slate-50">
            <CardContent className="p-4 flex justify-between items-start">
              <div>
                <div className="text-xs text-slate-400 mb-1">
                  {new Date(item.timestamp).toLocaleString()} - {item.request.standard === 'ShenBian' ? '沈变' : '衡变'} / {item.request.mode === 'Single' ? '单参数' : '全参数'}
                </div>
                <div className="font-medium text-sm text-slate-700">
                  {item.request.mode === 'Single' 
                    ? `Input: ${JSON.stringify(item.request.inputs).slice(0, 50)}...`
                    : '全参数计算'}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => onRestore(item)}>
                <RotateCcw size={14} className="mr-1" /> 回填
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
