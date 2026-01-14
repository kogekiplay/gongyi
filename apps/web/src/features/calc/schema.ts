import { z } from 'zod';
import { ParamType, CalcMode } from './types';

// Helper to create optional positive number schema
// Handle NaN from valueAsNumber
const optionalNumber = z.number()
  .or(z.nan())
  .transform(val => (isNaN(val) ? undefined : val))
  .pipe(z.number().min(0, "必须大于等于0").optional());

// Helper for required positive number
const requiredNumber = z.number({ invalid_type_error: "必填" })
  .or(z.nan())
  .refine(val => !isNaN(val), "必填")
  .pipe(z.number().min(0, "必须大于等于0"));

// Base fields always present
const baseSchema = {
  n: z.number({ invalid_type_error: "请输入导线根数" })
     .or(z.nan())
     .refine(val => !isNaN(val), "请输入有效数字")
     .pipe(z.number().int("必须是整数").min(1, "至少1根")),
};

export const createCalcSchema = (mode: CalcMode, param?: ParamType) => {
  // Full mode: all fields optional except n (or maybe all required? let's keep optional for now as it's a big form)
  if (mode === 'Full') {
    return z.object({
      ...baseSchema,
      a_h_change: optionalNumber,
      a_h_bare: optionalNumber,
      a_shrink: optionalNumber,
      a_reserve: optionalNumber,
      b_h_change: optionalNumber,
      b_h_bare: optionalNumber,
      b_shrink: optionalNumber,
      b_reserve: optionalNumber,
      paper_h: optionalNumber,
      center_paper_h: optionalNumber,
    });
  }

  // Single mode: make visible fields required
  const schema: any = { ...baseSchema };

  if (param === 'AFilm') {
    schema.a_h_change = requiredNumber;
    schema.a_h_bare = requiredNumber;
    schema.paper_h = requiredNumber;
  } else if (param === 'BFilm') {
    schema.b_h_change = requiredNumber;
    schema.b_h_bare = requiredNumber;
    schema.paper_h = requiredNumber;
    schema.center_paper_h = requiredNumber;
  } else if (param === 'ADie') {
    schema.a_h_bare = requiredNumber;
    schema.a_shrink = requiredNumber;
    schema.a_reserve = requiredNumber;
  } else if (param === 'BDie') {
    schema.b_h_bare = requiredNumber;
    schema.b_shrink = requiredNumber;
    schema.b_reserve = requiredNumber;
  }

  return z.object(schema);
};

// Default schema for type inference
export const calcFormSchema = createCalcSchema('Full'); 
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
