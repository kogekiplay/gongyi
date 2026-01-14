import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyStorage } from '../features/history/storage';
import { HistoryItem } from '../features/calc/types';
import { Button, Input, Checkbox, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { Search, Trash2, FileJson, FileSpreadsheet, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

export function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    historyStorage.init().then(history => setHistory(history));
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      // Search in ID, formatted date, or input values
      const dateStr = format(item.timestamp, 'yyyy-MM-dd HH:mm');
      const inputsStr = JSON.stringify(item.request.inputs);
      return dateStr.includes(term) || inputsStr.includes(term) || item.request.param?.toLowerCase().includes(term);
    });
  }, [history, searchTerm]);

  const handleDelete = async (ids: string[]) => {
    if (confirm(`确定要删除 ${ids.length} 条记录吗？`)) {
      const updated = await historyStorage.delete(ids);
      setHistory(updated);
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    }
  };

  const handleExport = (type: 'json' | 'csv') => {
    const dataToExport = selectedIds.length > 0 
      ? history.filter(h => selectedIds.includes(h.id))
      : history;

    if (dataToExport.length === 0) return;

    let content = '';
    let mimeType = '';
    let ext = '';

    if (type === 'json') {
      content = JSON.stringify(dataToExport, null, 2);
      mimeType = 'application/json';
      ext = 'json';
    } else {
      // CSV Flattening
      const headers = ['ID', 'Time', 'Standard', 'Mode', 'Param', 'Inputs', 'Result'];
      const rows = dataToExport.map(item => [
        item.id,
        format(item.timestamp, 'yyyy-MM-dd HH:mm:ss'),
        item.request.standard,
        item.request.mode,
        item.request.param || 'FULL',
        JSON.stringify(item.request.inputs).replace(/"/g, '""'), // Escape quotes
        item.result.results?.map(r => `${r.label}:${r.value}${r.unit}`).join('; ') || 'Error'
      ]);
      content = [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
      mimeType = 'text/csv;charset=utf-8;';
      ext = 'csv';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gongyi_history_${format(new Date(), 'yyyyMMddHHmm')}.${ext}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestore = (item: HistoryItem) => {
    if (item.request.mode === 'Single') {
      navigate('/', { state: { restore: item } });
    } else {
      navigate('/full', { state: { restore: item } });
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredHistory.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredHistory.map(h => h.id));
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-4">
          <CardTitle>历史记录 ({history.length})</CardTitle>
          <div className="flex items-center space-x-2">
             <div className="relative w-64">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-[var(--muted)]" />
                <Input 
                  placeholder="搜索时间、参数..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
             </div>
             <Button variant="outline" size="icon" onClick={() => handleExport('json')} title="导出 JSON">
                <FileJson size={16} />
             </Button>
             <Button variant="outline" size="icon" onClick={() => handleExport('csv')} title="导出 CSV">
                <FileSpreadsheet size={16} />
             </Button>
             {selectedIds.length > 0 && (
               <Button variant="destructive" size="icon" onClick={() => handleDelete(selectedIds)} title="删除选中">
                 <Trash2 size={16} />
               </Button>
             )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-[var(--border)] overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-[var(--bg0)] text-sm font-medium text-[var(--muted)] border-b border-[var(--border)]">
              <div className="col-span-1 flex items-center justify-center">
                <Checkbox 
                  checked={filteredHistory.length > 0 && selectedIds.length === filteredHistory.length}
                  onChange={toggleSelectAll}
                />
              </div>
              <div className="col-span-3">时间</div>
              <div className="col-span-2">类型</div>
              <div className="col-span-4">结果概要</div>
              <div className="col-span-2 text-right">操作</div>
            </div>
            
            <div className="max-h-[600px] overflow-y-auto">
              <AnimatePresence initial={false}>
                {filteredHistory.length === 0 ? (
                  <div className="p-8 text-center text-[var(--muted)]">无记录</div>
                ) : (
                  filteredHistory.map(item => (
                    <motion.div 
                      key={item.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="grid grid-cols-12 gap-4 p-4 items-center border-b border-[var(--border)] last:border-0 hover:bg-[var(--bg0)] transition-colors"
                    >
                      <div className="col-span-1 flex items-center justify-center">
                        <Checkbox 
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                        />
                      </div>
                      <div className="col-span-3 text-sm">
                        {format(item.timestamp, 'yyyy-MM-dd HH:mm:ss')}
                      </div>
                      <div className="col-span-2 text-sm">
                        <span className="px-2 py-1 rounded bg-white border border-[var(--border)] text-xs">
                          {item.request.mode === 'Single' ? '单参数' : '全参数'}
                        </span>
                        {item.request.param && (
                           <span className="ml-2 px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100 text-xs">
                             {item.request.param}
                           </span>
                        )}
                      </div>
                      <div className="col-span-4 text-sm truncate text-[var(--muted)]">
                        {item.result.results?.map(r => `${r.label}: ${r.value}`).join(', ')}
                      </div>
                      <div className="col-span-2 flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleRestore(item)} title="回填">
                           <ArrowUpRight size={16} />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete([item.id])} className="text-red-500 hover:text-red-600">
                           <Trash2 size={16} />
                        </Button>
                      </div>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
