import { RotateCcw, Clock } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../../../components/ui';
import { HistoryItem } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';

interface HistoryCardProps {
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  className?: string;
}

export function HistoryCard({ history, onRestore, className }: HistoryCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
            <Clock size={18} /> 最近记录
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-[var(--border)]">
          {history.length === 0 ? (
            <div className="p-6 text-center text-[var(--muted)] text-sm">暂无记录</div>
          ) : (
            history.slice(0, 5).map((item) => (
              <div key={item.id} className="p-4 flex items-center justify-between hover:bg-[var(--bg0)] transition-colors group">
                <div className="flex flex-col gap-1 overflow-hidden">
                    <div className="flex items-center gap-2">
                        <span className="font-medium text-sm text-[var(--text)]">
                            {item.result.results?.[0]?.value ?? '-'} 
                            <span className="text-xs text-[var(--muted)] ml-1">{item.result.results?.[0]?.unit}</span>
                        </span>
                        <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--bg1)] text-[var(--muted)]">
                            {item.request.standard === 'ShenBian' ? '沈变' : '衡变'}
                        </span>
                    </div>
                    <span className="text-xs text-[var(--muted)] truncate">
                        {formatDistanceToNow(item.timestamp, { addSuffix: true, locale: zhCN })}
                    </span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => onRestore(item)} title="回填">
                  <RotateCcw size={14} className="text-[var(--primary)]" />
                </Button>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
