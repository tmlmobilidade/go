import { OperationalDateSchema } from '@/_common/operational-date.js';
import { z } from 'zod';

/* * */

export const VkmCalculationMethodValues = [
	'rolling_year',
	'fixed_range',
] as const;

export const VkmCalculationMethodSchema = z.enum(VkmCalculationMethodValues);
export type VkmCalculationMethod = z.infer<typeof VkmCalculationMethodSchema>;

export const VkmExtensionSourceValues = [
	'shape',
	'stop_times',
	'go',
] as const;

export const VkmExtensionSourceSchema = z.enum(VkmExtensionSourceValues);
export type VkmExtensionSource = z.infer<typeof VkmExtensionSourceSchema>;

export const LegacyVkmDayTypeSchema = z.enum(['1', '2', '3']);
export type LegacyVkmDayType = z.infer<typeof LegacyVkmDayTypeSchema>;

/* * */

export const CalculateVkmSchema = z.object({
	agency_id: z.string(),
	calculation_method: VkmCalculationMethodSchema,
	end_date: OperationalDateSchema.nullable().optional(),
	extension_source: VkmExtensionSourceSchema,
	start_date: OperationalDateSchema,
});

export const VkmCalculationInputsSchema = z.object({
	agency_id: z.string(),
	agency_name: z.string(),
	calculation_method: VkmCalculationMethodSchema,
	end_date: OperationalDateSchema,
	price_per_km: z.number(),
	start_date: OperationalDateSchema,
	total_vkm_per_year: z.number(),
});

export const VkmPeriodResultSchema = z.object({
	code: z.string().nullable(),
	day_type_one: z.number(),
	day_type_three: z.number(),
	day_type_two: z.number(),
	id: z.string().nullable(),
	name: z.string(),
	total: z.number(),
});

export const VkmCalculationResultSchema = z.object({
	day_type_one: z.number(),
	day_type_three: z.number(),
	day_type_two: z.number(),
	inputs: VkmCalculationInputsSchema,
	periods: z.array(VkmPeriodResultSchema),
	total_from_distance: z.number(),
	total_from_shape: z.number(),
	total_in_euros: z.number(),
	total_relative_to_contract: z.number(),
});

/* * */

export type CalculateVkmDto = z.infer<typeof CalculateVkmSchema>;
export type VkmCalculationInputs = z.infer<typeof VkmCalculationInputsSchema>;
export type VkmCalculationResult = z.infer<typeof VkmCalculationResultSchema>;
export type VkmPeriodResult = z.infer<typeof VkmPeriodResultSchema>;
