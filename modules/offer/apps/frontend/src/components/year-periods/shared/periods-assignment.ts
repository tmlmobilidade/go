import { type YearPeriod } from '@tmlmobilidade/go-types-offer';
import { type Permission } from '@tmlmobilidade/go-types-permissions';

import { getPeriodsPermissions } from './periods-permissions';

/* * */

/** Assignment updates the whole period, so the selected operators must match its complete set. */
export function getAssignablePeriods({ agencyIds, periods, userPermissions }: { agencyIds: string[], periods: YearPeriod[], userPermissions?: Permission[] }) {
	return periods.filter((period) => {
		const matchesOperators = period.agency_ids.length === agencyIds.length && period.agency_ids.every(id => agencyIds.includes(id));
		const permissions = getPeriodsPermissions({ currentAgencyIds: period.agency_ids, selectedAgencyIds: period.agency_ids, userPermissions });
		return !period.is_locked && matchesOperators && permissions.update;
	});
}
