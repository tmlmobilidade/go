/* * */

import { ValidationsListFilterAgency } from '@/components/validations/list/ValidationsListFilterAgency';
import { ValidationsListFilterProcessingStatus } from '@/components/validations/list/ValidationsListFilterProcessingStatus';
import { ValidationsListFilterValidityStatus } from '@/components/validations/list/ValidationsListFilterValidityStatus';
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
