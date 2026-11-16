import { z } from 'zod';

/* * */

export const DatesAnnotationsV1OutputRowSchema = z.object({
	agencies: z.string(),
	agency_ids: z.string(),
	category: z.string(),
	dates: z.string(),
	description: z.string(),
	id: z.string(),
	impact: z.string(),
	location_ids: z.string(),
	locations: z.string(),
	sources: z.string(),
	title: z.string(),
});

export type DatesAnnotationsV1OutputRow = z.infer<typeof DatesAnnotationsV1OutputRowSchema>;

export const DatesAnnotationsV1CsvColumns = ['id', 'title', 'locations', 'location_ids', 'dates', 'category', 'agencies', 'agency_ids', 'description', 'sources', 'impact'] satisfies (keyof DatesAnnotationsV1OutputRow)[];
