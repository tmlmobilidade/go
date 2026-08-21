/* * */

import { openCreatePeriodModal } from '@/components/year-periods/create/PeriodCreate.modal';
import { usePeriodsListContext } from '@/components/year-periods/list/PeriodsList.context';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { Button, HasPermission, Label, SearchField, Spacer, Toolbar } from '@tmlmobilidade/ui';

/* * */

export function PeriodsListHeader() {
	//

	//
	// A. Setup variables

	const periodsListContext = usePeriodsListContext();

	//
	// B. Render components

	return (
		<Toolbar>
			<Label size="lg" caps singleLine>Períodos</Label>
			<Spacer />
			<SearchField onChange={periodsListContext.filters.search.set} value={periodsListContext.filters.search.value} />
			<HasPermission action={PermissionCatalog.all.year_periods.actions.create} scope={PermissionCatalog.all.year_periods.scope}>
				<Button label="Novo período" leftSection={<IconPlus />} onClick={openCreatePeriodModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
