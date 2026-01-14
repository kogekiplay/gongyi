import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { calcFormSchema, CalcFormValues, FIELD_LABELS } from './schema';
import { Button, Input, Label } from '../../components/ui';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui';
import { CalcMode, ParamType } from './types';
import { useEffect } from 'react';
import { RotateCcw } from 'lucide-react';

interface DynamicFormProps {
  mode: CalcMode;
  param?: ParamType; // For Single mode
  onSubmit: (data: CalcFormValues) => void;
  defaultValues?: Partial<CalcFormValues>;
  updates?: Partial<CalcFormValues> | null;
  className?: string;
  isSubmitting?: boolean;
}

// Fields required for each param type
const REQUIRED_FIELDS: Record<ParamType, (keyof CalcFormValues)[]> = {
  AFilm: ['n', 'a_h_change', 'a_h_bare', 'paper_h'],
  BFilm: ['n', 'b_h_change', 'b_h_bare', 'paper_h', 'center_paper_h'],
  ADie: ['n', 'a_h_bare', 'a_shrink', 'a_reserve'],
  BDie: ['n', 'b_h_bare', 'b_shrink', 'b_reserve'],
};

// All fields for Full mode
const FULL_FIELDS: (keyof CalcFormValues)[] = [
  'n', 'paper_h', 'center_paper_h',
  'a_h_change', 'a_h_bare', 'a_shrink', 'a_reserve',
  'b_h_change', 'b_h_bare', 'b_shrink', 'b_reserve'
];

export function DynamicForm({ mode, param, onSubmit, defaultValues, updates, className, isSubmitting }: DynamicFormProps) {
  const form = useForm<CalcFormValues>({
    resolver: zodResolver(calcFormSchema) as any,
    defaultValues: defaultValues || { n: 1 },
  });

  const { register, handleSubmit, formState: { errors }, reset, setValue } = form;

  // Determine which fields to show
  const visibleFields = mode === 'Single' && param 
    ? REQUIRED_FIELDS[param] 
    : FULL_FIELDS;

  // Reset form when defaultValues change (e.g. history restore)
  useEffect(() => {
    if (defaultValues) {
      reset(defaultValues);
    }
  }, [defaultValues, reset]);

  // Handle updates from PresetCard
  useEffect(() => {
    if (updates) {
      Object.entries(updates).forEach(([key, value]) => {
        if (value !== undefined) {
          setValue(key as keyof CalcFormValues, value as any, { shouldValidate: true });
        }
      });
    }
  }, [updates, setValue]);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>输入参数</CardTitle>
        <Button variant="ghost" size="sm" onClick={() => reset({ n: 1 })} title="重置">
            <RotateCcw size={14} />
        </Button>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {visibleFields.map((field) => (
              <div key={field as string} className="space-y-1.5">
                <Label htmlFor={field as string}>{FIELD_LABELS[field]}</Label>
                <Input
                  id={field as string}
                  type="number"
                  step={field === 'n' ? "1" : "0.01"}
                  placeholder="0.00"
                  className={errors[field] ? "border-red-500 focus-visible:ring-red-500" : ""}
                  {...register(field, { valueAsNumber: true })}
                />
                {errors[field] && (
                  <span className="text-xs text-red-500">{errors[field]?.message}</span>
                )}
              </div>
            ))}
          </div>
          
          <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
            {isSubmitting ? '计算中...' : '开始计算'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
