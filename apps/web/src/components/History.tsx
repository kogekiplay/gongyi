import { useState } from 'react';
import { HistoryItem } from '../types';
import { Button, Card, CardContent, Checkbox } from './ui';
import { RotateCcw, Trash2 } from 'lucide-react';

interface HistoryProps {
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onClear: () => void;
  onDelete: (timestamps: number[]) => void;
  onExportJSON: () => void;
  onExportCSV: () => void;
}

export function History({ history, onRestore, onClear, onDelete, onExportJSON, onExportCSV }: HistoryProps) {
  const [selectedItems, setSelectedItems] = useState<number[]>([]);

  const toggleSelection = (timestamp: number) => {
    setSelectedItems(prev => 
      prev.includes(timestamp) 
        ? prev.filter(t => t !== timestamp)
        : [...prev, timestamp]
    );
  };

  const deleteSelected = () => {
    if (selectedItems.length > 0) {
      onDelete(selectedItems);
      setSelectedItems([]);
    }
  };

  if (history.length === 0) {
    return <div className="text-center text-slate-500 py-10">暂无历史记录</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">最近记录</h3>
        <div className="space-x-2">
            {selectedItems.length > 0 && (
              <Button variant="ghost" size="sm" onClick={deleteSelected} className="text-red-500 hover:text-red-600 bg-red-50 hover:bg-red-100">
                删除选中 ({selectedItems.length})
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={onExportJSON}>导出 JSON</Button>
            <Button variant="outline" size="sm" onClick={onExportCSV}>导出 CSV</Button>
            <Button variant="ghost" size="sm" onClick={onClear} className="text-red-500 hover:text-red-600">清空</Button>
        </div>
      </div>
      
      <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
        {history.map((item, idx) => (
          <Card key={item.timestamp + idx} className={`bg-slate-50 transition-colors ${selectedItems.includes(item.timestamp) ? 'border-blue-300 bg-blue-50' : ''}`}>
            <CardContent className="p-4 flex items-start gap-3">
              <div className="pt-1">
                <Checkbox 
                  checked={selectedItems.includes(item.timestamp)}
                  onChange={() => toggleSelection(item.timestamp)}
                />
              </div>
              <div className="flex-1">
                <div className="text-xs text-slate-400 mb-1">
                  {new Date(item.timestamp).toLocaleString()} - {item.request.standard === 'ShenBian' ? '沈变' : '衡变'} / {item.request.mode === 'Single' ? '单参数' : '全参数'}
                </div>
                <div className="font-medium text-sm text-slate-700">
                  {item.request.mode === 'Single' 
                    ? `Input: ${JSON.stringify(item.request.inputs).slice(0, 50)}...`
                    : '全参数计算'}
                </div>
              </div>
              <div className="flex space-x-1">
                <Button variant="ghost" size="sm" onClick={() => onRestore(item)} title="回填数据">
                  <RotateCcw size={14} className="mr-1" /> 回填
                </Button>
                <Button variant="ghost" size="sm" onClick={() => onDelete([item.timestamp])} className="text-slate-400 hover:text-red-500" title="删除">
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
