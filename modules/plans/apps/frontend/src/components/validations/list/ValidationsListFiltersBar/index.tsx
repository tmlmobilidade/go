/* * */

import { ValidationsListFilterAgency } from '@/components/validations/list/ValidationsListFilterAgency';
import { ValidationsListFilterProcessingStatus } from '@/components/validations/list/ValidationsListFilterProcessingStatus';
import { FiltersBar } from '@tmlmobilidade/ui';

/* * */

export function ValidationsListFiltersBar() {
	return (
		<FiltersBar>
			<ValidationsListFilterAgency />
			<ValidationsListFilterProcessingStatus />
		</FiltersBar>
	);
}
