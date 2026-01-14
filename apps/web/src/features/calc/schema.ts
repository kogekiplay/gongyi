import { z } from 'zod';

// Helper to create optional positive number schema
// Handle NaN from valueAsNumber
const optionalNumber = z.number()
  .or(z.nan())
  .transform(val => (isNaN(val) ? undefined : val))
  .pipe(z.number().min(0, "必须大于等于0").optional());

// Base schema with all possible fields
export const calcFormSchema = z.object({
  n: z.number({ invalid_type_error: "请输入导线根数" })
     .or(z.nan())
     .refine(val => !isNaN(val), "请输入有效数字")
     .pipe(z.number().int("必须是整数").min(1, "至少1根")),
  
  // A Side
  a_h_change: optionalNumber,
  a_h_bare: optionalNumber,
  a_shrink: optionalNumber,
  a_reserve: optionalNumber,
  
  // B Side
  b_h_change: optionalNumber,
  b_h_bare: optionalNumber,
  b_shrink: optionalNumber,
  b_reserve: optionalNumber,
  
  // Common
  paper_h: optionalNumber,
  center_paper_h: optionalNumber,
});

export type CalcFormValues = z.infer<typeof calcFormSchema>;

export const FIELD_LABELS: Record<keyof CalcFormValues, string> = {
  n: "导线根数 n",
  a_h_change: "a边换位线厚度",
  a_h_bare: "a边裸线厚度",
  b_h_change: "b边换位线厚度",
  b_h_bare: "b边裸线厚度",
  paper_h: "绝缘纸厚度",
  center_paper_h: "中心纸厚度",
  a_shrink: "a边收缩比",
  b_shrink: "b边收缩比",
  a_reserve: "a边预留模拉硬度",
  b_reserve: "b边预留模拉硬度",
};
