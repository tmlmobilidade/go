import { type Annotation } from '@tmlmobilidade/go-types-dates';
import { toCalendarDate } from '@tmlmobilidade/go-types-shared';

import { type DatesAnnotationsV1OutputRow, DatesAnnotationsV1OutputRowSchema } from './types.js';

/* * */

/** Keeps dates and reference IDs together on one row per annotation. */
export function formatAnnotationCsvRow(annotation: Annotation, agencyNames: ReadonlyMap<string, string>): DatesAnnotationsV1OutputRow {
	return DatesAnnotationsV1OutputRowSchema.parse({
		agency_ids: annotation.agency_ids.join(' | '),
		category: annotation.category ?? '',
		dates: [...new Set(annotation.dates)].sort((a, b) => a - b).map(toCalendarDate).join(' | '),
		description: annotation.description ?? '',
		id: annotation._id,
		impact: annotation.impact ?? '',
		location_ids: (annotation.locations ?? []).map(location => location.osm_id).join(' | '),
		locations: (annotation.locations ?? []).map(location => location.name).join(' | '),
		operators: annotation.agency_ids.map(id => agencyNames.get(id) ?? id).join(' | '),
		sources: JSON.stringify(annotation.sources),
		title: annotation.title,
	});
}
