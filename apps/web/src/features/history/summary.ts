import { HistoryItem } from '../calc/types';
import { getParamLabel } from './labels';

export interface HistorySummary {
  title: string;
  resultSummary: string;
  count?: number;
}

export function generateSummary(item: HistoryItem): HistorySummary {
  const { request, result } = item;
  
  // Title generation
  let title = '';
  let count = 0;
  
  if (request.mode === 'Single' && request.param) {
    title = getParamLabel(request.param);
  } else if (request.mode === 'Full') {
    const selectedCount = result.results?.length || 0;
    title = `批量计算 (${selectedCount}项)`;
    count = selectedCount;
  }

  // Result summary generation
  let resultSummary = '';
  
  if (result.ok && result.results) {
    if (request.mode === 'Single') {
      // Single mode: "0.12 mm"
      const res = result.results[0];
      if (res) {
        resultSummary = `${res.value} ${res.unit}`;
      }
    } else {
      // Full mode: "a边漆膜0.12mm / b边... +2"
      // We want concise labels for summary: "a边漆膜" instead of "a边漆膜厚度" to save space
      const conciseLabels: Record<string, string> = {
        'AFilm': 'a边漆膜',
        'BFilm': 'b边漆膜',
        'ADie': 'a边挤压',
        'BDie': 'b边挤压',
      };

      const parts = result.results.slice(0, 2).map(r => {
        const label = conciseLabels[r.param] || r.label;
        return `${label}${r.value}${r.unit}`;
      });
      
      resultSummary = parts.join(' / ');
      
      if (result.results.length > 2) {
        resultSummary += ` +${result.results.length - 2}`;
      }
    }
  } else {
    resultSummary = '计算失败';
  }

  return { title, resultSummary, count };
}
