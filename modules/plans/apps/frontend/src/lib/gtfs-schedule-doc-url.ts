/* * */

export function getGtfsScheduleDocUrl(ruleId: string): null | string {
	//

	if (!ruleId) {
		return null;
	}

	const getBaseUrl = 'https://go.tmlmobilidade.pt/reference/gtfs/schedule/rules';

	return `${getBaseUrl}/${ruleId}`;
}
