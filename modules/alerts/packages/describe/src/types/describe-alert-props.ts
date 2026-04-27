/* * */

import { AgencySchema, AlertCauseSchema, AlertEffectSchema, AlertReferencesSchema, AlertReferenceTypeSchema, OperationalLineSchema, OperationalStopSchema, RideNormalizedSchema } from '@tmlmobilidade/types';
import { z } from 'zod';

/* * */

export const DescribeAlertPropsBaseSchema = z.object({
	cause: AlertCauseSchema,
	effect: AlertEffectSchema,
	reference_type: AlertReferenceTypeSchema,
	references: AlertReferencesSchema,
});

const DescribeAlertPropsAgencySchema = DescribeAlertPropsBaseSchema.extend({
	data: AgencySchema,
	reference_type: z.literal('agency'),
});

const DescribeAlertPropsLinesSchema = DescribeAlertPropsBaseSchema.extend({
	data: z.array(OperationalLineSchema).default([]),
	reference_type: z.literal('lines'),
});

const DescribeAlertPropsRidesSchema = DescribeAlertPropsBaseSchema.extend({
	data: z.array(RideNormalizedSchema).default([]),
	reference_type: z.literal('rides'),
});

const DescribeAlertPropsStopsSchema = DescribeAlertPropsBaseSchema.extend({
	data: z.array(OperationalStopSchema).default([]),
	reference_type: z.literal('stops'),
});

export const DescribeAlertPropsSchema = z.discriminatedUnion('reference_type', [
	DescribeAlertPropsAgencySchema,
	DescribeAlertPropsLinesSchema,
	DescribeAlertPropsRidesSchema,
	DescribeAlertPropsStopsSchema,
]);

/* * */

export type DescribeAlertProps = z.infer<typeof DescribeAlertPropsSchema>;
