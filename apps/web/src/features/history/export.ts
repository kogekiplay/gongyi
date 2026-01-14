import { format } from 'date-fns';
import { HistoryItem } from '../calc/types';

export function exportHistory(data: HistoryItem[], type: 'json' | 'csv') {
  if (data.length === 0) return;

  let content = '';
  let mimeType = '';
  let ext = '';

  if (type === 'json') {
    content = JSON.stringify(data, null, 2);
    mimeType = 'application/json';
    ext = 'json';
  } else {
    // CSV Flattening
    const headers = ['ID', 'Time', 'Standard', 'Mode', 'Param', 'Inputs', 'Result'];
    const rows = data.map(item => [
      item.id,
      format(new Date(item.timestamp), 'yyyy-MM-dd HH:mm:ss'),
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
}
