import { Card, CardContent, CardHeader, CardTitle, Button } from '../../../components/ui';
import { CalcFormValues } from '../schema';
import { MouseEvent } from 'react';

interface PresetCardProps {
  onSelect: (values: Partial<CalcFormValues>) => void;
}

const PRESETS = [
  { label: '0.45 纸', values: { paper_h: 0.45 } },
  { label: '1.35 纸', values: { paper_h: 1.35 } },
  { label: '2.45 中心纸', values: { center_paper_h: 2.45 } },
  { label: '3.00 中心纸', values: { center_paper_h: 3.00 } },
  { label: '1 根导线', values: { n: 1 } },
  { label: '2 根导线', values: { n: 2 } },
];

export function PresetCard({ onSelect }: PresetCardProps) {
  const handleClick = (e: MouseEvent, values: Partial<CalcFormValues>) => {
    e.preventDefault();
    onSelect(values);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">常用模板</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              onClick={(e) => handleClick(e, preset.values)}
              className="text-xs"
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
