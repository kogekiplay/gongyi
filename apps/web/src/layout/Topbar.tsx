import { useApp } from '../app/context';
import { SegmentedControl } from '../ui/segmented-control';
import { Button, DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, useToast } from '../components/ui';
import { Download, History as HistoryIcon, FileJson, FileSpreadsheet, ChevronDown } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { historyStorage } from '../features/history/storage';
import { exportHistory } from '../features/history/export';

const PAGE_TITLES: Record<string, string> = {
  '/': '概览 Dashboard',
  '/single': '单参数计算',
  '/full': '全参数计算',
  '/history': '历史记录',
  '/about': '关于',
};

export function Topbar() {
  const { standard, setStandard } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const title = PAGE_TITLES[location.pathname] || '工艺计算器';

  const handleExport = (type: 'json' | 'csv') => {
    const history = historyStorage.getAll();
    if (history.length === 0) {
      toast({ type: 'error', title: '导出失败', description: '暂无历史记录可导出' });
      return;
    }
    exportHistory(history, type);
    toast({ type: 'success', title: '导出成功', description: `已导出 ${history.length} 条记录` });
  };

  return (
    <header className="h-16 flex items-center justify-between px-8 sticky top-0 z-40 bg-transparent backdrop-blur-sm">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-[var(--text)]">{title}</h1>
      </div>

      <div className="absolute left-1/2 -translate-x-1/2">
        <SegmentedControl
          value={standard}
          onChange={(v) => setStandard(v as any)}
          options={[
            { label: '沈变标准', value: 'ShenBian' },
            { label: '衡变标准', value: 'HengBian' },
          ]}
          className="w-64"
        />
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={() => navigate('/history')} title="历史记录">
          <HistoryIcon size={18} />
        </Button>
        
        {location.pathname === '/history' && (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Button variant="secondary" size="sm" className="gap-2">
                <Download size={16} />
                导出
                <ChevronDown size={14} className="opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleExport('json')}>
                <FileJson size={14} className="mr-2" />
                导出 JSON
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport('csv')}>
                <FileSpreadsheet size={14} className="mr-2" />
                导出 CSV
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <Button variant="ghost" size="sm" onClick={() => navigate('/about')}>
          关于
        </Button>
      </div>
    </header>
  );
}
