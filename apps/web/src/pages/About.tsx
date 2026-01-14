import { Card, CardContent, CardHeader, CardTitle } from '../components/ui';

export function About() {
  return (
    <Card>
      <CardHeader><CardTitle>关于</CardTitle></CardHeader>
      <CardContent>
        <div className="text-[var(--muted)] space-y-2">
            <p>UI作者：张奇</p>
            <p>基于 Rust Core 计算核心</p>
            <p>工艺计算器 Web/Desktop 版</p>
            <div className="pt-4 border-t border-[var(--border)]">
                <p className="text-xs">v2.0.0 Surge Style</p>
                <p className="text-xs mt-1">Build 2026.01</p>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
