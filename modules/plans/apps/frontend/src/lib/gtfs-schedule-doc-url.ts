/* * */

import { API_ROUTES } from '@tmlmobilidade/consts';

/* * */

export function getGtfsScheduleDocUrl(ruleId: string): null | string {
	//

	const getRulesDocUrl = `${API_ROUTES.auth.BASE}/reference/gtfs/schedule/rules/${ruleId}`;

	return getRulesDocUrl;
}
