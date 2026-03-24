/* * */

import { AlertCauseSchema, AlertEffectSchema, AlertReferencesSchema, AlertReferenceTypeSchema, RideNormalizedSchema } from '@tmlmobilidade/types';
import { z } from 'zod';

/* * */

export const DescribeAlertPropsBaseSchema = z.object({
	cause: AlertCauseSchema,
	effect: AlertEffectSchema,
	reference_type: AlertReferenceTypeSchema,
	references: AlertReferencesSchema,
});

const DescribeAlertPropsAgencySchema = DescribeAlertPropsBaseSchema.extend({
	data: z.array(z.object({
		display_name: z.string(),
		id: z.string(),
		name: z.string(),
	})).default([]),
	type: z.literal('agency'),
});

const DescribeAlertPropsLinesSchema = DescribeAlertPropsBaseSchema.extend({
	data: z.array(z.object({
		id: z.string(),
		long_name: z.string(),
		short_name: z.string(),
		stops: z.array(z.object({
			id: z.string(),
			long_name: z.string(),
		})),
	})).default([]),
	type: z.literal('lines'),
});

const DescribeAlertPropsRidesSchema = DescribeAlertPropsBaseSchema.extend({
	data: z.array(RideNormalizedSchema).default([]),
	type: z.literal('rides'),
});

const DescribeAlertPropsStopsSchema = DescribeAlertPropsBaseSchema.extend({
	data: z.array(z.object({
		id: z.string(),
		lines: z.array(z.object({
			id: z.string(),
			long_name: z.string(),
			short_name: z.string(),
		})),
		long_name: z.string(),
	})).default([]),
	type: z.literal('stops'),
});

export const DescribeAlertPropsSchema = z.discriminatedUnion('type', [
	DescribeAlertPropsAgencySchema,
	DescribeAlertPropsLinesSchema,
	DescribeAlertPropsRidesSchema,
	DescribeAlertPropsStopsSchema,
]);

/* * */

export type DescribeAlertProps = z.infer<typeof DescribeAlertPropsSchema>;
