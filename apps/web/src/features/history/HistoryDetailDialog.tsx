import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, Button } from '../../components/ui';
import { HistoryItem } from '../calc/types';
import { getStandardLabel, getModeLabel, getInputLabel } from './labels';
import { generateSummary } from './summary';
import { format } from 'date-fns';
import { Copy, Download, RotateCcw, Trash2 } from 'lucide-react';
import { exportHistory } from './export';

interface HistoryDetailDialogProps {
  item: HistoryItem | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRestore: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
}

export function HistoryDetailDialog({ item, open, onOpenChange, onRestore, onDelete }: HistoryDetailDialogProps) {
  if (!item) return null;

  const summary = generateSummary(item);

  const handleCopy = () => {
    if (!item.result.results) return;
    const text = item.result.results
        .map(r => `${r.label}: ${r.value}${r.unit}`)
        .join('\n');
    navigator.clipboard.writeText(text);
    // Could add toast here
  };

  const handleExportJson = () => {
    exportHistory([item], 'json');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span>计算详情</span>
            <span className="text-sm font-normal text-[var(--muted)] bg-[var(--bg1)] px-2 py-0.5 rounded-md">
                {format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm:ss')}
            </span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-2">
          {/* Header Info */}
          <div className="flex gap-4 text-sm">
            <div className="flex flex-col gap-1">
                <span className="text-[var(--muted)]">标准</span>
                <span className="font-medium">{getStandardLabel(item.request.standard)}</span>
            </div>
            <div className="w-[1px] bg-[var(--border)]" />
            <div className="flex flex-col gap-1">
                <span className="text-[var(--muted)]">模式</span>
                <span className="font-medium">{getModeLabel(item.request.mode)}</span>
            </div>
            <div className="w-[1px] bg-[var(--border)]" />
            <div className="flex flex-col gap-1">
                <span className="text-[var(--muted)]">计算项</span>
                <span className="font-medium text-[var(--primary)]">{summary.title}</span>
            </div>
          </div>

          {/* Results List */}
          <div className="bg-[var(--bg0)] rounded-xl p-4 space-y-3 border border-[var(--border)]">
            <h4 className="text-sm font-semibold text-[var(--muted)] mb-2">计算结果</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {item.result.results?.map((res, idx) => (
                    <div key={idx} className="bg-white p-3 rounded-lg shadow-sm flex flex-col">
                        <span className="text-xs text-[var(--muted)]">{res.label}</span>
                        <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-xl font-bold text-[var(--primary)]">{res.value}</span>
                            <span className="text-sm text-[var(--muted)]">{res.unit}</span>
                        </div>
                        <div className="text-[10px] text-[var(--muted)] mt-1 opacity-60">
                            公式: {res.formula_id}
                        </div>
                    </div>
                ))}
            </div>
          </div>

          {/* Input Params */}
          <div>
            <h4 className="text-sm font-semibold text-[var(--muted)] mb-3">输入参数</h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-8 text-sm">
                {Object.entries(item.request.inputs).map(([key, value]) => (
                    <div key={key} className="flex justify-between border-b border-[var(--border)] border-dashed pb-1">
                        <span className="text-[var(--muted)]">{getInputLabel(key)}</span>
                        <span className="font-medium font-mono">{value} <span className="text-[10px] text-[var(--muted)]">mm</span></span>
                    </div>
                ))}
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <div className="flex w-full justify-between">
            <Button 
                variant="destructive" 
                onClick={() => { onDelete(item.id); onOpenChange(false); }}
            >
                <Trash2 size={16} className="mr-2" />
                删除记录
            </Button>
            
            <div className="flex gap-2">
                <Button variant="outline" onClick={handleExportJson}>
                    <Download size={16} className="mr-2" />
                    导出 JSON
                </Button>
                <Button variant="outline" onClick={handleCopy}>
                    <Copy size={16} className="mr-2" />
                    复制结果
                </Button>
                <Button onClick={() => { onRestore(item); onOpenChange(false); }}>
                    <RotateCcw size={16} className="mr-2" />
                    回填表单
                </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
