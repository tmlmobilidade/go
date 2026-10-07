const BASE_URL = 'https://go.tmlmobilidade.pt/reference/gtfs/validation-rules-v2';

/* * */

export function getGtfsScheduleDocUrl(ruleId?: string): null | string {
	if (!ruleId) {
		return null;
	}

	return `${BASE_URL}/${ruleId}`;
}
