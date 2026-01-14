import { Card, CardContent, AccordionItem } from '../../../components/ui';
import { CalcResult } from '../types';

interface FormulaCardProps {
  result: CalcResult | null;
  className?: string;
}

export function FormulaCard({ result, className }: FormulaCardProps) {
  if (!result || !result.ok || !result.results?.[0]) return null;

  const item = result.results[0];

  return (
    <Card className={className}>
      <CardContent className="p-0">
        <AccordionItem 
            title={<span className="text-base font-semibold text-[var(--text)]">公式与参数回显</span>} 
            className="px-6 border-0"
        >
            <div className="pt-2 space-y-3 text-sm">
                <div>
                    <span className="text-[var(--muted)] block mb-1">使用公式 ID:</span>
                    <code className="px-2 py-1 bg-[var(--bg0)] border border-[var(--border)] rounded text-[var(--primary)] font-mono text-xs">
                        {item.formula_id}
                    </code>
                </div>
                
                <div>
                    <span className="text-[var(--muted)] block mb-1">输入回显 (Rust Core):</span>
                    <div className="grid grid-cols-2 gap-2">
                        {Object.entries(item.inputs_echo).map(([k, v]) => (
                            <div key={k} className="flex justify-between px-2 py-1 bg-[var(--bg0)] rounded border border-[var(--border)]">
                                <span className="text-[var(--muted)] text-xs">{k}</span>
                                <span className="font-medium text-xs text-[var(--text)]">{v}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AccordionItem>
      </CardContent>
    </Card>
  );
}
