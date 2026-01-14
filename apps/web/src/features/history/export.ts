import { format } from 'date-fns';
import { HistoryItem } from '../calc/types';
import { getStandardLabel, getModeLabel, getInputLabel } from './labels';
import { generateSummary } from './summary';

export function getExportData(data: HistoryItem[]) {
  return data.map(item => {
    const summary = generateSummary(item);
    return {
      id: item.id,
      created_at: new Date(item.timestamp).toISOString(),
      standard: item.request.standard,
      standard_label: getStandardLabel(item.request.standard),
      mode: item.request.mode,
      mode_label: getModeLabel(item.request.mode),
      param_label: summary.title,
      result_summary: summary.resultSummary,
      // Readable inputs
      inputs_readable: Object.entries(item.request.inputs).reduce((acc, [k, v]) => {
        acc[getInputLabel(k)] = v;
        return acc;
      }, {} as Record<string, any>),
      // Raw data
      request: item.request,
      result: item.result,
    };
  });
}

export function exportHistory(data: HistoryItem[], type: 'json' | 'csv') {
  if (data.length === 0) return;

  let content = '';
  let mimeType = '';
  let ext = '';

  // Transform data for export to be more readable
  const exportData = getExportData(data);

  if (type === 'json') {
    content = JSON.stringify(exportData, null, 2);
    mimeType = 'application/json';
    ext = 'json';
  } else {
    // CSV Flattening with readable headers
    const headers = ['时间', '标准', '模式', '计算项', '结果摘要', '输入参数详情'];
    const rows = exportData.map(item => [
      format(new Date(item.created_at), 'yyyy-MM-dd HH:mm:ss'),
      item.standard_label,
      item.mode_label,
      item.param_label,
      item.result_summary,
      JSON.stringify(item.inputs_readable).replace(/"/g, '""'), // Escape quotes for CSV
    ]);
    // Add BOM for Excel Chinese support
    content = '\uFEFF' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    mimeType = 'text/csv;charset=utf-8;';
    ext = 'csv';
  }

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `工艺计算历史_${format(new Date(), 'yyyyMMddHHmm')}.${ext}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
