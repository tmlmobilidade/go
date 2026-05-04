/* * */

import { PAGE_ROUTES } from '@tmlmobilidade/consts';

/* * */

export function getGtfsScheduleDocUrl(ruleId: string): null | string {
	//

	const getRulesDocUrl = `${PAGE_ROUTES.auth.BASE}/reference/gtfs/schedule/rules/${ruleId}`;

	return getRulesDocUrl;
}
