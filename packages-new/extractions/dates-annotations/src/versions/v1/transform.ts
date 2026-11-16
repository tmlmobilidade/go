import { type Annotation } from '@tmlmobilidade/go-types-dates';
import { summarizeLocations } from '@tmlmobilidade/go-types-locations';
import { toCalendarDate } from '@tmlmobilidade/go-types-shared';

import { type DatesAnnotationsV1OutputRow, DatesAnnotationsV1OutputRowSchema } from './types.js';

/* * */

function toSingleLine(value: string): string {
	return value.replace(/\s*[\r\n\u2028\u2029]+\s*/g, ' ').trim();
}

/* * */

/** Keeps dates and reference IDs together on one row per annotation. */
export function formatAnnotationCsvRow(annotation: Annotation, agencyNames: ReadonlyMap<string, string>): DatesAnnotationsV1OutputRow {
	return DatesAnnotationsV1OutputRowSchema.parse({
		agencies: annotation.agency_ids.map(id => toSingleLine(agencyNames.get(id) ?? id)).join(' | '),
		agency_ids: annotation.agency_ids.join(' | '),
		category: annotation.category ?? '',
		dates: [...new Set(annotation.dates)].sort((a, b) => a - b).map(toCalendarDate).join(' | '),
		description: toSingleLine(annotation.description ?? ''),
		id: annotation._id,
		impact: toSingleLine(annotation.impact ?? ''),
		location_ids: (annotation.locations ?? []).map(location => location.osm_id).join(' | '),
		locations: summarizeLocations(annotation.locations ?? [], true).map(location => toSingleLine(location.label)).join(' | '),
		sources: JSON.stringify(annotation.sources.map(source => ({ ...source, name: toSingleLine(source.name) }))),
		title: toSingleLine(annotation.title),
	});
}
