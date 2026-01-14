import { motion } from 'framer-motion';
import { Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { Button, Card, CardContent, CardHeader, CardTitle, useToast } from '../../../components/ui';
import { CalcResult } from '../types';

interface ResultCardProps extends React.HTMLAttributes<HTMLDivElement> {
  result: CalcResult | null;
}

export function ResultCard({ result, className, ...props }: ResultCardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = () => {
    if (!result?.results?.[0]) return;
    const val = result.results[0].value.toString();
    navigator.clipboard.writeText(val);
    setCopied(true);
    toast({ type: 'success', title: '已复制', description: `结果 ${val} 已复制到剪贴板`, duration: 2000 });
    setTimeout(() => setCopied(false), 2000);
  };

  if (!result) {
    return (
      <Card className={className} {...props}>
        <CardHeader><CardTitle>计算结果</CardTitle></CardHeader>
        <CardContent className="flex items-center justify-center min-h-[160px] text-[var(--muted)]">
          等待输入...
        </CardContent>
      </Card>
    );
  }

  if (!result.ok || !result.results?.length) {
    return (
      <Card className={className} {...props}>
        <CardHeader><CardTitle className="text-red-500">错误</CardTitle></CardHeader>
        <CardContent>
          <div className="text-red-600 bg-red-50 p-4 rounded-md">
            {result.error?.message || "未知错误"}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Dashboard usually shows single primary result or list. 
  // We'll show the first one prominently.
  const primary = result.results[0];

  return (
    <Card className={className} {...props}>
      <CardHeader className="pb-2">
        <CardTitle>计算结果</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={primary.value} // re-animate on change
            className="flex flex-col items-center justify-center py-6"
        >
            <div className="text-sm text-[var(--muted)] mb-1">{primary.label}</div>
            <div className="flex items-baseline gap-1 relative group">
                <span className="text-[48px] font-bold text-[var(--primary)] tracking-tight">
                    {primary.value}
                </span>
                <span className="text-lg text-[var(--muted)] font-medium">
                    {primary.unit}
                </span>
                
                <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute -right-12 top-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={handleCopy}
                >
                    {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                </Button>
            </div>
            <div className="mt-4 flex gap-2">
                <div className="px-2 py-1 bg-[var(--bg0)] rounded text-xs text-[var(--muted)] border border-[var(--border)]">
                    精度: {primary.decimals}位
                </div>
                <div className="px-2 py-1 bg-[var(--bg0)] rounded text-xs text-[var(--muted)] border border-[var(--border)]">
                    公式: {primary.formula_id}
                </div>
            </div>
        </motion.div>
      </CardContent>
    </Card>
  );
}
