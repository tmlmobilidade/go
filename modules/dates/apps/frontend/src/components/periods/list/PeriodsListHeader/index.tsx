/* * */

import { openCreatePeriodModal } from '@/components/periods/detail/CreatePeriodModal';
import { usePeriodsListContext } from '@/contexts/PeriodsList.context';
import { IconPlus } from '@tabler/icons-react';
import { PermissionCatalog } from '@tmlmobilidade/types';
import { Button, HasPermission, Label, SearchInput, Spacer, Toolbar } from '@tmlmobilidade/ui';

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
			<SearchInput onChange={periodsListContext.actions.setFilterSearch} value={periodsListContext.filters.search} />
			<HasPermission action={PermissionCatalog.all.dates.actions.create_periods} scope={PermissionCatalog.all.dates.scope}>
				<Button label="Novo período" leftSection={<IconPlus />} onClick={openCreatePeriodModal} />
			</HasPermission>
		</Toolbar>
	);

	//
}
