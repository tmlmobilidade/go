/* * */

import { ValidationsListFilterAgency } from '@/components/validations/list/filters/ValidationsListFilterAgency';
import { ValidationsListFilterProcessingStatus } from '@/components/validations/list/filters/ValidationsListFilterProcessingStatus';
import { ValidationsListFilterValidityStatus } from '@/components/validations/list/filters/ValidationsListFilterValidityStatus';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function ValidationsListFiltersBar() {
	return (
		<FiltersBar>
			<ValidationsListFilterAgency />
			<ValidationsListFilterProcessingStatus />
			<ValidationsListFilterValidityStatus />
		</FiltersBar>
	);
}
