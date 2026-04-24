/* * */

const GTFS_SCHEDULE_REFERENCE_BASE = 'https://go.tmlmobilidade.pt/reference/gtfs/schedule';

/** TML GTFS validation rules — [Regras](https://go.tmlmobilidade.pt/reference/gtfs/schedule/rules). */
export const GTFS_SCHEDULE_RULES_DOC_URL = `${GTFS_SCHEDULE_REFERENCE_BASE}/rules`;

const GTFS_SCHEDULE_FILES_DOC_BASE = `${GTFS_SCHEDULE_REFERENCE_BASE}/files`;

const DOC_SLUG_PATTERN = /^[a-z0-9_]+$/;

/* * */

export function getGtfsScheduleDocUrl(fileName: string): null | string {
	//

	const trimmed = fileName.trim();
	if (!trimmed) return null;

	const basename = trimmed.replace(/^.*[/\\]/, '');
	const withoutTxt = basename.toLowerCase().replace(/\.txt$/i, '');
	if (!withoutTxt) return null;

	const slug = GTFS_SCHEDULE_FILES_DOC_BASE[withoutTxt] ?? withoutTxt;
	if (!DOC_SLUG_PATTERN.test(slug)) return null;

	return `${GTFS_SCHEDULE_FILES_DOC_BASE}/${slug}`;

	//
}
