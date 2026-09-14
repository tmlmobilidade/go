/* * */

import { LinesModeSchema } from '@tmlmobilidade/go-types-offer';
import { OperationalDateSchema } from '@tmlmobilidade/go-types-shared';
import { z } from 'zod';

/* * */

export const OfferGtfsV29ExtractionPropertiesSchema = z.object({

	agency_ids: z.array(z.string()),

	calendars_clip_end_date: OperationalDateSchema,

	calendars_clip_start_date: OperationalDateSchema,

	feed_end_date: OperationalDateSchema,

	feed_start_date: OperationalDateSchema,

	lines_exclude: z.array(z.string()).default([]),

	lines_include: z.array(z.string()).default([]),

	lines_mode: LinesModeSchema.default('all'),

	numeric_calendar_codes: z.boolean().default(false),

	stop_sequence_start: z.number().default(1),

	stops_export_all: z.boolean().default(true),

});

export type OfferGtfsV29ExtractionProperties = z.infer<typeof OfferGtfsV29ExtractionPropertiesSchema>;
