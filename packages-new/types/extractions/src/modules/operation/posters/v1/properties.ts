/* * */

import { z } from 'zod';

/* * */

const PosterPropertiesSchema = z.object({

	agency_ids: z.array(z.string()),

	canvas_profile: z.enum(['auto', '0Master.A', '0Master.B', '0Master.C', '0Master.F']),

	content: z.enum(['all', 'stops']),

	download_url: z.string().optional().nullable(),

	filter_mode: z.enum(['include', 'exclude']).optional(),

	plan_ids: z.array(z.string()),

	stop_ids: z.array(z.string()).optional(),

});

// Normalize older extraction properties before validating the saved filter.
export const OperationPostersV1ExtractionPropertiesSchema = z.preprocess((value) => {
	if (!value || typeof value !== 'object' || Array.isArray(value)) return value;

	const { filter_mode: filterMode, ...properties } = value as Record<string, unknown>;
	const content = properties.content === undefined ? properties.content_mode : properties.content;
	return {
		...properties,
		content,
		...(content === 'stops' && { filter_mode: filterMode === undefined ? properties.stops_mode ?? 'include' : filterMode }),
	};
}, PosterPropertiesSchema);

export type OperationPostersV1ExtractionProperties = z.infer<typeof OperationPostersV1ExtractionPropertiesSchema>;
