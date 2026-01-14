import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { historyStorage } from '../features/history/storage';
import { HistoryItem } from '../features/calc/types';
import { Button, Input, Checkbox, Card, CardContent, CardHeader, CardTitle, Table, TableBody, TableCell, TableHead, TableHeader, TableRow, Badge, DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from '../components/ui';
import { Search, Trash2, FileJson, FileSpreadsheet, ArrowUpRight, MoreHorizontal, Eye, Copy, RotateCcw, Download, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { HistoryDetailDialog } from '../features/history/HistoryDetailDialog';
import { generateSummary } from '../features/history/summary';
import { exportHistory, getExportData } from '../features/history/export';
import { getStandardLabel, getModeLabel } from '../features/history/labels';

export function HistoryPage() {
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [detailItem, setDetailItem] = useState<HistoryItem | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  useEffect(() => {
    historyStorage.init().then(history => setHistory(history));
  }, []);

  const filteredHistory = useMemo(() => {
    return history.filter(item => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      const summary = generateSummary(item);
      
      const dateStr = format(item.timestamp, 'yyyy-MM-dd HH:mm:ss');
      const standardStr = getStandardLabel(item.request.standard);
      const modeStr = getModeLabel(item.request.mode);
      
      return dateStr.includes(term) || 
             summary.title.includes(term) || 
             summary.resultSummary.includes(term) ||
             standardStr.includes(term) ||
             modeStr.includes(term);
    });
  }, [history, searchTerm]);

  const handleDelete = async (ids: string[]) => {
    if (confirm(`确定要删除 ${ids.length} 条记录吗？`)) {
      const updated = await historyStorage.delete(ids);
      setHistory(updated);
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    }
  };

  const handleSingleDelete = (id: string) => {
    handleDelete([id]);
  };

  const handleExport = (type: 'json' | 'csv') => {
    const dataToExport = selectedIds.length > 0 
      ? history.filter(h => selectedIds.includes(h.id))
      : history;

    exportHistory(dataToExport, type);
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

  const openDetail = (item: HistoryItem) => {
    setDetailItem(item);
    setDetailOpen(true);
  };

  return (
    <TooltipProvider>
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
                  placeholder="搜索时间、计算项、标准..." 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    导出
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleExport('json')}>
                    <FileJson className="mr-2 h-4 w-4" />
                    导出 JSON
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleExport('csv')}>
                    <FileSpreadsheet className="mr-2 h-4 w-4" />
                    导出 CSV
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {selectedIds.length > 0 && (
                <Button variant="destructive" size="icon" onClick={() => handleDelete(selectedIds)} title="删除选中">
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border border-[var(--border)] overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] text-center">
                      <Checkbox 
                        checked={filteredHistory.length > 0 && selectedIds.length === filteredHistory.length}
                        onChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-[180px]">时间</TableHead>
                    <TableHead className="w-[100px]">标准</TableHead>
                    <TableHead className="w-[100px]">模式</TableHead>
                    <TableHead className="w-[200px]">计算项</TableHead>
                    <TableHead>结果概要</TableHead>
                    <TableHead className="w-[120px] text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <AnimatePresence initial={false}>
                    {filteredHistory.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={7} className="h-24 text-center text-[var(--muted)]">
                          无记录
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredHistory.map(item => {
                        const summary = generateSummary(item);
                        return (
                          <TableRow 
                            key={item.id}
                            className="cursor-pointer hover:bg-[var(--bg0)] transition-colors"
                            onClick={(e) => {
                              // Prevent opening detail when clicking checkbox or actions
                              if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
                              openDetail(item);
                            }}
                          >
                            <TableCell className="text-center">
                              <Checkbox 
                                checked={selectedIds.includes(item.id)}
                                onChange={() => toggleSelect(item.id)}
                              />
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">{format(item.timestamp, 'HH:mm:ss')}</span>
                                <span className="text-xs text-[var(--muted)]">{format(item.timestamp, 'yyyy-MM-dd')}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-200">
                                {getStandardLabel(item.request.standard)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {getModeLabel(item.request.mode)}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-medium text-[var(--text)]">
                              {summary.title}
                            </TableCell>
                            <TableCell className="text-[var(--muted)]">
                              <span className="line-clamp-1" title={summary.resultSummary}>
                                {summary.resultSummary}
                              </span>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => openDetail(item)} className="h-8 w-8">
                                      <Eye size={16} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>查看详情</TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleRestore(item)} className="h-8 w-8 text-blue-500 hover:text-blue-600">
                                      <RotateCcw size={16} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>回填表单</TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" onClick={() => handleDelete([item.id])} className="h-8 w-8 text-red-500 hover:text-red-600">
                                      <Trash2 size={16} />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>删除</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </AnimatePresence>
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <HistoryDetailDialog 
          item={detailItem} 
          open={detailOpen} 
          onOpenChange={setDetailOpen}
          onRestore={handleRestore}
          onDelete={handleSingleDelete}
        />
      </motion.div>
    </TooltipProvider>
  );
}
